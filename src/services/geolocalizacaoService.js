import { supabase } from '@/lib/customSupabaseClient';

export async function getCheckinCheckouts() {
  const { data, error } = await supabase
    .from('apoio_geolocalizacao_checkins')
    .select(`
      *,
      chamado:apoio_chamados(motivo),
      profissional:users_unified(nome)
    `)
    .order('data_hora', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createCheckinCheckout(data) {
  const rpcName = data.tipo === 'checkin' ? 'registrar_checkin' : 'registrar_checkout';
  
  const { data: result, error } = await supabase.rpc(rpcName, {
    p_chamado_id: data.chamado_id,
    p_profissional_id: data.profissional_id,
    p_latitude: data.latitude,
    p_longitude: data.longitude,
    p_precisao: data.precisao,
    p_endereco: data.endereco,
    p_foto_prova: data.foto_prova || null,
    p_observacoes: data.observacoes
  });

  if (error) throw error;
  return { success: true, data: result };
}

export const geolocalizacaoService = {
  async getRelatorioDeslocamento(dataInicio, dataFim, profissionalId = null) {
    const { data, error } = await supabase.rpc('get_relatorio_deslocamento', {
      p_data_inicio: dataInicio,
      p_data_fim: dataFim,
      p_profissional_id: profissionalId
    });
    if (error) throw error;
    return data;
  },

  async getRelatorioProdutividade(dataInicio, dataFim, profissionalId = null) {
    const { data, error } = await supabase.rpc('get_relatorio_produtividade', {
      p_data_inicio: dataInicio,
      p_data_fim: dataFim,
      p_profissional_id: profissionalId
    });
    if (error) throw error;
    return data;
  },

  async getRelatorioGeofencing(dataInicio, dataFim, profissionalId = null) {
    const { data, error } = await supabase.rpc('get_relatorio_geofencing', {
      p_data_inicio: dataInicio,
      p_data_fim: dataFim,
      p_profissional_id: profissionalId
    });
    if (error) throw error;
    return data;
  },

  async getRelatorioEquipe(dataInicio, dataFim) {
    const { data, error } = await supabase.rpc('get_relatorio_equipe_consolidado', {
      p_data_inicio: dataInicio,
      p_data_fim: dataFim
    });
    if (error) throw error;
    return data;
  },

  async getProfissionais() {
    const { data, error } = await supabase
      .from('users_unified')
      .select('id, nome')
      .eq('status', 'ativo')
      .order('nome');
    if (error) throw error;
    return data;
  }
};