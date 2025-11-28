import { useAnalyticalData } from './useAnalyticalData';

export const useClientEquipments = (params) => {
  // Safely destructure params, providing default empty object if params is null or undefined
  const { p_cliente_id, ...restParams } = params || {};

  // Ensure p_cliente_id is null if it's undefined or an empty string, otherwise use its value
  const queryParams = {
    ...restParams,
    p_cliente_id: p_cliente_id || null, 
  };

  const { data, loading, error, refetch } = useAnalyticalData(
    'get_client_equipments',
    queryParams,
    {
      enabled: !!queryParams.p_cliente_id, // Only enable if a valid p_cliente_id exists
      defaultValue: [], // Always return an array for data if not loaded
    }
  );

  return { data, loading, error, refetch };
};