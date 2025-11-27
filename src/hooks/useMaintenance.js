
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const useMaintenance = () => {
  const [maintenanceStatus, setMaintenanceStatus] = useState({
    isActive: false,
    message: '',
    endTime: null,
    startTime: null
  });
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_maintenance_status');
      if (error) throw error;
      
      if (data) {
        setMaintenanceStatus({
          isActive: data.is_active,
          message: data.message,
          endTime: data.maintenance_end,
          startTime: data.maintenance_start
        });
      }
    } catch (err) {
      console.error('Error checking maintenance status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    // Subscribe to changes for realtime updates
    const channel = supabase
      .channel('maintenance_updates')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'system_maintenance' }, 
        (payload) => {
          // Update local state immediately on change
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

  const toggleMaintenance = async (active, endTime = null, message = null) => {
    try {
      const { error } = await supabase.rpc('set_maintenance_mode', {
        p_active: active,
        p_end_time: endTime,
        p_message: message
      });
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      return { success: false, error };
    }
  };

  return {
    maintenanceStatus,
    loading,
    toggleMaintenance,
    refreshStatus: fetchStatus
  };
};
