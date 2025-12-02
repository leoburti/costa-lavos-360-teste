import { supabase } from '@/lib/customSupabaseClient';

/**
 * @deprecated Este arquivo está obsoleto. A lógica foi migrada para 'services/api.js' e 'services/analytics.js'.
 * Mantido para referência, mas não deve ser usado para novas implementações.
 */

console.warn("WARNING: `services/analyticsRpcService.js` is deprecated and should be removed. Use `services/api.js` and `services/analytics.js` instead.");

const FUNCTION_PARAMETER_MAP = {
  get_dashboard_and_daily_sales_kpis: {
    acceptedParams: [
      'p_start_date', 'p_end_date', 'p_previous_start_date', 'p_previous_end_date',
      'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups',
      'p_regions', 'p_clients', 'p_search_term', 'p_show_defined_groups_only'
    ],
    defaults: {
      p_exclude_employees: true,
      p_show_defined_groups_only: false,
      p_search_term: null,
      p_clients: null,
      p_customer_groups: null,
      p_regions: null,
      p_sellers: null,
      p_supervisors: null,
      p_previous_start_date: null,
      p_previous_end_date: null
    }
  },
  
  get_overview_data_v2: {
    acceptedParams: [
      'p_start_date', 'p_end_date', 'p_previous_start_date', 'p_previous_end_date',
      'p_exclude_employees', 'p_supervisors', 'p_sellers', 'p_customer_groups',
      'p_regions', 'p_clients', 'p_search_term', 'p_show_defined_groups_only'
    ],
    defaults: {
      p_exclude_employees: true,
      p_show_defined_groups_only: false
    }
  }
};

const GLOBAL_PARAMETER_MAPPING = {
  startDate: 'p_start_date',
  endDate: 'p_end_date',
  previousStartDate: 'p_previous_start_date',
  previousEndDate: 'p_previous_end_date',
  clients: 'p_clients',
  customerGroups: 'p_customer_groups',
  regions: 'p_regions',
  sellers: 'p_sellers',
  supervisors: 'p_supervisors',
  searchTerm: 'p_search_term',
  excludeEmployees: 'p_exclude_employees',
  showDefinedGroupsOnly: 'p_show_defined_groups_only',
  limit: 'p_limit',
  offset: 'p_offset'
};

function sanitizeValue(value) {
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    if (typeof value[0] === 'object' && value[0] !== null && 'value' in value[0]) {
      return value.map(v => v.value);
    }
    return value;
  }
  return value;
}

function mapParametersForFunction(functionName, frontendParams) {
  const cleanName = functionName.startsWith('rpc:') ? functionName.replace('rpc:', '') : functionName;
  const config = FUNCTION_PARAMETER_MAP[cleanName];
  
  const acceptedParams = config ? config.acceptedParams : Object.values(GLOBAL_PARAMETER_MAPPING);
  
  const backendParams = config ? { ...config.defaults } : {};

  for (const [key, value] of Object.entries(frontendParams)) {
    let backendKey = key;
    
    if (!key.startsWith('p_')) {
      backendKey = GLOBAL_PARAMETER_MAPPING[key] || null;
    }

    if (backendKey && (!config || acceptedParams.includes(backendKey))) {
        const finalValue = sanitizeValue(value);
        if (finalValue !== undefined) {
           backendParams[backendKey] = finalValue;
        }
    }
  }

  return backendParams;
}

export async function callAnalyticsFunction(functionName, params, options = {}) {
  const cleanFunctionName = functionName.startsWith('rpc:') ? functionName.substring(4) : functionName;
  
  try {
    const mappedParams = mapParametersForFunction(cleanFunctionName, params);
    const { data, error } = await supabase.rpc(cleanFunctionName, mappedParams);

    if (error) {
      console.error('RPC Error:', error);
      return { data: null, error };
    }

    return {
      data: data || [],
      error: null,
    };

  } catch (error) {
    console.error(`[AnalyticsRPC] Exception in ${cleanFunctionName}:`, error);
    return {
      data: [],
      error: {
        code: error.code || 'UNKNOWN',
        message: error.message || String(error)
      },
    };
  }
}