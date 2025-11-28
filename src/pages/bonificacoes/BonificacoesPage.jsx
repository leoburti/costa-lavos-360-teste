
import React, { useState, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import LoadingSpinner from '@/components/LoadingSpinner';
import { Gift, ListPlus, FileSearch, BarChart2 } from 'lucide-react';

// Lazy load the components
const ConsultRequestsView = lazy(() => import('@/components/bonificacoes/ConsultRequestsView'));
const NewRequestView = lazy(() => import('@/components/bonificacoes/NewRequestView'));
const AnaliseBonificacaoPage = lazy(() => import('@/pages/bonificacoes/AnaliseBonificacaoPage'));

const BonificacoesPage = () => {
  const [activeTab, setActiveTab] = useState('nova-solicitacao');
  const { userContext, loading: authLoading } = useAuth();

  if (authLoading) {
    return <div className="flex h-full w-full items-center justify-center"><LoadingSpinner message="Carregando módulo de bonificações..." /></div>;
  }

  if (!userContext) {
    return (
        <div className="p-6">
            <Alert variant="destructive">
                <AlertTitle>Erro de Autenticação</AlertTitle>
                <AlertDescription>Não foi possível carregar as informações do usuário. Por favor, faça login novamente.</AlertDescription>
            </Alert>
        </div>
    );
  }

  const canAnalyze = userContext.role === 'Nivel 1' || userContext.role === 'Nivel 2' || userContext.role === 'Nivel 3' || userContext.role === 'Supervisor';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
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
            Crie, consulte e analise solicitações de bonificação.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-3 bg-white border shadow-sm p-1 rounded-lg">
          <TabsTrigger value="nova-solicitacao" className="data-[state=active]:bg-pink-50 data-[state=active]:text-pink-700 flex items-center gap-2 transition-all">
            <ListPlus className="h-4 w-4" /> Nova Solicitação
          </TabsTrigger>
          <TabsTrigger value="consultar" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 flex items-center gap-2 transition-all">
            <FileSearch className="h-4 w-4" /> Consultar / Aprovar
          </TabsTrigger>
          {canAnalyze && (
            <TabsTrigger value="analise" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 flex items-center gap-2 transition-all">
              <BarChart2 className="h-4 w-4" /> Análise de Bonificação
            </TabsTrigger>
          )}
        </TabsList>

        <Suspense fallback={<LoadingSpinner message="Carregando visualização..." />}>
          <TabsContent value="nova-solicitacao" className="focus-visible:outline-none focus-visible:ring-0">
            <NewRequestView onSuccess={() => setActiveTab('consultar')} />
          </TabsContent>

          <TabsContent value="consultar" className="focus-visible:outline-none focus-visible:ring-0">
             <ConsultRequestsView />
          </TabsContent>
          
          {canAnalyze && (
            <TabsContent value="analise" className="focus-visible:outline-none focus-visible:ring-0">
              <AnaliseBonificacaoPage />
            </TabsContent>
          )}
        </Suspense>
      </Tabs>
    </div>
  );
};

export default BonificacoesPage;
