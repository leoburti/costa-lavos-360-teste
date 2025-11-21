import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const usePreferenciasNotificacoes = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchPreferencias = useCallback(async (usuarioId) => {
    setLoading(true);
    try {
      // Assuming 'apoio_usuarios' stores notification preferences in a jsonb column, e.g., 'preferencias_notificacao'
      const { data, error } = await supabase.from('apoio_usuarios').select('preferencias_notificacao').eq('id', usuarioId).single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 means "no rows found"
      return data ? data.preferencias_notificacao : null;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar preferências de notificação', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updatePreferencias = useCallback(async (usuarioId, dados) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_usuarios').update({ preferencias_notificacao: dados }).eq('id', usuarioId).select();
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Preferências de notificação atualizadas.' });
      return data[0];
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar preferências', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const verificarNotificacaoAtiva = useCallback(async (usuarioId, tipo) => {
    // This logic would ideally be handled in a backend function for performance/security
    toast({ title: 'Em desenvolvimento', description: '🚧 Verificação de preferência de notificação por tipo ainda não implementada.' });
    return true; // Assume ativo por enquanto
  }, [toast]);

  const verificarHorarioNotificacao = useCallback(async (usuarioId) => {
    // This logic would ideally be handled in a backend function
    toast({ title: 'Em desenvolvimento', description: '🚧 Verificação de horário de notificação ainda não implementada.' });
    return true; // Assume dentro do horário por enquanto
  }, [toast]);

  return {
    loading,
    fetchPreferencias,
    updatePreferencias,
    verificarNotificacaoAtiva,
    verificarHorarioNotificacao,
  };
};