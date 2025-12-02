import { apiClient } from '@/lib/apiClient';

/**
 * Wrapper for RPC calls using the robust ApiClient.
 * This maintains backward compatibility with existing imports.
 */
export const supabaseRPC = {
  /**
   * Calls a Supabase RPC function.
   * 
   * @param {string} functionName - The name of the RPC function.
   * @param {object} params - The parameters to pass to the function.
   * @param {object} options - Options for timeout and retries.
   */
  async callRPC(functionName, params = {}, options = {}) {
    // Delegate to the robust ApiClient
    const { data, error } = await apiClient.callRpc(functionName, params, options);

    if (error) {
      // Maintain expected return signature for existing consumers (some might expect to catch)
      // However, returning { data: null, error } is safer than throwing in async/await chains unless handled
      return null; 
    }

    return data;
  },

  /**
   * Explicit version that returns { data, error } object instead of just data or null
   */
  async callRPCWithResponse(functionName, params = {}, options = {}) {
    return await apiClient.callRpc(functionName, params, options);
  }
};