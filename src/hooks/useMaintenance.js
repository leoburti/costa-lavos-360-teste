import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

/**
 * Hook para gerenciar estado de manutenção.
 * Prioriza dados do banco de dados (via RPC), mas aceita fallback via variáveis de ambiente.
 */
export const useMaintenance = () => {
  const envMaintenance = import.meta.env.VITE_MAINTENANCE_MODE === 'true';
  const envMessage = import.meta.env.VITE_MAINTENANCE_MESSAGE;
  const envReturnDate = import.meta.env.VITE_MAINTENANCE_RETURN_DATE;

  const [maintenanceStatus, setMaintenanceStatus] = useState({
    isActive: envMaintenance,
    message: envMessage || '',
    endTime: envReturnDate || null,
    startTime: null
  });
  
  const [loading, setLoading] = useState(true);
  const isLoadedOnce = useRef(false);

  const fetchStatus = useCallback(async () => {
    if (!isLoadedOnce.current) {
      setLoading(true);
    }
    try {
      const { data, error } = await supabase.rpc('get_maintenance_status');
      
      if (error) throw error;
      
      if (data) {
        setMaintenanceStatus({
          isActive: data.is_active, 
          message: data.message || envMessage,
          endTime: data.maintenance_end || envReturnDate,
          startTime: data.maintenance_start
        });
      }
    } catch (err) {
      console.warn('Warning: Could not fetch maintenance status from DB, using ENV fallback.', err.message);
      // Fallback silencioso para ENV
      setMaintenanceStatus({ 
        isActive: envMaintenance, 
        message: envMessage || 'Sistema em manutenção (Modo de Segurança)', 
        endTime: envReturnDate, 
        startTime: null 
      });
    } finally {
      if (!isLoadedOnce.current) {
        setLoading(false);
        isLoadedOnce.current = true;
      }
    }
  }, [envMaintenance, envMessage, envReturnDate]);

  useEffect(() => {
    fetchStatus();

    const channel = supabase
      .channel('maintenance_updates')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'system_maintenance' }, 
        (payload) => {
          const newData = payload.new;
          setMaintenanceStatus({
            isActive: newData.is_active,
            message: newData.message,
            endTime: newData.maintenance_end,
            startTime: newData.maintenance_start
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStatus]);

  return {
    maintenanceStatus,
    loading,
    refreshStatus: fetchStatus
  };
};