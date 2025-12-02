
import { supabase } from '@/lib/customSupabaseClient';

// Helper function to handle potential errors from Supabase
const handleSupabaseError = (error, context) => {
  if (error) {
    console.error(`Error in ${context}:`, error);
    throw new Error(`Falha na operação de ${context}: ${error.message}`);
  }
};

/**
 * Fetches the commercial hierarchy (supervisors and their sellers) using an RPC call.
 * @returns {Promise<Array<{supervisor_nome: string, vendedores: string[]}>>} A promise that resolves to the hierarchy data.
 */
export const getCommercialHierarchy = async () => {
  const { data, error } = await supabase.rpc('get_commercial_hierarchy');
  handleSupabaseError(error, 'getCommercialHierarchy');
  return data;
};

/**
 * Fetches clients for the comodato module, with optional status filtering.
 * @param {string} statusFilter - The status to filter by (e.g., 'ativo', 'inativo'). 'Todos' fetches all.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of client objects.
 */
export const getClientesComodato = async (statusFilter = 'Todos') => {
  let query = supabase.from('apoio_clientes_comodato').select('*');

  if (statusFilter && statusFilter !== 'Todos') {
    query = query.eq('status_contrato', statusFilter.toLowerCase());
  }

  const { data, error } = await query.order('nome_fantasia', { ascending: true });
  handleSupabaseError(error, 'getClientesComodato');
  return data || [];
};

/**
 * Updates the 'apto_comodato' status for a specific client.
 * @param {string} clienteId - The UUID of the client to update.
 * @param {boolean} newValue - The new boolean value for 'apto_comodato'.
 * @returns {Promise<{success: boolean, message: string}>} An object indicating the result of the operation.
 */
export const updateAptoComodato = async (clienteId, newValue) => {
  const { error } = await supabase
    .from('apoio_clientes_comodato')
    .update({ apto_comodato: newValue, data_atualizacao: new Date().toISOString() })
    .eq('id', clienteId);

  if (error) {
    console.error('Error updating apto_comodato:', error);
    return { success: false, message: `Erro ao atualizar: ${error.message}` };
  }
  return { success: true, message: 'Status de aptidão atualizado com sucesso.' };
};

/**
 * Syncs clients from the `bd_cl_inv` table into the `apoio_clientes_comodato` table.
 * This function is designed to be idempotent, using upsert on the client's fantasy name.
 * @returns {Promise<{processed: number, error: string|null}>} An object with the count of processed clients.
 */
export const syncClientesComodatoFromBdClInv = async () => {
    const { data, error } = await supabase.rpc('sync_clientes_comodato');
    if (error) {
        console.error('Error in syncClientesComodatoFromBdClInv RPC:', error);
        return { processed: 0, error: error.message };
    }
    return { processed: data?.processed_count || 0, error: null };
};

/**
 * Calls an RPC function to automatically mark clients as 'apto_comodato' based on inventory data.
 * @returns {Promise<{success: boolean, updated_count: number, message: string}>} Result of the operation.
 */
export const autoMarkAptoComodato = async () => {
    const { data, error } = await supabase.rpc('auto_update_apto_comodato');
    if (error) {
        console.error('Error in autoMarkAptoComodato RPC:', error);
        return { success: false, updated_count: 0, message: error.message };
    }
    return { success: data.success, updated_count: data.updated_count, message: 'Marcação automática concluída.' };
};

/**
 * Fetches detailed client information by its UUID from the `apoio_clientes_comodato` table
 * and attempts to enrich it with data from the ERP tables (`bd-cl` and `bd_cl_inv`).
 * @param {string} p_uuid - The UUID of the client.
 * @returns {Promise<object>} A promise that resolves to the client's detailed information.
 */
export const getClienteDetalhesByUuid = async (p_uuid) => {
  const { data, error } = await supabase.rpc('get_cliente_detalhes_by_uuid', { p_uuid });
  handleSupabaseError(error, 'getClienteDetalhesByUuid');
  return data;
};

/**
 * Fetches all active supervisors from the 'bd-cl' table.
 * @returns {Promise<string[]>} A promise that resolves to an array of supervisor names.
 */
export const getSupervisors = async () => {
  const { data, error } = await supabase
    .from('bd-cl')
    .select('"Nome Supervisor"');

  handleSupabaseError(error, 'getSupervisors');
  
  const supervisorSet = new Set();
  if (data) {
    data.forEach(item => {
      const supervisorName = item['Nome Supervisor'];
      if (supervisorName && supervisorName.trim() !== '' && supervisorName.toLowerCase() !== 'não definido') {
        supervisorSet.add(supervisorName.trim());
      }
    });
  }
  return Array.from(supervisorSet).sort();
};

/**
 * Fetches all active sellers from the 'bd-cl' table.
 * @returns {Promise<string[]>} A promise that resolves to an array of seller names.
 */
