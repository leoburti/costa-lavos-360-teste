import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useClient360Data = (filters, selectedClient) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    if (!selectedClient) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Parse client code and store from selectedClient value (format: "CODE-STORE")
      const [clientCode, clientStore] = selectedClient.split('-');

      if (!clientCode || !clientStore) {
        throw new Error("Formato de cliente inválido. Esperado: CODIGO-LOJA");
      }

      const { data: result, error: rpcError } = await supabase.rpc('get_client_360_data_v2', {
        p_start_date: filters.startDate,
        p_end_date: filters.endDate,
        p_exclude_employees: filters.excludeEmployees,
        p_supervisors: filters.supervisors,
        p_sellers: filters.sellers,
        p_customer_groups: filters.customerGroups,
        p_regions: filters.regions,
        p_clients: null, // We are targeting a specific client
        p_search_term: filters.searchTerm,
        p_products: null,
        p_show_defined_groups_only: filters.showDefinedGroupsOnly,
        p_target_client_code: clientCode,
        p_target_store: clientStore
      });

      if (rpcError) throw rpcError;

      if (result && result.length > 0) {
        setData(result[0]);
      } else {
        setData(null);
        // Optional: toast info if no data found, but usually null state handles UI
      }
    } catch (err) {
      console.error('Error fetching Client 360 data:', err);
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados do cliente",
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  }, [filters, selectedClient, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};