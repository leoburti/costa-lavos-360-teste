
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/customSupabaseClient';

export const useClientEquipments = (clientId) => {
  // We use useQuery directly with RPC instead of Edge Function to ensure direct DB access and reduced latency
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['client-equipments', clientId],
    queryFn: async () => {
      console.log(`[useClientEquipments] Fetching equipments for clientId: ${clientId}`);
      
      if (!clientId) return [];

      const { data, error } = await supabase.rpc('get_client_equipments', {
        p_cliente_id: clientId
      });

      if (error) {
        console.error('[useClientEquipments] RPC Error:', error);
        throw error;
      }

      console.log(`[useClientEquipments] Success. Found ${data?.length || 0} items.`);
      return data || [];
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });

  return {
    equipments: data || [],
    isLoading,
    isError,
    error,
    refetch
  };
};
