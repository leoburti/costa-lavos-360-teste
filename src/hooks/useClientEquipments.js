
import { useAnalyticalData } from './useAnalyticalData';

export const useClientEquipments = (clientId) => {
  const params = {
    p_cliente_id: clientId
  };

  // Only fetch if we have a client ID
  const enabled = !!clientId;

  const { data, loading, error, refetch } = useAnalyticalData(
    'get_client_equipments',
    params,
    { enabled }
  );

  return {
    equipments: data || [],
    loading,
    error,
    refetch
  };
};
