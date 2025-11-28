import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Loader2, CalendarCheck, FileSignature, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNotificacoes } from '@/hooks/useNotificacoes';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/lib/customSupabaseClient';
import NotificacaoDetalhesModal from '@/pages/apoio/notificacoes/NotificacaoDetalhesModal';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'novo_chamado':
    case 'atribuicao':
      return <FileSignature className="h-4 w-4 text-blue-500" />;
    case 'mudanca_status':
      return <Info className="h-4 w-4 text-yellow-500" />;
    case 'cancelamento':
    case 'bloqueio_removido':
      return <CalendarCheck className="h-4 w-4 text-red-500" />;
    case 'reagendamento':
      return <CalendarCheck className="h-4 w-4 text-orange-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const NotificacoesBell = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { fetchNotificacoesNaoLidas, marcarTodasComoLidas, marcarComoLida, deleteNotificacao, loading } = useNotificacoes();
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (user?.id) {
      const { data, error } = await supabase.rpc('get_notificacoes_filtradas', {
        p_usuario_id: user.id,
        p_status: 'nao_lida',
        p_arquivada: false
      });

      if (error) {
        console.error("Error fetching unread notifications:", error.message);
        toast({
            variant: "destructive",
            title: "Erro ao buscar notificações",
            description: "Não foi possível carregar as notificações não lidas.",
        });
        return;
      }
      
      setUnreadNotifications(data || []);
      setTotalUnreadCount(data?.length || 0);
    }
  }, [user, toast]);

  useEffect(() => {
    if (!user) return;
    loadNotifications();

    const channel = supabase.channel('public:apoio_notificacoes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'apoio_notificacoes', 
        filter: `usuario_id=eq.${user.id}` 
      }, (payload) => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(payload.new.titulo, { body: payload.new.mensagem });
        }
        loadNotifications();
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'apoio_notificacoes', 
        filter: `usuario_id=eq.${user.id}` 
      }, () => {
        loadNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadNotifications]);

  const handleMarkAllAsRead = async () => {
    if (user?.id) {
      await marcarTodasComoLidas(user.id);
      loadNotifications();
    }
  };

  const handleMarkAsRead = async (id) => {
    await marcarComoLida(id);
    loadNotifications();
    if (selectedNotification?.id === id) {
      setSelectedNotification(prev => ({ ...prev, lida: true }));
    }
  };

  const handleDeleteNotification = async (id) => {
    await deleteNotificacao(id);
    loadNotifications();
    if (selectedNotification?.id === id) {
      setIsDetailsModalOpen(false);
      setSelectedNotification(null);
    }
  };

  const openNotificationDetails = (notification) => {
    setSelectedNotification(notification);
    setIsDetailsModalOpen(true);
    if (!notification.lida) {
      handleMarkAsRead(notification.id);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {totalUnreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                <span className="sr-only">unread messages</span>
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end">
          <div className="flex items-center justify-between p-2">
            <span className="text-sm font-semibold">Notificações</span>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <Button variant="link" size="sm" onClick={handleMarkAllAsRead} disabled={totalUnreadCount === 0} className="text-xs h-auto p-0">
                Marcar todas como lidas
              </Button>
            )}
          </div>
          <DropdownMenuSeparator />
          <ScrollArea className="h-[300px] w-full">
            {unreadNotifications.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">Tudo limpo por aqui!</p>
              </div>
            )}
            {unreadNotifications.map(notification => (
              <DropdownMenuItem key={notification.id} className="flex flex-col items-start space-y-1 p-3 cursor-pointer border-b last:border-0" onSelect={() => openNotificationDetails(notification)}>
                <div className="flex items-center w-full justify-between">
                  <div className="flex items-center gap-2">
                    {getNotificationIcon(notification.tipo)}
                    <span className="text-sm font-medium line-clamp-1">{notification.titulo}</span>
                  </div>
                  <time className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                    {formatDistanceToNowStrict(parseISO(notification.data_criacao), { addSuffix: true, locale: ptBR })}
                  </time>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 w-full">{notification.mensagem}</p>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/apoio/notificacoes/minhas" className="flex items-center justify-center p-2 text-sm font-medium text-primary cursor-pointer w-full">
              Ver todas as notificações
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedNotification && (
        <NotificacaoDetalhesModal
          notification={selectedNotification}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          onMarkAsRead={() => handleMarkAsRead(selectedNotification.id)}
          onDelete={() => handleDeleteNotification(selectedNotification.id)}
        />
      )}
    </>
  );
};

export default NotificacoesBell;