import { useState, useEffect, useCallback, useRef } from 'react';
import { callAnalyticsFunction } from '@/services/analyticsRpcService';
import { useFilters } from '@/contexts/FilterContext';

/**
 * useAnalytics
 * Hook robusto para consumo de dados analíticos.
 * 
 * FIX: Corrigido erro onde 'pagination' tornava-se undefined.
 * 
 * @param {string} functionName - Nome da função RPC
 * @param {object} specificParams - Parâmetros específicos desta view
 * @param {object} options - { enabled, timeout, defaultValue }
 */
export function useAnalytics(functionName, specificParams = {}, options = {}) {
  const { filters, isReady } = useFilters();
  
  const [data, setData] = useState(options.defaultValue || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // SAFEGUARD: Inicialização explícita e segura do estado de paginação
  const [pagination, setPagination] = useState({ hasMore: false, limit: 1000, offset: 0 });
  
  const abortControllerRef = useRef(null);

  const loadData = useCallback(async (isLoadMore = false) => {
    // Validação de pré-requisitos
    if (!isReady || options.enabled === false || !functionName) return;
    
    // Cancelamento de requisições anteriores
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      // SAFEGUARD: Acesso seguro às propriedades de paginação usando Optional Chaining
      // Se pagination for null/undefined por qualquer motivo, usa 0 e 1000 como fallback
      const currentOffset = pagination?.offset || 0;
      const currentLimit = pagination?.limit || 1000;

      const requestParams = {
        ...filters,
        ...specificParams,
        // Cálculo de offset protegido
        offset: isLoadMore ? currentOffset + currentLimit : 0,
        limit: specificParams.limit || filters.limit || 1000
      };
      
      const result = await callAnalyticsFunction(
        functionName, 
        requestParams, 
        { timeout: options.timeout }
      );

      if (result.error) {
        setError(result.error);
        if (!isLoadMore) setData(options.defaultValue || null);
      } else {
        // Atualização de Dados
        if (isLoadMore) {
          setData(prev => [...(Array.isArray(prev) ? prev : []), ...(Array.isArray(result.data) ? result.data : [])]);
        } else {
          setData(result.data);
        }

        // FIX CRÍTICO: Gerenciamento do estado de Paginação
        // Se o serviço retornar paginação, usamos ela.
        // Se não, construímos o estado baseados na requisição e resposta.
        if (result.pagination) {
            setPagination(result.pagination);
        } else {
            const returnedCount = Array.isArray(result.data) ? result.data.length : 0;
            const requestedLimit = requestParams.limit;
            
            setPagination({
                offset: requestParams.offset,
                limit: requestedLimit,
                // Heurística simples: se retornou menos itens que o limite, acabou.
                hasMore: returnedCount >= requestedLimit 
            });
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('[useAnalytics] Critical Hook Error:', err);
        setError({ message: err.message || 'Erro interno no componente de análise.' });
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [functionName, isReady, options.enabled, JSON.stringify(filters), JSON.stringify(specificParams), pagination?.offset, pagination?.limit, options.timeout]);

  // Trigger inicial e reload quando filtros mudam
  useEffect(() => {
    loadData(false);
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [loadData]);

  const loadMore = () => {
    if (!loading && pagination?.hasMore) {
      loadData(true);
    }
  };

  return {
    data,
    loading,
    error,
    pagination: pagination || { hasMore: false, limit: 1000, offset: 0 }, // Fallback no retorno
    loadMore,
    refetch: () => loadData(false)
  };
}