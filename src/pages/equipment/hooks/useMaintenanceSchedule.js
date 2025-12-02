import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

export function useMaintenanceSchedule() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const scheduleMaintenance = useCallback(async (data) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('maintenance')
        .insert([{
          equipment_id: data.equipment_id,
          data_inicio: data.maintenance_date, // Mapped to existing column
          tipo: data.maintenance_type, // Mapped to existing column
          tecnico: data.technician_name, // Mapped to existing column
          observacoes: data.notes, // Mapped to existing column
          status: 'agendado',
        }]);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Manutenção agendada com sucesso',
      });

      return true;
    } catch (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    scheduleMaintenance,
  };
}