
import { useEdgeFunctionQuery } from '@/hooks/useEdgeFunctionQuery';

export const useClientEquipments = (clientId) => {
  const query = useEdgeFunctionQuery(
    'get-client-equipments',
    { clientId },
    {
      enabled: !!clientId,
      staleTime: 1000 * 60 * 5, // 5 minutes cache
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
