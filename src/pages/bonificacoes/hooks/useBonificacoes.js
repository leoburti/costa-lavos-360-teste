import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

export function useBonificacoes() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createBonificacao = useCallback(async (data) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('bonificacoes')
        .insert([{
          name: data.name,
          type: data.type,
          percentage: data.percentage,
          status: 'ativa',
          start_date: data.start_date,
        }]);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Bonificação criada com sucesso',
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

  const updateBonificacao = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('bonificacoes')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Bonificação atualizada com sucesso',
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

  const deleteBonificacao = useCallback(async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('bonificacoes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Bonificação deletada com sucesso',
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
    createBonificacao,
    updateBonificacao,
    deleteBonificacao,
  };
}