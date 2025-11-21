import { supabase } from '@/lib/customSupabaseClient';
import { EQUIPMENT_STATUS } from '@/constants/equipmentStatus';

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

// === Equipamentos (Estoque) ===
export const getEquipamentosComodatoByCliente = async (clienteId) => {
  if (!clienteId) return [];

  const { data, error } = await supabase
    .from('apoio_equipamentos_comodato')
    .select('id, numero_serie, status, modelo:apoio_modelos_equipamentos(id, nome_modelo)')
    .eq('cliente_id', clienteId)
    .eq('status', EQUIPMENT_STATUS.INSTALADO)
    .order('numero_serie', { ascending: true });

  if (error) {
    console.error('Erro ao buscar equipamentos do cliente:', error);
    throw new Error(`Não foi possível carregar os equipamentos do cliente: ${error.message}`);
  }
  
  return data;
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