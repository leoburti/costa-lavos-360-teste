
import { useEdgeFunctionQuery } from '@/hooks/useEdgeFunctionQuery';
import { useDebounce } from '@/hooks/useDebounce';

/**
 * Hook to search clients using Supabase Edge Functions
 * Replaces legacy RPC calls for better performance and stability.
 * Handles the specific response format from search_clients_safe.
 */
export const useClientSearch = (searchTerm) => {
  const debouncedSearch = useDebounce(searchTerm, 400); // Increased debounce slightly for better UX
  
  const query = useEdgeFunctionQuery(
    'search-clients',
    { searchTerm: debouncedSearch },
    {
      enabled: !!debouncedSearch && debouncedSearch.length >= 2,
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      retry: 1,
      refetchOnWindowFocus: false
    }
  );

  // Normalize data structure if needed
  // The Edge function returns an array of objects directly: [{ code, name, ... }, ...]
  const clients = Array.isArray(query.data) ? query.data : [];

  return {
    clients,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch
  };
};
