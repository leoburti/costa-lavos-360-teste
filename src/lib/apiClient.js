
import { supabase } from '@/lib/customSupabaseClient';
import { CONFIG } from '@/constants/config';

/**
 * Utilitário central para chamadas RPC com retry inteligente e tratamento de erros específicos.
 * Implementa backoff exponencial e tratamento para PGRST203 (Function Overloading Ambiguity).
 */
export const apiClient = {
  async callRpc(functionName, params = {}, options = {}) {
    const {
      retryCount = 2,
      timeout = 25000 // 25s para queries pesadas de analytics
    } = options;

    let attempt = 0;
    let lastError = null;

    // Limpa parâmetros: remove undefined, mas mantém null (pois null é válido no SQL)
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined) acc[key] = value;
      return acc;
    }, {});

    while (attempt <= retryCount) {
      try {
        // Promise race para implementar timeout real no client-side
        const rpcPromise = supabase.rpc(functionName, cleanParams);
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Timeout calling ${functionName} after ${timeout}ms`)), timeout)
        );

        const { data, error } = await Promise.race([rpcPromise, timeoutPromise]);

        if (error) throw error;

        return { data, error: null };

      } catch (err) {
        lastError = err;
        const isOverloadingError = err.code === 'PGRST203'; // Ambiguous function
        const isTimeoutError = err.message?.includes('Timeout');
        const isNetworkError = !err.code && (err.message?.includes('fetch') || err.message?.includes('network'));

        // Logs de tentativa
        if (attempt < retryCount) {
          const isRetryable = isOverloadingError || isTimeoutError || isNetworkError;
          
          if (isRetryable) {
            const delay = isOverloadingError ? 1500 : 500 * Math.pow(2, attempt); 
            console.warn(`[API] Retry ${functionName} (${attempt + 1}/${retryCount}) in ${delay}ms. Reason: ${err.code || err.message}`);
            await new Promise(resolve => setTimeout(resolve, delay));
            attempt++;
            continue;
          }
        }
        
        break; // Erro não retryable ou esgotou tentativas
      }
    }

    console.error(`[API] Failed to call ${functionName} after ${attempt} attempts:`, lastError);
    return { data: null, error: lastError };
  }
};
