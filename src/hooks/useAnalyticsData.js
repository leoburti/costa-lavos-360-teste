import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/components/ui/use-toast';

export function useAnalyticsData(rpcName, filters = {}, mockData = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    if (!rpcName) {
        if (mockData) {
            setData(mockData);
            setIsMock(true);
        }
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);
    setIsMock(false);

    try {
      // Transform params
      const rpcParams = {
        p_start_date: filters.dateRange?.from ? new Date(filters.dateRange.from).toISOString().split('T')[0] : null,
        p_end_date: filters.dateRange?.to ? new Date(filters.dateRange.to).toISOString().split('T')[0] : null,
        p_exclude_employees: filters.excludeEmployees,
        p_supervisors: filters.supervisors?.map(s => String(s)) || null,
        p_sellers: filters.sellers?.map(s => String(s)) || null,
        p_regions: filters.regions?.map(s => String(s)) || null,
        p_clients: filters.clients?.map(s => String(s)) || null,
        p_customer_groups: filters.customerGroups?.map(s => String(s)) || null,
        p_products: filters.products?.map(s => String(s)) || null,
        p_search_term: filters.searchTerm || null,
        // Add specific params if passed in filters
        ...filters
      };

      // Clean irrelevant params
      delete rpcParams.dateRange;
      delete rpcParams.supervisors;
      delete rpcParams.sellers;
      delete rpcParams.regions;
      delete rpcParams.clients;
      delete rpcParams.customerGroups;
      delete rpcParams.products;
      delete rpcParams.searchTerm;
      delete rpcParams.excludeEmployees;

      if (!rpcParams.p_start_date || !rpcParams.p_end_date) {
        setLoading(false);
        return;
      }

      const { data: result, error: apiError } = await apiClient.callRpc(rpcName, rpcParams);

      if (apiError) throw apiError;

      const isEmpty = !result || (Array.isArray(result) && result.length === 0) || (typeof result === 'object' && Object.keys(result).length === 0);

      if (isEmpty && mockData) {
         console.warn(`[useAnalyticsData] Empty result for ${rpcName}, using mock.`);
         setData(mockData);
         setIsMock(true);
      } else {
         setData(result);
      }

    } catch (err) {
      console.error(`[useAnalyticsData] Error fetching ${rpcName}:`, err);
      
      if (mockData) {
        setData(mockData);
        setIsMock(true);
        toast({
            title: "Modo Offline",
            description: "Exibindo dados simulados devido a erro de conexão.",
            variant: "warning"
        });
      } else {
        setError(err);
        toast({
            title: "Erro",
            description: "Falha ao carregar dados.",
            variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  }, [rpcName, JSON.stringify(filters), mockData, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { 
    data, 
    loading, 
    error, 
    isMock, 
    refetch: fetchData 
  };
}