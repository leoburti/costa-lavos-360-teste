
import { useEdgeFunctionQuery } from '@/hooks/useEdgeFunctionQuery';
import { useDebounce } from '@/hooks/useDebounce';

/**
 * Hook to search clients using Supabase Edge Functions
 * Replaces legacy RPC calls for better performance and stability
 */
export const useClientSearch = (searchTerm) => {
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const query = useEdgeFunctionQuery(
    'search-clients',
    { searchTerm: debouncedSearch },
    {
      enabled: !!debouncedSearch && debouncedSearch.length >= 2,
      staleTime: 1000 * 60 * 2, // 2 minutes cache
      retry: 1
    }
  );

  return {
    clients: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch
  };
};
