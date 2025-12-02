import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

export function useCrm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createCliente = useCallback(async (data) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('crm_contacts')
        .insert([data]);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Cliente criado com sucesso',
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

  const updateCliente = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('crm_contacts')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Cliente atualizado com sucesso',
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

  const deleteCliente = useCallback(async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('crm_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Cliente deletado com sucesso',
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
    createCliente,
    updateCliente,
    deleteCliente,
  };
}