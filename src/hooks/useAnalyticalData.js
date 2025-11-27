
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useAnalyticalData = (rpcName, params, options = {}) => {
  const { 
    enabled = true, 
    timeout = 60000, 
    defaultValue = [],
    processData,
    showErrorToast = true
  } = options;

  const [data, setData] = useState(defaultValue);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  
  // Refs to hold latest values of unstable dependencies to avoid effect re-runs
  // This prevents infinite loops when these values change reference on every render
  const defaultValueRef = useRef(defaultValue);
  const processDataRef = useRef(processData);
  const toastRef = useRef(toast);
  const showErrorToastRef = useRef(showErrorToast);
  
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Update refs when props change - this does NOT trigger re-renders
  useEffect(() => {
    defaultValueRef.current = defaultValue;
    processDataRef.current = processData;
    toastRef.current = toast;
    showErrorToastRef.current = showErrorToast;
  }, [defaultValue, processData, toast, showErrorToast]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Stable params string for dependency comparison
  const paramsString = JSON.stringify(params);

  const fetchData = useCallback(async () => {
    if (!enabled) {
        if (isMountedRef.current) setLoading(false);
        return;
    }

    if (isMountedRef.current) {
        setLoading(true);
        setError(null);
    }
    
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Tempo limite da requisição excedido (Timeout)')), timeout)
      );

      const rpcPromise = supabase.rpc(rpcName, JSON.parse(paramsString));

      const { data: result, error: rpcError } = await Promise.race([
        rpcPromise,
        timeoutPromise
      ]);

      if (signal.aborted) return;

      if (rpcError) throw rpcError;

      const processFn = processDataRef.current || ((d) => d);
      const processed = processFn(result);
      
      if (isMountedRef.current) {
          setData(processed || defaultValueRef.current);
          setError(null);
      }

    } catch (err) {
      if (signal.aborted) return;
      if (!isMountedRef.current) return;

      console.error(`[AnalyticalData] Error in ${rpcName}:`, err);
      setError(err.message);
      setData(defaultValueRef.current);

      if (showErrorToastRef.current && toastRef.current) {
        toastRef.current({
          variant: "destructive",
          title: "Erro de Carregamento",
          description: `Não foi possível carregar dados de ${rpcName}. Detalhe: ${err.message}`
        });
      }
    } finally {
      if (isMountedRef.current && !signal.aborted) {
        setLoading(false);
      }
    }
  }, [rpcName, paramsString, enabled, timeout]); // Removed toast and showErrorToast from dependencies

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};
