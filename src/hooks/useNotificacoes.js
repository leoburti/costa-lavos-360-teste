import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export const useNotificacoes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchNotificacoes = useCallback(async (filtros = {}) => {
    if (!user) return [];
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_notificacoes_filtradas', {
        p_usuario_id: user.id,
        p_tipo: filtros.tipo || null,
        p_status: filtros.status || null,
        p_arquivada: filtros.arquivada || false,
        p_busca: filtros.busca || null
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao carregar notificações.' });
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const marcarComoLida = useCallback(async (id) => {
    try {
      const { error } = await supabase.rpc('marcar_notificacao_lida', { p_notificacao_id: id });
      if (error) throw error;
      return true;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível marcar como lida.' });
      return false;
    }
  }, [toast]);

  const marcarTodasComoLidas = useCallback(async () => {
    if (!user) return;
    try {
      const { error } = await supabase.rpc('marcar_todas_notificacoes_lidas', { p_usuario_id: user.id });
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Todas as notificações marcadas como lidas.' });
      return true;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao atualizar notificações.' });
      return false;
    }
  }, [user, toast]);

  const arquivar = useCallback(async (id) => {
    try {
      const { error } = await supabase.rpc('arquivar_notificacao', { p_id: id });
      if (error) throw error;
      toast({ title: 'Arquivada', description: 'Notificação arquivada com sucesso.' });
      return true;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao arquivar.' });
      return false;
    }
  }, [toast]);

  const desarquivar = useCallback(async (id) => {
    try {
      const { error } = await supabase.rpc('desarquivar_notificacao', { p_id: id });
      if (error) throw error;
      toast({ title: 'Desarquivada', description: 'Notificação restaurada.' });
      return true;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao desarquivar.' });
      return false;
    }
  }, [toast]);

  const fetchPreferencias = useCallback(async () => {
    if (!user) return null;
    try {
      const { data, error } = await supabase.rpc('get_notificacao_preferencias', { p_usuario_id: user.id });
      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }, [user]);

  const updatePreferencias = useCallback(async (prefs) => {
    if (!user) return;
    try {
      const { error } = await supabase.rpc('update_notificacao_preferencias', {
        p_usuario_id: user.id,
        p_email: prefs.email_enabled,
        p_push: prefs.push_enabled,
        p_sms: prefs.sms_enabled,
        p_tipos: prefs.tipos_config
      });
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Preferências atualizadas.' });
      return true;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao salvar preferências.' });
      return false;
    }
  }, [user, toast]);

  return {
    loading,
    fetchNotificacoes,
    marcarComoLida,
    marcarTodasComoLidas,
    arquivar,
    desarquivar,
    fetchPreferencias,
    updatePreferencias
  };
};