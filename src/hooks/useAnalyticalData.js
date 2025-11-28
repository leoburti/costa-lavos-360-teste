
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { useMemo } from 'react';

const STALE_TIME = 1000 * 60 * 5; // 5 minutes

const formatDateToAPI = (date) => date ? format(new Date(date), 'yyyy-MM-dd') : null;

// Mapa de parâmetros esperados por cada função RPC. Essencial para a consistência dos dados.
const rpcParamsMap = {
    get_all_drivers_for_delivery_management: [],
    get_abc_analysis: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term'],
    get_analytical_bonification: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term'],
    get_bonification_analysis: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term', 'p_show_defined_groups_only'],
    get_bonification_performance: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term', 'p_show_defined_groups_only', 'p_group_by'],
    get_bonification_distribution_drilldown: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term', 'p_drilldown_level', 'p_parent_keys'],
    get_bonification_performance_drilldown: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term', 'p_drilldown_level', 'p_parent_keys'],
    get_churn_analysis_data_v3: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term'],
    get_client_analysis: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term'],
    get_client_equipments: ['p_cliente_id', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term'],
    get_client_360_data_v2: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term', 'p_products', 'p_show_defined_groups_only', 'p_target_client_code', 'p_target_store'],
    get_dashboard_and_daily_sales_kpis: ['p_start_date', 'p_end_date', 'p_previous_start_date', 'p_previous_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term', 'p_show_defined_groups_only'],
    get_daily_sales_data: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term'],
    get_daily_sales_data_v2: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups'],
    get_deliveries_for_optimization: ['p_delivery_date', 'p_driver_id'],
    get_detailed_equipment_analysis: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term', 'p_show_defined_groups_only'],
    get_equipment_by_client: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term', 'p_show_defined_groups_only', 'p_grouping_level'],
    get_equipment_movement: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term'],
    get_group_sales_analysis: ['p_level', 'p_parent_key', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term', 'p_exclude_employees'],
    get_low_performance_clients: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term'],
    get_loyalty_analysis_drilldown: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term'],
    get_margin_analysis: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term', 'p_margin_ranges', 'p_products'],
    get_new_client_trends: ['p_start_date', 'p_end_date'],
    get_operational_analysis: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term', 'p_show_defined_groups_only', 'p_view_mode'],
    get_overview_data_v2: ['p_start_date', 'p_end_date', 'p_previous_start_date', 'p_previous_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term', 'p_show_defined_groups_only'],
    get_price_analysis: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term'],
    get_product_analysis: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term'],
    get_product_basket_analysis_v2: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term'],
    get_product_mix_analysis: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term', 'p_show_defined_groups_only'],
    get_projected_abc_analysis: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term'],
    get_rfm_analysis: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term'],
    get_seasonality_analysis: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term', 'p_products'],
    get_seller_analytical_data: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term'],
    get_supervisor_analytical_data: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term'],
    get_treemap_data: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term', 'p_analysis_mode', 'p_show_defined_groups_only'],
    get_drilldown_data: ['p_analysis_mode', 'p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term', 'p_show_defined_groups_only', 'p_drilldown_level', 'p_parent_keys'],
    get_customer_group_drilldown_data: ['p_start_date', 'p_end_date', 'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups', 'p_regions', 'p_clients', 'p_search_term', 'p_drilldown_level', 'p_parent_keys'],
    get_dashboard_xray_data: ['p_start_date', 'p_end_date', 'p_supervisors', 'p_regions'],
};

export const useAnalyticalData = (rpcName, filters = {}, options = {}) => {
  const { enabled = true, defaultValue = null } = options;

  const queryParams = useMemo(() => {
    const { dateRange, ...restFilters } = filters || {};
    
    const defaultStart = startOfMonth(new Date());
    const defaultEnd = endOfMonth(new Date());

    const allParams = {
      p_start_date: formatDateToAPI(dateRange?.from || defaultStart),
      p_end_date: formatDateToAPI(dateRange?.to || defaultEnd),
      ...restFilters, // Inclui p_analysis_mode, p_show_defined_groups_only, etc.
    };

    const validParamKeys = rpcParamsMap[rpcName];
    if (!validParamKeys) {
      console.warn(`[useAnalyticalData] RPC function "${rpcName}" não encontrada no rpcParamsMap. Todos os parâmetros serão enviados.`);
      return allParams;
    }

    const finalParams = {};
    for (const key of validParamKeys) {
      // Renomeia chaves camelCase para snake_case se necessário
      const snakeCaseKey = `p_${key.replace('p_', '').replace(/([A-Z])/g, '_$1').toLowerCase()}`;
      const originalKey = key;
      const camelCaseKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase()).replace('p_', '');
      const camelCaseWithP = `p_${camelCaseKey}`;

      if (allParams.hasOwnProperty(originalKey)) {
        finalParams[originalKey] = allParams[originalKey];
      } else if (allParams.hasOwnProperty(camelCaseWithP)) {
        finalParams[originalKey] = allParams[camelCaseWithP];
      } else if (allParams.hasOwnProperty(camelCaseKey)) {
         finalParams[originalKey] = allParams[camelCaseKey];
      }
    }
    
    return finalParams;

  }, [filters, rpcName]);
  
  const queryKey = [rpcName, queryParams];

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data: result, error: rpcError } = await supabase.rpc(rpcName, queryParams);
      
      if (rpcError) {
        console.error(`[useAnalyticalData] Erro ao chamar RPC ${rpcName}:`, {
            message: rpcError.message,
            details: rpcError.details,
            code: rpcError.code,
            params: queryParams,
        });
        throw new Error(rpcError.message || `Falha ao buscar dados de ${rpcName}`);
      }
      
      if (rpcName === 'get_drilldown_data' && result && typeof result === 'object' && 'data' in result) {
        return result; 
      }
      
      return result;
    },
    enabled,
    staleTime: STALE_TIME,
    placeholderData: (previousData) => previousData || defaultValue,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return { 
    data: data ?? defaultValue, 
    loading: isLoading || isFetching,
    error,
    refetch 
  };
};
