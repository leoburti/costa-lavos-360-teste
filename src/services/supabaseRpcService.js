import { supabase } from '@/lib/customSupabaseClient';
import { getAnalyticalData } from './analytics';

/**
 * @deprecated This file is obsolete and its logic has been merged into 'services/api.js' and 'services/analytics.js'.
 * This file is now a pass-through to the new service and will be removed in a future update.
 */

console.warn("WARNING: `services/supabaseRpcService.js` is deprecated. Update imports to use `services/api.js` or `services/analytics.js`.");

export async function callRpcFunction(functionName, params) {
    try {
        const { data, error } = await getAnalyticalData(functionName, params);
        if (error) throw error;
        return data;
    } catch (error) {
        const safeError = new Error(error.message || 'Erro de conexão com o servidor.');
        safeError.code = error.code;
        safeError.details = error.details;
        console.error(`[RPC Exception - Deprecated] ${functionName}:`, error);
        throw safeError;
    }
}

export function mapParametersToBackend(params, functionName) {
    // This function is obsolete as mapping is now handled inside analytics.js
    console.warn("mapParametersToBackend is deprecated.");
    return params;
}