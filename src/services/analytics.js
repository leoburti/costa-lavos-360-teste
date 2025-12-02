import { supabase } from '../lib/customSupabaseClient';

/**
 * Calls a Supabase RPC function.
 * @param {string} functionName - The name of the RPC function.
 * @param {object} params - The parameters to pass to the function.
 * @returns {Promise<any>} - The data returned by the RPC function.
 * @throws {Error} - If the RPC call fails.
 */
export async function callRpc(functionName, params) {
  const { data, error } = await supabase.rpc(functionName, params);

  if (error) {
    console.error(`Error calling RPC ${functionName}:`, error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Fetch Dashboard and Daily Sales KPIs
 */
export async function getDashboardAndDailySalesKpis(params) {
  return callRpc('get_dashboard_and_daily_sales_kpis', params);
}

/**
 * Análise de Dashboard Agregada (Otimizada)
 * Usa RPC server-side com paginação
 */
export async function getDashboardAggregatedData(params) {
  return callRpc('get_dashboard_aggregated_data', params);
}

/**
 * Get Analytics for a specific client (360 View)
 */
export async function getClientAnalytics(params) {
  return callRpc('get_client_analytics', params);
}

/**
 * Análise de Churn Otimizada
 * Usa RPC server-side com paginação
 */
export async function getChurnAnalysisData(params) {
  return callRpc('get_churn_analysis_data_v3_optimized', params);
}

export const analyticsService = {
  getDashboardAndDailySalesKpis,
  getDashboardAggregatedData,
  getClientAnalytics,
  getChurnAnalysisData,
  callRpc
};