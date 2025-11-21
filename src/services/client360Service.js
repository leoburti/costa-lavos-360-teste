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
    const startDate = new Date(today.getFullYear(), today.getMonth() - 12, 1).toISOString().split('T')[0]; // Last 12 months
    const endDate = today.toISOString().split('T')[0];

    // 1. Commercial Data (Sales, KPIs, Products)
    const { data: commercialData, error: commError } = await supabase.rpc('get_client_360_data_v2', {
      p_start_date: startDate,
      p_end_date: endDate,
      p_exclude_employees: true,
      p_supervisors: null,
      p_sellers: null,
      p_customer_groups: null,
      p_regions: null,
      p_clients: null,
      p_search_term: null,
      p_products: null,
      p_show_defined_groups_only: false,
      p_target_client_code: client.codigo,
      p_target_store: client.loja
    });

    if (commError) console.error('Error fetching commercial data:', commError);

    // 2. Support Data (Tickets, Equipment, Agenda, Geo)
    const { data: supportData, error: suppError } = await supabase.rpc('get_cliente_apoio_dados', {
      p_nome: client.nome,
      p_fantasia: client.nome_fantasia
    });

    if (suppError) console.error('Error fetching support data:', suppError);

    // 3. Inventory Data (Sold Equipment)
    const { data: inventoryData, error: invError } = await supabase
      .from('bd_cl_inv')
      .select('*')
      .eq('Codigo', client.codigo)
      .eq('Loja', client.loja);

    if (invError) console.error('Error fetching inventory:', invError);

    // 4. CRM Data (Contacts, Deals) - Try to match by CNPJ if available
    let crmData = { contacts: [], deals: [] };
    if (client.cnpj) {
        const cleanCnpj = client.cnpj.replace(/\D/g, '');
        if (cleanCnpj.length > 0) {
            const { data: contacts, error: crmError } = await supabase
                .from('crm_contacts')
                .select('*, crm_deals(*)')
                .ilike('cnpj', `%${cleanCnpj}%`);
            
            if (!crmError && contacts) {
                crmData.contacts = contacts;
                crmData.deals = contacts.flatMap(c => c.crm_deals || []);
            }
        }
    }

    // 5. Documents (Attachments from tickets)
    let documents = [];
    if (supportData?.found && supportData.chamados?.length > 0) {
        const chamadoIds = supportData.chamados.map(c => c.id);
        const { data: attachments, error: attachError } = await supabase
            .from('apoio_chamados_anexos')
            .select('*')
            .in('chamado_id', chamadoIds)
            .order('data_upload', { ascending: false });
        
        if (!attachError && attachments) {
            documents = attachments;
        }
    }

    return {
      basicInfo: client,
      commercial: commercialData && commercialData.length > 0 ? commercialData[0] : null,
      support: supportData?.found ? supportData : { found: false, chamados: [], equipamentos: [], agenda: [], geolocalizacao: [] },
      inventory: inventoryData || [],
      crm: crmData,
      documents: documents
    };
  }
};