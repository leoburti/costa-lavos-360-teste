
import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/apiClient';

/**
 * Hook para buscar dados analíticos com cache, retry e debounce de parâmetros.
 * Evita loops infinitos comparando os parâmetros via JSON.stringify.
 */
export function useAnalyticalData(rpcName, params = {}, options = {}) {
  const {
    enabled = true,
    onSuccess,
    onError,
    transformData,
    defaultValue = null,
    keepPreviousData = true // Mantém dados anteriores enquanto carrega novos para evitar flash
  } = options;

  const [data, setData] = useState(defaultValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ref para guardar a última string de parâmetros usada para evitar loops
  const activeParamsStr = useRef("");

  const fetchData = useCallback(async (currentParams) => {
    if (!enabled) return;

    // Limpeza básica do nome da RPC
    const cleanRpcName = rpcName?.startsWith('rpc:') ? rpcName.replace('rpc:', '') : rpcName;
    if (!cleanRpcName) return;

    setLoading(true);
    setError(null);
    
    if (!keepPreviousData) {
        setData(defaultValue); 
    }

    try {
      const { data: result, error: apiError } = await apiClient.callRpc(cleanRpcName, currentParams);

      if (apiError) throw apiError;

      const finalData = transformData ? transformData(result) : result;
      
      setData(finalData);
      if (onSuccess) onSuccess(finalData);

    } catch (err) {
      console.error(`[useAnalyticalData] Error in ${cleanRpcName}:`, err);
      setError(err);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  }, [rpcName, enabled, keepPreviousData, onSuccess, onError, transformData, defaultValue]);

  // Stringify params para usar como dependência estável e evitar loops infinitos
  const paramsString = JSON.stringify(params);

  useEffect(() => {
    // Só dispara se estiver habilitado E os parâmetros mudaram em relação à última execução bem sucedida
    if (enabled && paramsString !== activeParamsStr.current) {
      activeParamsStr.current = paramsString;
      fetchData(params);
    }
  }, [paramsString, enabled, fetchData, params]);

  return {
    data,
    loading,
    error,
    retry: () => {
        activeParamsStr.current = ""; // Force re-fetch
        fetchData(params);
    },
    refetch: () => {
        activeParamsStr.current = ""; // Force re-fetch
        fetchData(params);
    }
  };
}
