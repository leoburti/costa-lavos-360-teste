import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useNotificacoes = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotificacoes = useCallback(async (userId, filters) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('get_notificacoes_filtradas', {
        p_usuario_id: userId,
        p_tipo: filters?.tipo || null,
        p_status: filters?.status || null,
        p_arquivada: filters?.arquivada || false,
        p_busca: filters?.busca || null,
      });

      if (rpcError) throw rpcError;
      return data;
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar notificações",
        description: err.message,
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchNotificacoesNaoLidas = useCallback(async (userId) => {
    try {
      const { data, error: rpcError } = await supabase.rpc('get_notificacoes_filtradas', {
        p_usuario_id: userId,
        p_status: 'nao_lida',
        p_arquivada: false,
        p_tipo: null,
        p_busca: null,
      });

      if (rpcError) throw rpcError;
      return data;
    } catch (err) {
      console.error('Erro ao buscar notificações não lidas:', err);
      // Silencioso para não incomodar o usuário com toasts no bell
      return [];
    }
  }, []);

  const marcarComoLida = useCallback(async (notificationId) => {
    try {
      const { error: rpcError } = await supabase.rpc('marcar_notificacao_lida', { p_notificacao_id: notificationId });
      if (rpcError) throw rpcError;
    } catch (err) {
      console.error('Erro ao marcar como lida:', err);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível marcar a notificação como lida.",
      });
    }
  }, [toast]);

  const marcarTodasComoLidas = useCallback(async (userId) => {
    try {
      const { error: rpcError } = await supabase.rpc('marcar_todas_notificacoes_lidas', { p_usuario_id: userId });
      if (rpcError) throw rpcError;
      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas.",
      });
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível marcar todas as notificações como lidas.",
      });
    }
  }, [toast]);

  const arquivarNotificacao = useCallback(async (notificationId, arquivar = true) => {
    const rpc_name = arquivar ? 'arquivar_notificacao' : 'desarquivar_notificacao';
    try {
      const { error: rpcError } = await supabase.rpc(rpc_name, { p_id: notificationId });
      if (rpcError) throw rpcError;
      toast({
        title: "Sucesso",
        description: `Notificação ${arquivar ? 'arquivada' : 'desarquivada'} com sucesso.`,
      });
    } catch (err) {
      console.error(`Erro ao ${arquivar ? 'arquivar' : 'desarquivar'} notificação:`, err);
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Não foi possível ${arquivar ? 'arquivar' : 'desarquivar'} a notificação.`,
      });
    }
  }, [toast]);
  
  const deleteNotificacao = async (id) => {
    // This is a placeholder as we should probably archive instead of delete
    // but implementing as requested.
    console.warn("Deletar notificação ainda não implementado no backend.");
    toast({
        title: "Funcionalidade em desenvolvimento",
        description: "A exclusão de notificações será implementada em breve.",
    });
  };

  return {
    loading,
    error,
    fetchNotificacoes,
    fetchNotificacoesNaoLidas,
    marcarComoLida,
    marcarTodasComoLidas,
    arquivarNotificacao,
    deleteNotificacao
  };
};