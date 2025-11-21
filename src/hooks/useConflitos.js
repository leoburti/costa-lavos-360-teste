import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useConflitos = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchConflitos = useCallback(async (profissionalId) => {
    setLoading(true);
    try {
      let query = supabase.from('apoio_agenda_conflitos').select('*, evento_id_1(*), evento_id_2(*)');
      if (profissionalId) {
        query = query.or(`evento_id_1.profissional_id.eq.${profissionalId},evento_id_2.profissional_id.eq.${profissionalId}`);
      }
      const { data, error } = await query.order('data_deteccao', { ascending: false });
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar conflitos', description: error.message });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchConflitosNaoResolvidos = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_agenda_conflitos').select('*, evento_id_1(*), evento_id_2(*)').eq('resolvido', false);
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar conflitos não resolvidos', description: error.message });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const resolverConflito = useCallback(async (conflitoId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_agenda_conflitos').update({ resolvido: true, data_resolucao: new Date().toISOString() }).eq('id', conflitoId);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Conflito marcado como resolvido.' });
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao resolver conflito', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const detectarConflitos = useCallback(async () => {
    // Esta função seria implementada no backend (RPC ou Edge Function) para rodar periodicamente
    // Por enquanto, apenas um placeholder para o frontend
    toast({ title: 'Detecção de Conflitos', description: '🚧 A detecção automática de conflitos está sendo processada no servidor.' });
    return true;
  }, [toast]);

  return {
    loading,
    fetchConflitos,
    fetchConflitosNaoResolvidos,
    resolverConflito,
    detectarConflitos,
  };
};