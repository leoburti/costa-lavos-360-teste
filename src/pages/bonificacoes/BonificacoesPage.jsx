
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useDataScope } from '@/hooks/useDataScope';
import ConsultRequestsView from '@/components/bonificacoes/ConsultRequestsView';
import NewRequestView from '@/components/bonificacoes/NewRequestView';
import { Gift, ListPlus, FileSearch } from 'lucide-react';

const BonificacoesPage = () => {
  const [activeTab, setActiveTab] = useState('nova-solicitacao');
  const { user } = useAuth();
  const { isRestricted } = useDataScope();

  // View state for internal navigation within sub-components
  const [view, setView] = useState('initial');

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <Helmet>
        <title>Bonificações | Costa Lavos 360°</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Gift className="h-8 w-8 text-pink-600" /> 
            Gestão de Bonificações
          </h1>
          <p className="text-muted-foreground mt-1">
            {isRestricted 
                ? "Gerencie suas solicitações de bonificação e acompanhe aprovações."
                : "Central completa de controle, aprovação e histórico de bonificações."
            }
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full md:w-[600px] grid-cols-2 bg-white border shadow-sm p-1 rounded-lg">
          <TabsTrigger value="nova-solicitacao" className="data-[state=active]:bg-pink-50 data-[state=active]:text-pink-700 flex items-center gap-2">
            <ListPlus className="h-4 w-4" /> Nova Solicitação
          </TabsTrigger>
          <TabsTrigger value="consultar" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 flex items-center gap-2">
            <FileSearch className="h-4 w-4" /> Consultar / Aprovar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nova-solicitacao" className="space-y-4 animate-in fade-in-50 duration-300">
          <Card className="border-t-4 border-t-pink-500 shadow-md">
            <CardHeader>
              <CardTitle>Nova Bonificação</CardTitle>
              <CardDescription>Preencha os dados para criar uma nova solicitação de bonificação.</CardDescription>
            </CardHeader>
            <CardContent>
              <NewRequestView onSuccess={() => setActiveTab('consultar')} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultar" className="space-y-4 animate-in fade-in-50 duration-300">
           <ConsultRequestsView setView={setView} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BonificacoesPage;
