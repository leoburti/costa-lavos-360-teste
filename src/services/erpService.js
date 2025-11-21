import { supabase } from '@/lib/customSupabaseClient';

// Placeholder functions for ERP integration

export const getDadosCliente = async (clienteId) => {
  console.log(`Buscando dados completos para o cliente ${clienteId} no ERP.`);
  // In a real scenario, this would make an API call to the ERP
  return {
    limiteCredito: 10000,
    condicaoPagamento: '30/60/90',
    historicoFaturamento: [
      { mes: '2025-10', valor: 12000 },
      { mes: '2025-09', valor: 11500 },
    ],
  };
};

export const getStatusContrato = async (clienteId) => {
  console.log(`Buscando status do contrato para o cliente ${clienteId} no ERP.`);
  return { status: 'Ativo', dataVencimento: '2026-12-31' };
};

export const getFaturamento = async (clienteId) => {
  console.log(`Buscando faturamento para o cliente ${clienteId} no ERP.`);
  return { faturamentoUltimos12Meses: 145000 };
};

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

    if (error) throw error;
    return data || { kpi: {}, dailySales: [], rankings: {} };
  } catch (error) {
    console.error('Error fetching overview data:', error);
    throw error;
  }
};