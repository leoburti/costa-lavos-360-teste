
import { supabase } from '@/lib/customSupabaseClient';

export const enrichmentService = {
  /**
   * Busca dados enriquecidos cacheados no Supabase (CD_PJ_Basic)
   */
  async getCachedData(cnpj) {
    if (!cnpj) return null;
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    const { data, error } = await supabase
      .from('CD_PJ_Basic')
      .select('*')
      .eq('CNPJ', cleanCNPJ)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching cached enrichment data:', error);
    }
    return data;
  },

  /**
   * Busca dados detalhados do cliente.
   * Fluxo:
   * 1. Tenta buscar por CNPJ em CD_PJ_Basic.
   * 2. Se não achar, chama a API Directd (via Edge Function) e salva em CD_PJ_Basic.
   * 3. Se não tiver CNPJ, tenta buscar por nome (fallback).
   */
  async getEnrichedClientData(identifier) {
    try {
        let cnpjToSearch = null;

        // 1. Normalização do CNPJ
        if (typeof identifier === 'object' && identifier.cnpj) {
            cnpjToSearch = identifier.cnpj.replace(/\D/g, '');
        } else if (typeof identifier === 'string' && identifier.replace(/\D/g, '').length >= 14) {
            cnpjToSearch = identifier.replace(/\D/g, '');
        }

        // 2. Fluxo Principal (com CNPJ)
        if (cnpjToSearch) {
            // 2.1 Busca no Cache (DB)
            const { data: dbData } = await supabase
                .from('CD_PJ_Basic')
                .select('*')
                .eq('CNPJ', cnpjToSearch)
                .maybeSingle();

            if (dbData) {
                return { status: 'success', data: dbData, source: 'database' };
            }

            // 2.2 Busca na API Externa (Directd via Edge Function)
            console.log(`[Enrichment] Buscando CNPJ ${cnpjToSearch} na API Directd...`);
            const { data: apiResult, error: apiError } = await supabase.functions.invoke('fetch-directd-cnpj', {
                body: { cnpj: cnpjToSearch }
            });

            if (apiError) {
                console.error('[Enrichment] Erro na API Directd:', apiError);
                throw new Error('Falha ao consultar API externa.');
            }

            if (apiResult && (apiResult.cnpj || apiResult.u_cnpj)) {
                const mappedData = this._mapDirectdData(apiResult);
                
                // Salva no banco para cache futuro
                const { error: upsertError } = await supabase
                    .from('CD_PJ_Basic')
                    .upsert(mappedData, { onConflict: 'CNPJ' });

                if (upsertError) {
                    console.warn('[Enrichment] Erro ao salvar cache:', upsertError);
                }

                return { status: 'success', data: mappedData, source: 'directd' };
            } else {
                return { status: 'not_found', message: 'CNPJ não encontrado na base oficial.' };
            }
        }

        // 3. Fallback: Busca por Nome (Legado/Sem CNPJ)
        if (typeof identifier === 'string') {
             // Tenta encontrar CNPJ via link na tabela clientes_apoio
             const { data: linkData } = await supabase
                .from('clientes_apoio')
                .select('cnpj')
                .ilike('nome', `%${identifier}%`)
                .limit(1)
                .maybeSingle();
             
             if (linkData?.cnpj) {
                 // Se achou CNPJ pelo nome, reinicia o fluxo com o CNPJ encontrado (recursivo)
                 return this.getEnrichedClientData({ cnpj: linkData.cnpj });
             } 
             
             // Última tentativa: busca textual direta na CD_PJ_Basic
             const { data: directData } = await supabase
                .from('CD_PJ_Basic')
                .select('*')
                .ilike('nome_fantasia', `%${identifier}%`)
                .limit(1)
                .maybeSingle();
             
             if (directData) return { status: 'success', data: directData, source: 'database_name_match' };
             
             return { status: 'not_found', message: 'Cliente não encontrado por nome.' };
        }

        return { status: 'error', message: 'CNPJ não fornecido e busca por nome falhou.' };

    } catch (error) {
        console.error('Error getting enriched data:', error);
        return { status: 'error', message: error.message };
    }
  },

  /**
   * Mapeia resposta da API Directd para o formato da tabela CD_PJ_Basic
   */
  _mapDirectdData(data) {
      // Normaliza campos que podem vir com nomes diferentes dependendo da versão da API
      const cnpj = data.cnpj || data.u_cnpj;
      const razao = data.razao_social || data.nome || data.u_nome;
      const fantasia = data.nome_fantasia || data.fantasia || data.u_fantasia || razao;
      
      return {
          CNPJ: cnpj.replace(/\D/g, ''),
          razao_social: razao,
          nome_fantasia: fantasia,
          situacao_cadastral: data.situacao_cadastral || data.situacao,
          data_fundacao: data.data_inicio_atividade || data.abertura,
          logradouro: data.logradouro,
          numero: data.numero,
          complemento: data.complemento,
          bairro: data.bairro,
          cidade: data.municipio || data.cidade,
          uf: data.uf,
          cep: (data.cep || '').replace(/\D/g, ''),
          telefone: data.telefone_1 || data.telefone,
          email: data.email,
          porte: data.porte,
          natureza_juridica_descricao: data.natureza_juridica,
          cnae_principal_descricao: data.cnae_fiscal_descricao, 
          updated_at: new Date().toISOString()
      };
  },

  /**
   * Busca CNPJ pelo Nome Fantasia (Helper)
   */
  async findCNPJByFantasyName(fantasyName) {
      try {
          const { data } = await supabase
            .from('clientes_apoio')
            .select('cnpj')
            .ilike('nome', `%${fantasyName}%`)
            .limit(1);
          
          if (data && data.length > 0) return data[0].cnpj;
          
          const { data: basicData } = await supabase
            .from('CD_PJ_Basic')
            .select('CNPJ')
            .ilike('nome_fantasia', `%${fantasyName}%`)
            .limit(1);

          return basicData?.[0]?.CNPJ || null;
      } catch (e) {
          return null;
      }
  },

  /**
   * Google Places Search Logic V2
   */
  async getPlacesData(params) {
      try {
          const payload = typeof params === 'string' 
            ? { address: params, cnpj: arguments[1] } 
            : params;

          const { data, error } = await supabase.functions.invoke('fetch-google-places-v2', {
              body: payload
          });
          
          if (error) throw error;
          return data;
      } catch (error) {
          return { status: 'error', message: error.message };
      }
  }
};