export const getVendedores = async () => {
  const { data, error } = await supabase
    .from('bd-cl')
    .select('"Nome Vendedor"');

  handleSupabaseError(error, 'getVendedores');

  const sellerSet = new Set();
  if (data) {
    data.forEach(item => {
      const sellerName = item['Nome Vendedor'];
      if (sellerName && sellerName.trim() !== '' && sellerName.toLowerCase() !== 'não definido') {
        sellerSet.add(sellerName.trim());
      }
    });
  }
  return Array.from(sellerSet).sort();
};

/**
 * Fetches all customer groups from the 'bd-cl' table.
 * @returns {Promise<string[]>} A promise that resolves to an array of customer group names.
 */
export const getCustomerGroups = async () => {
  const { data, error } = await supabase
    .from('bd-cl')
    .select('"Nome Grp Cliente"');

  handleSupabaseError(error, 'getCustomerGroups');

  const groupSet = new Set();
  if (data) {
    data.forEach(item => {
      const groupName = item['Nome Grp Cliente'];
      if (groupName && groupName.trim() !== '' && groupName.toLowerCase() !== 'não definido') {
        groupSet.add(groupName.trim());
      }
    });
  }
  return Array.from(groupSet).sort();
};

/**
 * Fetches all regions from the 'bd-cl' table.
 * @returns {Promise<string[]>} A promise that resolves to an array of region names.
 */
export const getRegions = async () => {
  const { data, error } = await supabase
    .from('bd-cl')
    .select('"Desc.Regiao"');

  handleSupabaseError(error, 'getRegions');

  const regionSet = new Set();
  if (data) {
    data.forEach(item => {
      const regionName = item['Desc.Regiao'];
      if (regionName && regionName.trim() !== '') {
        regionSet.add(regionName.trim());
      }
    });
  }
  return Array.from(regionSet).sort();
};

/**
 * Fetches all clients from the 'bd-cl' table.
 * @returns {Promise<string[]>} A promise that resolves to an array of client names.
 */
export const getClients = async () => {
  const { data, error } = await supabase
    .from('bd-cl')
    .select('"N Fantasia", "Nome"');

  handleSupabaseError(error, 'getClients');

  const clientSet = new Set();
  if (data) {
    data.forEach(item => {
      const clientName = item['N Fantasia'] || item['Nome'];
      if (clientName && clientName.trim() !== '') {
        clientSet.add(clientName.trim());
      }
    });
  }
  return Array.from(clientSet).sort();
};

/**
 * Searches for equipment inventory in the `bd_cl_inv` table.
 * @param {string} searchTerm - The term to search for (Fantasia, Equipamento, or Chapa).
 * @returns {Promise<Array<object>>} A promise that resolves to an array of inventory items.
 */
export const searchEquipmentInventory = async (searchTerm) => {
  let query = supabase.from('bd_cl_inv').select('*');

  if (searchTerm) {
    // Using a raw filter string for OR condition across multiple columns
    query = query.or(`Fantasia.ilike.%${searchTerm}%,Equipamento.ilike.%${searchTerm}%,AA3_CHAPA.ilike.%${searchTerm}%`);
  }

  const { data, error } = await query.limit(50);
  handleSupabaseError(error, 'searchEquipmentInventory');
  return data || [];
};

/**
 * Fetches professionals formatted for select inputs.
 * @returns {Promise<Array<{value: string, label: string}>>}
 */
export const getProfissionaisParaSelect = async () => {
  const { data, error } = await supabase
    .from('users_unified')
    .select('id, nome')
    .eq('status', 'ativo')
    .order('nome');

  if (error) {
    console.error('Error fetching professionals:', error);
    return [];
  }

  return data.map(user => ({
    value: user.id,
    label: user.nome
  }));
};

/**
 * Fetches equipment in comodato for a specific client.
 * @param {string} clienteId
 * @returns {Promise<Array<object>>}
 */
export const getEquipamentosComodatoByCliente = async (clienteId) => {
  const { data, error } = await supabase
    .from('apoio_equipamentos_comodato')
    .select(`
      *,
      modelo:apoio_modelos_equipamentos(nome_modelo)
    `)
    .eq('cliente_id', clienteId);

  if (error) {
    console.error('Error fetching client equipment:', error);
    throw error;
  }

  return data.map(item => ({
    ...item,
    nome_modelo: item.modelo?.nome_modelo
  }));
};

/**
 * Syncs equipment models from the inventory table.
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const syncModelosEquipamentosFromBdClInv = async () => {
    // Try calling the edge function
    const { data, error } = await supabase.functions.invoke('sync-modelos-equipamentos');
    
    if (error) {
        console.error('Error invoking sync-modelos-equipamentos:', error);
        return { success: false, message: error.message };
    }
    
    return { success: true, message: 'Sincronização iniciada.' };
};

const apoioSyncService = {
  getSupervisors,
  getVendedores,
  getCustomerGroups,
  getRegions,
  getClients,
  getCommercialHierarchy,
  getClientesComodato,
  updateAptoComodato,
  syncClientesComodatoFromBdClInv,
  autoMarkAptoComodato,
  getClienteDetalhesByUuid,
  searchEquipmentInventory,
  getProfissionaisParaSelect,
  getEquipamentosComodatoByCliente,
  syncModelosEquipamentosFromBdClInv
};

export default apoioSyncService;
