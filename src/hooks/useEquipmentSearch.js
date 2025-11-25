
import { useEdgeFunctionQuery } from '@/hooks/useEdgeFunctionQuery';
import { useDebounce } from '@/hooks/useDebounce';

export const useEquipmentSearch = (clientId, searchTerm) => {
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const query = useEdgeFunctionQuery(
    'search-equipamentos',
    { clientId, searchTerm: debouncedSearch },
    {
      enabled: !!clientId,
      staleTime: 1000 * 60 * 2, // 2 minutes cache
      retry: 1,
      refetchOnWindowFocus: false
    }
  );

  const equipments = Array.isArray(query.data) ? query.data : [];

  return {
    equipments,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch
  };
};
