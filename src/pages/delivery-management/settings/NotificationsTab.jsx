import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, MessageSquare, Mail } from 'lucide-react';

const NotificationsTab = ({ data, onChange }) => {
  const notifications = data.notifications || { 
    channels: { email: true, sms: false, push: true },
    templates: { created: '', outForDelivery: '', delivered: '' }
  };

  const handleChannelToggle = (channel) => {
    onChange({
      ...data,
      notifications: {
        ...notifications,
        channels: { ...notifications.channels, [channel]: !notifications.channels[channel] }
      }
    });
  };

  const handleTemplateChange = (type, text) => {
    onChange({
      ...data,
      notifications: {
        ...notifications,
        templates: { ...notifications.templates, [type]: text }
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Canais de Notificação</CardTitle>
          <CardDescription>Escolha como os clientes serão notificados sobre o status da entrega.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <div className="flex flex-col">
                <Label className="font-bold">Email</Label>
                <span className="text-xs text-muted-foreground">Notificações detalhadas</span>
              </div>
            </div>
            <Switch checked={notifications.channels.email} onCheckedChange={() => handleChannelToggle('email')} />
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <div className="flex flex-col">
                <Label className="font-bold">SMS / WhatsApp</Label>
                <span className="text-xs text-muted-foreground">Mensagens rápidas</span>
              </div>
            </div>
            <Switch checked={notifications.channels.sms} onCheckedChange={() => handleChannelToggle('sms')} />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-orange-600" />
              <div className="flex flex-col">
                <Label className="font-bold">Push</Label>
                <span className="text-xs text-muted-foreground">App do Cliente</span>
              </div>
            </div>
            <Switch checked={notifications.channels.push} onCheckedChange={() => handleChannelToggle('push')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Templates de Mensagem</CardTitle>
          <CardDescription>Personalize o conteúdo das mensagens enviadas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="created">
            <TabsList className="mb-4">
              <TabsTrigger value="created">Pedido Criado</TabsTrigger>
              <TabsTrigger value="out">Saiu para Entrega</TabsTrigger>
              <TabsTrigger value="delivered">Entregue</TabsTrigger>
            </TabsList>
            
            <TabsContent value="created" className="space-y-2">
              <Label>Mensagem de Confirmação</Label>
              <Textarea 
                rows={4} 
                value={notifications.templates.created} 
                onChange={(e) => handleTemplateChange('created', e.target.value)}
                placeholder="Olá {nome_cliente}, seu pedido #{pedido_id} foi recebido e está sendo processado."
              />
              <p className="text-xs text-muted-foreground">Variáveis: {'{nome_cliente}'}, {'{pedido_id}'}, {'{data_prevista}'}</p>
            </TabsContent>

            <TabsContent value="out" className="space-y-2">
              <Label>Mensagem de Saída</Label>
              <Textarea 
                rows={4} 
                value={notifications.templates.outForDelivery} 
                onChange={(e) => handleTemplateChange('outForDelivery', e.target.value)}
                placeholder="Seu pedido #{pedido_id} saiu para entrega! Acompanhe em tempo real: {link_rastreio}"
              />
              <p className="text-xs text-muted-foreground">Variáveis: {'{nome_cliente}'}, {'{pedido_id}'}, {'{motorista}'}, {'{link_rastreio}'}</p>
            </TabsContent>

            <TabsContent value="delivered" className="space-y-2">
              <Label>Mensagem de Conclusão</Label>
              <Textarea 
                rows={4} 
                value={notifications.templates.delivered} 
                onChange={(e) => handleTemplateChange('delivered', e.target.value)}
                placeholder="Entrega realizada com sucesso! Obrigado por escolher a nossa empresa."
              />
              <p className="text-xs text-muted-foreground">Variáveis: {'{nome_cliente}'}, {'{pedido_id}'}</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsTab;