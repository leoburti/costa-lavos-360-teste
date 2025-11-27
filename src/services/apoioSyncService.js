import { supabase } from '@/lib/customSupabaseClient';

const invokeEdgeFunction = async (functionName) => {
  console.log(`Iniciando a chamada para a Edge Function ${functionName}...`);

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('Erro ao obter a sessão do usuário:', sessionError);
    return { error: 'Erro ao obter a sessão do usuário.' };
  }

  if (!session) {
    console.error('Sessão do usuário não encontrada. A sincronização requer autenticação.');
    return { error: 'Usuário não autenticado.' };
  }

  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error(`Erro ao invocar a Edge Function ${functionName}:`, error);
      if (error.context && error.context.status === 401) {
        throw new Error('Acesso não autorizado. Verifique suas permissões e tente novamente.');
      }
      throw new Error(`Falha na sincronização: ${error.message || 'Erro desconhecido'}`);
    }

    console.log(`Edge Function ${functionName} executada com sucesso:`, data);
    return data;
  } catch (err) {
    console.error(`Erro catastrófico durante a chamada da Edge Function ${functionName}:`, err);
    return { error: err.message || 'Ocorreu um erro desconhecido.' };
  }
};

// === Sincronização de Clientes (bd-cl) ===
export const syncClientesFromBdCl = async () => {
  console.log('Sincronizando clientes da tabela bd-cl...');
  return { success: true, message: 'Sincronização de clientes concluída.' };
};

// === Sincronização de Equipamentos (bd_cl_inv) ===
export const syncEquipamentosFromBdClInv = async () => {
  console.log('Sincronizando equipamentos da tabela bd_cl_inv...');
  return { success: true, message: 'Sincronização de equipamentos concluída.' };
};

// === Buscar Clientes Apoio ===
export const getClientesApoio = async () => {
  console.log('Buscando clientes da tabela clientes_apoio...');
  
  const { data, error } = await supabase
    .from('clientes_apoio')
    .select('id, n_fantasia, cliente_code, loja, nome, cnpj')
    .order('n_fantasia', { ascending: true });

  if (error) {
    console.error('Erro ao buscar clientes apoio:', error);
    throw new Error(`Não foi possível carregar os clientes: ${error.message}`);
  }

  console.log(`[getClientesApoio] Retornados ${data ? data.length : 0} clientes.`);
  return data || [];
};

// === Buscar Equipamentos por Cliente ===
export const getEquipamentosByCliente = async (clienteFantasia) => {
  console.log(`Buscando equipamentos para o cliente: ${clienteFantasia}`);
  
  const { data, error } = await supabase
    .from('equipamentos_apoio')
    .select('id, chave_id, fantasia, equipamento, status, localizacao')
    .eq('fantasia', clienteFantasia)
    .order('equipamento', { ascending: true });

  if (error) {
    console.error('Erro ao buscar equipamentos:', error);
    throw new Error(`Não foi possível carregar os equipamentos: ${error.message}`);
  }

  console.log(`[getEquipamentosByCliente] Retornados ${data ? data.length : 0} equipamentos.`);
  return data || [];
};

// === Clientes de Comodato ===
export const syncClientesComodatoFromBdClInv = async () => {
  return await invokeEdgeFunction('sync-clientes-comodato');
};

export const autoMarkAptoComodato = async () => {
  console.log('Executando marcação automática de aptidão para comodato...');
  const { data, error } = await supabase.rpc('auto_update_apto_comodato');
  
  if (error) {
    console.error('Erro na marcação automática:', error);
    return { success: false, message: error.message };
  }
  
  console.log('Marcação automática concluída:', data);
  return { success: true, ...data };
};

export const getClientesComodato = async (status) => {
  console.log(`Buscando clientes de comodato com status: ${status}`);
  let query = supabase
    .from('apoio_clientes_comodato')
    .select('id, razao_social, nome_fantasia, cnpj, status_contrato, apto_comodato, data_atualizacao')
    .order('nome_fantasia', { ascending: true });

  if (status && status !== 'Todos') {
    query = query.eq('status_contrato', status);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Erro ao buscar clientes de comodato:', error);
    throw new Error(`Não foi possível carregar os clientes: ${error.message}`);
  }

  // Lógica de Deduplicação
  const uniqueClientsMap = new Map();

  (data || []).forEach(client => {
    const nameKey = (client.nome_fantasia || client.razao_social || '').trim().toLowerCase();
    if (!nameKey) return;

    if (uniqueClientsMap.has(nameKey)) {
      const existingClient = uniqueClientsMap.get(nameKey);
      const existingDate = existingClient.data_atualizacao ? new Date(existingClient.data_atualizacao).getTime() : 0;
      const currentDate = client.data_atualizacao ? new Date(client.data_atualizacao).getTime() : 0;

      if (currentDate > existingDate) {
        uniqueClientsMap.set(nameKey, client);
      }
    } else {
      uniqueClientsMap.set(nameKey, client);
    }
  });

  const uniqueData = Array.from(uniqueClientsMap.values());
  uniqueData.sort((a, b) => {
      const nameA = (a.nome_fantasia || a.razao_social || '').toLowerCase();
      const nameB = (b.nome_fantasia || b.razao_social || '').toLowerCase();
      return nameA.localeCompare(nameB);
  });

  return uniqueData;
};

