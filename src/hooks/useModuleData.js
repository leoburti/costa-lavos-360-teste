import { useState, useEffect, useCallback, useRef } from 'react';
import { supabaseRPC } from '@/lib/supabaseRPC';
import { useToast } from '@/components/ui/use-toast';
import { useFilters } from '@/contexts/FilterContext';

/**
 * Universal hook for fetching module data with RPC integration, RLS handling, and mock fallback.
 * 
 * @param {string} rpc - Supabase RPC function name.
 * @param {object} mockData - Fallback data if RPC fails, RLS blocks, or returns empty.
 * @param {object} initialFilters - Optional initial filters to merge with global filters.
 * @returns {object} { data, loading, error, isMock, retry, filters, setFilters }
 */
export function useModuleData(rpc, mockData = null, initialFilters = {}) {
  const { filters: globalFilters, updateFilters } = useFilters();
  const { toast } = useToast();
  const isMounted = useRef(true);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);

  // Combinar filtros globais com iniciais da página
  const activeFilters = { ...globalFilters, ...initialFilters };

  const fetchData = useCallback(async () => {
    // Se não houver RPC definido, usa mock imediatamente (modo puramente frontend)
    if (!rpc) {
        if (mockData) {
            setData(mockData);
            setIsMock(true);
        } else {
            // Sem RPC e sem Mock => Estado vazio
            setData(null);
        }
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);
    // Não reseta isMock para true imediatamente para evitar flickers, assume false até provar contrário
    
    try {
      // Transformar filtros do contexto para o formato esperado pelas RPCs do banco (prefixo p_)
      const rpcParams = {
        p_start_date: activeFilters.dateRange?.from ? activeFilters.dateRange.from.toISOString().split('T')[0] : undefined,
        p_end_date: activeFilters.dateRange?.to ? activeFilters.dateRange.to.toISOString().split('T')[0] : undefined,
        p_exclude_employees: activeFilters.excludeEmployees,
        p_supervisors: activeFilters.supervisors?.length > 0 ? activeFilters.supervisors.map(String) : null,
        p_sellers: activeFilters.sellers?.length > 0 ? activeFilters.sellers.map(String) : null,
        p_regions: activeFilters.regions?.length > 0 ? activeFilters.regions.map(String) : null,
        p_clients: activeFilters.clients?.length > 0 ? activeFilters.clients.map(String) : null,
        p_customer_groups: activeFilters.customerGroups?.length > 0 ? activeFilters.customerGroups.map(String) : null,
        p_products: activeFilters.products?.length > 0 ? activeFilters.products.map(String) : null,
        p_search_term: activeFilters.searchTerm || null,
      };

      // Chamada segura via wrapper
      const result = await supabaseRPC.callRPC(rpc, rpcParams);

      // Verificação de dados vazios
      const isEmpty = !result || (Array.isArray(result) && result.length === 0) || (typeof result === 'object' && Object.keys(result).length === 0);

      if (isEmpty) {
         console.warn(`[useModuleData] Empty result for ${rpc}. Check RLS or Filters.`);
         if (mockData) {
             console.info(`[useModuleData] Using Mock Data fallback for ${rpc}.`);
             setData(mockData);
             setIsMock(true);
         } else {
             setData(result); // Retorna vazio mesmo se não tiver mock
             setIsMock(false);
         }
      } else {
         setData(result);
         setIsMock(false);
      }

    } catch (err) {
      console.error(`[useModuleData] Critical Error fetching ${rpc}:`, err);
      
      // Fallback automático em caso de erro (Rede, RLS, Timeout)
      if (mockData) {
        console.warn(`[useModuleData] Fallback to mock data for ${rpc} due to exception.`);
        setData(mockData);
        setIsMock(true);
        
        // Notificar usuário apenas se for um erro real, não apenas "sem dados"
        toast({
            title: "Atenção: Modo Offline",
            description: "Não foi possível conectar aos dados reais. Exibindo dados de demonstração.",
            variant: "warning",
            duration: 5000
        });
      } else {
        setError(err);
        toast({
            title: "Erro de Carregamento",
            description: "Falha ao carregar dados. Tente atualizar a página.",
            variant: "destructive"
        });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [rpc, JSON.stringify(activeFilters), mockData, toast]); // Dependências estáveis

  useEffect(() => {
    isMounted.current = true;
    fetchData();
    return () => { isMounted.current = false; };
  }, [fetchData]);

  return { 
    data, 
    loading, 
    error, 
    isMock, 
    retry: fetchData,
    filters: activeFilters,
    setFilters: updateFilters 
  };
}