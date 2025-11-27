import { supabase } from '@/lib/customSupabaseClient';

export const getOverviewDataV2 = async (
  startDate,
  endDate,
  previousStartDate,
  previousEndDate,
  excludeEmployees,
  supervisors,
  sellers,
  customerGroups,
  regions,
  clients,
  searchTerm,
  showDefinedGroupsOnly
) => {
  try {
    // Using POST request to RPC if payload is large, or standard Supabase SDK call
    const { data, error } = await supabase.rpc('get_overview_data_v2', {
      p_start_date: startDate,
      p_end_date: endDate,
      p_previous_start_date: previousStartDate,
      p_previous_end_date: previousEndDate,
      p_exclude_employees: excludeEmployees,
      p_supervisors: supervisors,
      p_sellers: sellers,
      p_customer_groups: customerGroups,
      p_regions: regions,
      p_clients: clients,
      p_search_term: searchTerm,
      p_show_defined_groups_only: showDefinedGroupsOnly
    });

    if (error) {
        console.error("RPC Error:", error);
        throw error;
    }
    
    // Validate structure to prevent frontend crashes
    return data || { kpi: {}, dailySales: [], rankings: {} };
  } catch (error) {
    console.error('Error fetching overview data:', error);
    throw error;
  }
};

// --- Legacy / Placeholder functions ---
export const getDadosCliente = async (clienteId) => {
  return {
    limiteCredito: 10000,
    condicaoPagamento: '30/60/90',
    historicoFaturamento: [],
  };
};

export const getStatusContrato = async (clienteId) => {
  return { status: 'Ativo', dataVencimento: '2026-12-31' };
};

export const getFaturamento = async (clienteId) => {
  return { faturamentoUltimos12Meses: 0 };
};