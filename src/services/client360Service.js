import { supabase } from '@/lib/customSupabaseClient';
import { format } from 'date-fns';

export const client360Service = {
  async searchClients(searchTerm, startDate, endDate) {
    if (!startDate || !endDate) return [];
    
    const formattedStart = startDate instanceof Date ? format(startDate, 'yyyy-MM-dd') : startDate;
    const formattedEnd = endDate instanceof Date ? format(endDate, 'yyyy-MM-dd') : endDate;

    const { data, error } = await supabase.rpc('get_clientes_visao_360_faturamento', {
      p_start_date: formattedStart,
      p_end_date: formattedEnd,
      p_search_term: searchTerm
    });

    if (error) {
      console.error('Error searching clients:', error);
      throw error;
    }
    return data || [];
  },

  async searchGroups(searchTerm, startDate, endDate) {
    if (!startDate || !endDate) return [];

    const formattedStart = startDate instanceof Date ? format(startDate, 'yyyy-MM-dd') : startDate;
    const formattedEnd = endDate instanceof Date ? format(endDate, 'yyyy-MM-dd') : endDate;

    const { data, error } = await supabase.rpc('get_grupos_visao_360_faturamento', {
      p_start_date: formattedStart,
      p_end_date: formattedEnd,
      p_search_term: searchTerm,
    });

    if (error) {
      console.error('Error searching groups:', error);
      throw error;
    }
    return data || [];
  },

  async getClientFullData(client) {
    if (!client || !client.codigo || !client.loja) throw new Error('Cliente inválido');

    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - 12, 1).toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    const { data: fullData, error: rpcError } = await supabase.rpc('get_client_360_data_v2', {
      p_start_date: startDate,
      p_end_date: endDate,
      p_target_client_code: client.codigo,
      p_target_store: client.loja
    });

    if (rpcError) {
      console.error('Error fetching client full data:', rpcError);
      throw rpcError;
    }

    return fullData && fullData.length > 0 ? fullData[0] : {
      basicInfo: client,
      commercial: null,
      support: { found: false, chamados: [], equipamentos: [], agenda: [], geolocalizacao: [] },
      inventory: [],
      crm: { contacts: [], deals: [] },
      documents: []
    };
  }
};