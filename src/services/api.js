import { supabase } from '@/lib/customSupabaseClient';
import { CONFIG } from '@/constants/config';

/**
 * Utilitário central para chamadas RPC com retry inteligente e tratamento de erros específicos.
 * Implementa backoff exponencial e tratamento para PGRST203 (Function Overloading Ambiguity).
 */
export async function callRpc(functionName, params = {}, options = {}) {
  const {
    retryCount = 2, // Aumentado para 2 retries padrão
    timeout = CONFIG.API.TIMEOUT || 15000
  } = options;

  let attempt = 0;
  let lastError = null;

  // Sanitização de parâmetros: remove undefined, mantém null
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined) acc[key] = value;
    return acc;
  }, {});

  while (attempt <= retryCount) {
    try {
      // Promise race para implementar timeout real no client-side
      const rpcPromise = supabase.rpc(functionName, cleanParams);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout calling ${functionName} (${timeout}ms)`)), timeout)
      );

      const { data, error } = await Promise.race([rpcPromise, timeoutPromise]);

      if (error) throw error;

      return { data, error: null };

    } catch (err) {
      lastError = err;
      const isOverloadingError = err.code === 'PGRST203'; // Ambiguous function
      const isTimeoutError = err.message?.includes('Timeout');
      const isNetworkError = !err.code && err.message?.includes('fetch');

      // Logs de tentativa
      if (attempt < retryCount) {
        const isRetryable = isOverloadingError || isTimeoutError || isNetworkError;
        
        if (isRetryable) {
          const delay = isOverloadingError ? 2000 : 300 * Math.pow(2, attempt); // 2s fixo para overload, exp para outros
          console.warn(`[API] Retry ${functionName} (${attempt + 1}/${retryCount}) in ${delay}ms. Reason: ${err.code || err.message}`);
          await new Promise(resolve => setTimeout(resolve, delay));
          attempt++;
          continue;
        }
      }
      
      // Se chegou aqui, é erro terminal ou esgotou tentativas
      break;
    }
  }

  return { data: null, error: lastError };
}