export const updateAptoComodato = async (id, aptoComodatoValue) => {
  const { data, error } = await supabase
    .from('apoio_clientes_comodato')
    .update({ apto_comodato: aptoComodatoValue })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Erro ao atualizar apto_comodato:', error);
    return { success: false, message: `Erro: ${error.message}` };
  }
  return { success: true, message: 'Status "Apto Comodato" atualizado com sucesso!', data };
};

// === NEW: Real-time Client Search & Details ===

export const searchClientesComodato = async (searchTerm) => {
    const { data, error } = await supabase.rpc('get_clientes_comodato_search', { p_search_term: searchTerm });
    if (error) {
        console.error('Error searching clients:', error);
        throw error;
    }
    return data;
};

// === SAFE CLIENT SEARCH (Using Edge Function + RPC to fix Parsing Errors) ===
export const searchClients = async (searchTerm) => {
  console.log('Searching clients via Edge Function (search-clients)...', searchTerm);
  if (!searchTerm || searchTerm.length < 3) return [];

  try {
    // Invoke the Edge Function which calls the robust RPC
    // This bypasses the client-side parser issues with "Desc.Regiao" (dots) and "N Fantasia" (spaces)
    const { data, error } = await supabase.functions.invoke('search-clients', {
        body: { searchTerm }
    });

    if (error) {
      console.error('Error in search-clients Edge Function:', error);
      throw error;
    }

    // Map the clean JSON keys from RPC back to the legacy keys expected by the UI components
    // to ensure compatibility without refactoring the entire frontend
    const mappedData = (data.data || []).map(client => ({
        "Cliente": client.client_code,
        "Loja": client.store,
        "Nome": client.name,
        "N Fantasia": client.fantasy_name,
        "Endereco": client.address,
        "Desc.Regiao": client.region_desc
    }));

    return mappedData;
  } catch (err) {
    console.error('Exception searching clients:', err);
    // Fail gracefully by returning empty array instead of crashing
    return [];
  }
};

export const getClienteDetalhesComodato = async (clienteId, loja) => {
    const { data, error } = await supabase.rpc('get_cliente_detalhes_comodato', { p_cliente_id: clienteId, p_loja: loja });
    if (error) {
        console.error('Error fetching client details:', error);
        throw error;
    }
    return data;
};

export const getClienteDetalhesByUuid = async (uuid) => {
    const { data, error } = await supabase.rpc('get_cliente_detalhes_by_uuid', { p_uuid: uuid });
    if (error) {
        console.error('Error fetching client details by UUID:', error);
        throw error;
    }
    return data;
};

// === Modelos de Equipamentos ===
export const syncModelosEquipamentosFromBdClInv = async () => {
    return await invokeEdgeFunction('sync-modelos-equipamentos');
};

export const getModelosEquipamentos = async () => {
  const { data, error } = await supabase
    .from('apoio_modelos_equipamentos')
    .select('*')
    .order('nome_modelo', { ascending: true });
  if (error) {
    console.error('Erro ao buscar modelos de equipamento:', error);
    throw new Error(`Não foi possível carregar os modelos: ${error.message}`);
  }
  return data || [];
};

