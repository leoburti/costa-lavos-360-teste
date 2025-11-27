import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from './SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Stable fetch function
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('apoio_notificacoes')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('arquivada', false)
        .order('data_criacao', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data ? data.filter(n => !n.lida).length : 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Stable mark as read
  const markAsRead = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('apoio_notificacoes')
        .update({ lida: true, data_leitura: new Date() })
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, lida: true, data_leitura: new Date() } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar como lida.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Stable mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('apoio_notificacoes')
        .update({ lida: true, data_leitura: new Date() })
        .eq('usuario_id', user.id)
        .eq('lida', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, lida: true })));
      setUnreadCount(0);
      toast({
        title: "Sucesso",
        description: "Todas as notificações marcadas como lidas.",
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [user, toast]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const channel = supabase
      .channel('public:apoio_notificacoes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'apoio_notificacoes',
          filter: `usuario_id=eq.${user.id}` 
        }, 
        (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          toast({
            title: payload.new.titulo || "Nova Notificação",
            description: payload.new.mensagem,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications, toast]);

  const contextValue = useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  }), [notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};