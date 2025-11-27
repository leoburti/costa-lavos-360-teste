import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

/**
 * Custom hook to invoke Supabase Edge Functions with React Query features.
 * Handles caching, retries, and error reporting automatically.
 */
export const useEdgeFunctionQuery = (functionName, body = {}, options = {}) => {
  const { toast } = useToast();
  const { enabled = true, retry = 1, ...queryOptions } = options;

  return useQuery({
    queryKey: ['edge-function', functionName, body],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke(functionName, {
          body: JSON.stringify(body),
          headers: {
            'Content-Type': 'application/json',
            'X-Client-Info': 'costa-lavos-frontend' 
          },
        });

        if (error) {
          let errorMsg = error.message;
          // Try to parse error body if it's a JSON string
          try {
             const parsed = JSON.parse(error.message);
             if (parsed.error) errorMsg = parsed.error;
          } catch (e) { /* ignore */ }
          
          throw new Error(errorMsg || 'Falha na execução da função remota.');
        }

        return data;
      } catch (err) {
        console.error(`[EdgeFunction] Error in ${functionName}:`, err);
        
        if (!options.suppressErrorToast) {
           // Don't toast on cancellation or expected aborted requests
           if (err.name !== 'AbortError') {
             toast({
              variant: "destructive",
              title: "Erro de Conexão",
              description: `Falha ao comunicar com o serviço ${functionName}.`,
            });
           }
        }
        throw err;
      }
    },
    retry: (failureCount, error) => {
        // Don't retry client side errors (4xx), only 5xx or network errors
        if (error.message && (error.message.includes('400') || error.message.includes('404'))) return false;
        return failureCount < retry;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 60 * 5, // Cache results for 5 minutes by default
    gcTime: 1000 * 60 * 30, // Keep unused data for 30 minutes
    refetchOnWindowFocus: false, 
    enabled: enabled,
    ...queryOptions,
  });
};