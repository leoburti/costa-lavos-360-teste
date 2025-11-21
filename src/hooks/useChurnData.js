import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useChurnData = (filters) => {
  const [data, setData] = useState({ kpis: {}, phase1: [], phase2: [], phase3: [], phase4: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    if (!filters.startDate || !filters.endDate) return;

    setLoading(true);
    setError(null);
    try {
        const selectedClients = Array.isArray(filters.clients) ? filters.clients.map(c => c.value) : null;
      const { data: result, error: rpcError } = await supabase.rpc('get_churn_analysis_data_v3', {
        p_exclude_employees: filters.excludeEmployees,
        p_supervisors: filters.supervisors,
        p_sellers: filters.sellers,
        p_customer_groups: filters.customerGroups,
        p_regions: filters.regions,
        p_clients: selectedClients,
        p_search_term: filters.searchTerm,
      });

      if (rpcError) throw rpcError;

      setData(result || { kpis: {}, phase1: [], phase2: [], phase3: [], phase4: [] });
    } catch (err) {
      console.error("Error fetching churn data:", err);
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Erro ao buscar dados de Churn",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};