import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Helmet } from 'react-helmet-async';

const NotificacoesPage = () => {
  const { toast } = useToast();
  const [notificacoes, setNotificacoes] = useState([
    { id: 1, titulo: 'Novo chamado atribuído', descricao: 'Chamado #1234 para "Padaria Pão Quente" foi atribuído a você.', lida: false, data: '2025-11-19T10:00:00Z' },
    { id: 2, titulo: 'Manutenção agendada', descricao: 'Sua visita ao "Mercado Preço Bom" foi agendada para 20/11/2025.', lida: false, data: '2025-11-19T09:30:00Z' },
    { id: 3, titulo: 'Contrato de comodato atualizado', descricao: 'O contrato do cliente "Supermercados Gigante" foi atualizado.', lida: true, data: '2025-11-18T15:00:00Z' },
  ]);

  const marcarComoLida = (id) => {
    setNotificacoes(notis => notis.map(n => n.id === id ? { ...n, lida: true } : n));
    toast({ title: "Notificação marcada como lida." });
  };

  const marcarTodasComoLidas = () => {
    setNotificacoes(notis => notis.map(n => ({ ...n, lida: true })));
    toast({ title: "Todas as notificações foram marcadas como lidas." });
  };

  return (
    <>
      <Helmet>
        <title>Notificações - Módulo de Apoio</title>
        <meta name="description" content="Central de notificações para o módulo de apoio." />
      </Helmet>
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Central de Notificações</h1>
            <p className="text-muted-foreground">Fique por dentro de todas as atualizações importantes.</p>
          </div>
          <Button variant="outline" onClick={marcarTodasComoLidas}>
            <CheckCheck className="w-4 h-4 mr-2" />
            Marcar todas como lidas
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Notificações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notificacoes.map(noti => (
                <div key={noti.id} className={cn("p-4 rounded-lg flex items-center justify-between transition-colors", noti.lida ? "bg-muted/50" : "bg-primary/5")}>
                  <div className="flex items-center gap-4">
                    <Bell className={cn("w-6 h-6", noti.lida ? "text-muted-foreground" : "text-primary")} />
                    <div>
                      <h3 className={cn("font-semibold", noti.lida && "text-muted-foreground")}>{noti.titulo}</h3>
                      <p className="text-sm text-muted-foreground">{noti.descricao}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(noti.data).toLocaleString()}</p>
                    </div>
                  </div>
                  {!noti.lida && (
                    <Button variant="ghost" size="sm" onClick={() => marcarComoLida(noti.id)}>Marcar como lida</Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default NotificacoesPage;