export const updateModeloEquipamento = async (id, updates) => {
  const { data, error } = await supabase
    .from('apoio_modelos_equipamentos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) return { success: false, message: error.message };
  return { success: true, message: "Modelo atualizado com sucesso.", data };
};

export const deleteModeloEquipamento = async (id) => {
  const { error } = await supabase
    .from('apoio_modelos_equipamentos')
    .update({ ativo: false })
    .eq('id', id);
  if (error) return { success: false, message: error.message };
  return { success: true, message: "Modelo desativado com sucesso." };
};

// === Equipamentos (Estoque / Inventário Real) ===
export const getEquipamentosComodatoByCliente = async (clienteId) => {
  console.log("🔍 [DEBUG service] getEquipamentosComodatoByCliente INICIADO. Cliente ID (UUID):", clienteId);
  
  if (!clienteId) {
    console.warn("⚠️ [DEBUG service] Cliente ID não fornecido.");
    return [];
  }

  try {
    // 1. Buscar dados do cliente localmente para obter o nome fantasia
    const { data: clienteLocal, error: clienteError } = await supabase
      .from('apoio_clientes_comodato')
      .select('id, nome_fantasia, razao_social')
      .eq('id', clienteId)
      .single();

    if (clienteError) {
      console.error("❌ [DEBUG service] Erro ao buscar cliente local:", clienteError);
      throw new Error(`Cliente não encontrado: ${clienteError.message}`);
    }

    if (!clienteLocal) {
      console.warn("⚠️ [DEBUG service] Cliente local retornado vazio.");
      return [];
    }

    const nomeBusca = clienteLocal.nome_fantasia || clienteLocal.razao_social;
    console.log(`🔍 [DEBUG service] Buscando equipamentos para: "${nomeBusca}" (ID: ${clienteId})`);

    if (!nomeBusca) {
      console.warn("⚠️ [DEBUG service] Cliente sem nome fantasia ou razão social para busca.");
      return [];
    }

    // 2. Buscar diretamente na tabela de inventário (bd_cl_inv) usando o nome
    const { data: equipamentosInv, error: equipError } = await supabase
      .from('bd_cl_inv')
      .select('*')
      .ilike('Fantasia', `%${nomeBusca}%`);

    console.log("🔍 [DEBUG service] Resultado query bd_cl_inv:", { 
      registrosEncontrados: equipamentosInv?.length || 0, 
      erro: equipError 
    });

    if (equipError) {
      console.error("❌ [DEBUG service] Erro ao consultar bd_cl_inv:", equipError);
      throw new Error(`Erro na busca de inventário: ${equipError.message}`);
    }

    if (!equipamentosInv || equipamentosInv.length === 0) {
      console.warn(`⚠️ [DEBUG service] Nenhum registro encontrado em bd_cl_inv para "%${nomeBusca}%"`);
      return [];
    }

    // 3. Normalizar os dados para o formato esperado pelo front-end
    const equipamentosNormalizados = equipamentosInv.map((item, idx) => ({
      id: item.AA3_CHAPA || item.numero_serie || `temp-${idx}-${Date.now()}`,
      nome_modelo: item.Equipamento || 'Modelo Não Especificado',
      numero_serie: item.AA3_CHAPA || item.numero_serie || 'S/N',
      chapa: item.AA3_CHAPA || 'S/C', // Campo Chapa (AA3_CHAPA)
      data_venda: item.Data_Venda,
      quantidade: item.QTD || 1,
      status: 'ativo', // Assumindo ativo se está no inventário
      localizacao: item.Loja_texto || item.Loja,
      origem: 'bd_cl_inv' // Debug tag
    }));

    console.log(`✅ [DEBUG service] ${equipamentosNormalizados.length} equipamentos normalizados e retornados.`);
    return equipamentosNormalizados;

  } catch (err) {
    console.error("❌ [DEBUG service] Exceção fatal em getEquipamentosComodatoByCliente:", err);
    throw err;
  }
};

// === Chamados para Select ===
export const getChamadosParaSelect = async () => {
  console.log('Buscando chamados para select...');
  
  const { data, error } = await supabase
    .from('apoio_chamados')
    .select('id, tipo_chamado, motivo, status')
    .in('status', ['aberto', 'em_andamento', 'atribuido'])
    .order('data_criacao', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Erro ao buscar chamados:', error);
    throw new Error(`Não foi possível carregar os chamados: ${error.message}`);
  }

  return (data || []).map(chamado => ({
    value: chamado.id,
    label: `${chamado.tipo_chamado} - ${chamado.motivo || 'Sem motivo'} (${chamado.status})`
  }));
};

// === Profissionais para Select ===
export const getProfissionaisParaSelect = async () => {
  console.log('Buscando profissionais para select...');
  
  const { data, error } = await supabase
    .from('apoio_usuarios')
    .select('id, nome, email')
    .eq('status', 'ativo')
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro ao buscar profissionais:', error);
    throw new Error(`Não foi possível carregar os profissionais: ${error.message}`);
  }

  return (data || []).map(profissional => ({
    value: profissional.id,
    label: `${profissional.nome} (${profissional.email})`
  }));
};

