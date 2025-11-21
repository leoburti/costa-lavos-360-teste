import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet-async';

const PreferenciasNotificacoesPage = () => {
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "Preferências salvas!",
      description: "🚧 Funcionalidade em desenvolvimento.",
    });
  };

  return (
    <>
      <Helmet>
        <title>Preferências de Notificação - Costa Lavos</title>
        <meta name="description" content="Configure suas preferências de como e quando receber notificações." />
      </Helmet>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Preferências de Notificação</CardTitle>
            <CardDescription>Gerencie como e quando você recebe notificações.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tipos de Notificação</h3>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="novo_chamado" defaultChecked />
                  <Label htmlFor="novo_chamado">Novo Chamado Atribuído</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="mudanca_data" defaultChecked />
                  <Label htmlFor="mudanca_data">Mudança de Data/Hora de Evento</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="mudanca_status" defaultChecked />
                  <Label htmlFor="mudanca_status">Mudança de Status de Chamado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="cancelamento" defaultChecked />
                  <Label htmlFor="cancelamento">Cancelamento de Chamado/Evento</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="reagendamento" defaultChecked />
                  <Label htmlFor="reagendamento">Evento Reagendado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="bloqueio_removido" defaultChecked />
                  <Label htmlFor="bloqueio_removido">Bloqueio Removido</Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Canais de Notificação</h3>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="email" defaultChecked />
                  <Label htmlFor="email">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="push" />
                  <Label htmlFor="push">Push (no navegador)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="sistema" defaultChecked />
                  <Label htmlFor="sistema">Sistema (dentro da aplicação)</Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Horário de Notificações</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="hora_inicio_notif">Receber notificações a partir de</Label>
                  <Input id="hora_inicio_notif" type="time" defaultValue="08:00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora_fim_notif">Receber notificações até</Label>
                  <Input id="hora_fim_notif" type="time" defaultValue="18:00" />
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox id="nao_notificar_fora_horario" />
                <Label htmlFor="nao_notificar_fora_horario">Não notificar fora deste horário</Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="submit">Salvar Preferências</Button>
          </CardFooter>
        </Card>
      </form>
    </>
  );
};

export default PreferenciasNotificacoesPage;