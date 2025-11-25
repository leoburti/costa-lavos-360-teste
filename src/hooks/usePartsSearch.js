
import { useEdgeFunctionQuery } from '@/hooks/useEdgeFunctionQuery';
import { useDebounce } from '@/hooks/useDebounce';

export const usePartsSearch = (searchTerm) => {
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const query = useEdgeFunctionQuery(
    'search-pecas',
    { searchTerm: debouncedSearch },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      retry: 1,
      refetchOnWindowFocus: false
    }
  );

  const parts = Array.isArray(query.data) ? query.data : [];

  return {
    parts,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch
  };
};