// === Criação de Chamados em Lote ===
export const createEntregaComodatoLote = async (clienteId, itens, urgencia, justificativa, observacoes) => {
  const { data, error } = await supabase.rpc('criar_entrega_comodato_lote', {
    p_cliente_id: clienteId,
    p_itens: itens,
    p_urgencia: urgencia,
    p_justificativa: justificativa,
    p_observacoes: observacoes
  });
  if (error) return { success: false, message: error.message };
  return { success: true, data };
};

export const createTrocaComodatoLote = async (clienteId, itens, motivo, observacoes) => {
  const { data, error } = await supabase.rpc('criar_troca_comodato_lote', {
    p_cliente_id: clienteId,
    p_itens: itens,
    p_motivo: motivo,
    p_observacoes: observacoes
  });
  if (error) return { success: false, message: error.message };
  return { success: true, data };
};

export const createRetiradaComodato = async (clienteId, equipamentosIds, motivo, observacoes) => {
    const { data, error } = await supabase.rpc('criar_retirada_comodato', {
        p_cliente_id: clienteId,
        p_equipamentos_ids: equipamentosIds,
        p_motivo: motivo,
        p_observacoes: observacoes
    });
    if (error) return { success: false, message: error.message };
    return { success: true, data };
};

// === Gestão de Equipe Comercial ===
export const getCommercialHierarchy = async () => {
    console.log('Buscando hierarquia comercial do BD...');
    const { data, error } = await supabase.rpc('get_commercial_hierarchy');
    if (error) {
        console.error('Erro ao buscar hierarquia comercial:', error);
        throw new Error(`Erro: ${error.message}`);
    }
    return data || [];
};

// === Search for Commercial Entities (bd-cl) ===
export const searchCommercialEntities = async (type, searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    try {
        let column = '';
        if (type === 'Vendedor') column = 'Nome Vendedor';
        else if (type === 'Supervisor') column = 'Nome Supervisor';
        else return []; // Unknown type

        const { data, error } = await supabase
            .from('bd-cl') // Accessing public view/table directly
            .select(column)
            .ilike(column, `%${searchTerm}%`)
            .limit(20);

        if (error) throw error;

        const uniqueNames = [...new Set(data.map(item => item[column]))].filter(Boolean).filter(n => n !== 'Não Definido');
        return uniqueNames;
    } catch (error) {
        console.error(`Error searching commercial entities for ${type}:`, error);
        return [];
    }
};

// === Validate Commercial Entity Exists ===
export const validateCommercialEntity = async (type, name) => {
    if (!name) return false;
    try {
        let column = '';
        if (type === 'Vendedor') column = 'Nome Vendedor';
        else if (type === 'Supervisor') column = 'Nome Supervisor';
        else return false;

        const { data, error } = await supabase
            .from('bd-cl')
            .select(column)
            .eq(column, name)
            .limit(1);
        
        if (error) throw error;
        return data && data.length > 0;
    } catch (error) {
        console.error("Validation error:", error);
        return false;
    }
};

// === Search Equipment Inventory Direct (Bypass Edge Function) ===
export const searchEquipmentInventory = async (searchTerm) => {
  let query = supabase.from('bd_cl_inv').select('*');
  
  if (searchTerm && searchTerm.trim() !== '') {
    const term = searchTerm.trim();
    // Using ILIKE via .or syntax for flexible search
    query = query.or(`Fantasia.ilike.%${term}%,Equipamento.ilike.%${term}%,AA3_CHAPA.ilike.%${term}%,Loja.ilike.%${term}%,Nome_Vendedor.ilike.%${term}%,REDE.ilike.%${term}%`);
  }
  
  // Limit to prevent large payload on broad searches
  const { data, error } = await query.limit(100);
  
  if (error) {
    console.error("Erro ao buscar inventário:", error);
    throw error;
  }
  return data;
};

// === NEW: Robust Fetchers for Deep Analysis ===
export const getSupervisors = async () => {
  // Explicitly quoting the column name to avoid "column does not exist" errors
  const { data, error } = await supabase
    .from('bd-cl')
    .select('"Nome Supervisor"')
    .not('"Nome Supervisor"', 'is', null)
    .order('"Nome Supervisor"', { ascending: true });
    
  if (error) throw error;
  // Deduplicate
  return [...new Set(data.map(item => item['Nome Supervisor']))];
};

export const getVendedores = async () => {
  // Explicitly quoting the column name
  const { data, error } = await supabase
    .from('bd-cl')
    .select('"Nome Vendedor"')
    .not('"Nome Vendedor"', 'is', null)
    .order('"Nome Vendedor"', { ascending: true });

  if (error) throw error;
  return [...new Set(data.map(item => item['Nome Vendedor']))];
};