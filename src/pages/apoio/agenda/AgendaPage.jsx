import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet-async';

const AgendaPage = () => {
  const { toast } = useToast();

  const handleAction = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "🚧 Esta funcionalidade ainda não foi implementada.",
    });
  };

  return (
    <>
      <Helmet>
        <title>Agenda - Módulo de Apoio</title>
        <meta name="description" content="Página de agenda da equipe no módulo de apoio." />
      </Helmet>
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Agenda da Equipe</h1>
            <p className="text-muted-foreground">Visualize e gerencie os compromissos da sua equipe.</p>
          </div>
          <Button onClick={handleAction}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
              <div className="text-center text-muted-foreground">
                <CalendarIcon className="mx-auto h-12 w-12" />
                <p className="mt-2">O componente de calendário completo está em desenvolvimento.</p>
                <Button variant="link" onClick={handleAction}>Ver compromissos de hoje</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AgendaPage;