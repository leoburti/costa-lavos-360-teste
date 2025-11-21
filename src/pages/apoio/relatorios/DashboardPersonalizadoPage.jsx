import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Save, Share2, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet-async';

const DashboardPersonalizadoPage = () => {
  const { toast } = useToast();

  const handleAction = (action) => {
    toast({ title: "Funcionalidade em desenvolvimento", description: `🚧 A ação "${action}" ainda não foi implementada.` });
  };

  return (
    <>
      <Helmet><title>Dashboard Personalizado - APoio</title></Helmet>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Editor de Dashboard Personalizado</CardTitle>
            <div className="flex flex-wrap gap-4 pt-4">
              <Select><SelectTrigger className="w-full md:w-[250px]"><SelectValue placeholder="Selecione um dashboard salvo..." /></SelectTrigger><SelectContent><SelectItem value="meu-dash">Meu Dashboard</SelectItem></SelectContent></Select>
              <Button onClick={() => handleAction('Novo Dashboard')}><PlusCircle className="mr-2 h-4 w-4" /> Novo Dashboard</Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>Widgets Disponíveis</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Arraste e solte os widgets no seu dashboard. (Funcionalidade em desenvolvimento)</p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Preview: Meu Dashboard</CardTitle></CardHeader>
            <CardContent className="border-2 border-dashed border-muted rounded-lg min-h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">Área de visualização do dashboard.</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="destructive" onClick={() => handleAction('Deletar')}><Trash2 className="mr-2 h-4 w-4" /> Deletar</Button>
          <Button variant="outline" onClick={() => handleAction('Compartilhar')}><Share2 className="mr-2 h-4 w-4" /> Compartilhar</Button>
          <Button onClick={() => handleAction('Salvar')}><Save className="mr-2 h-4 w-4" /> Salvar Dashboard</Button>
        </div>
      </div>
    </>
  );
};

export default DashboardPersonalizadoPage;