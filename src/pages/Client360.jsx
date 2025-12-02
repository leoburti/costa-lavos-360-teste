import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';

// Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingState, ErrorState, EmptyState } from '@/components/common';
import { ArrowLeft, MapPin, Phone, Mail, Building2, TrendingUp, AlertTriangle, Calendar, DollarSign, Package } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import SalesChart from '@/components/SalesChart';

export default function Client360() {
  const { clientId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [clientInfo, setClientInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [errorInfo, setErrorInfo] = useState(null);

  const nameQuery = searchParams.get('name');

  // 1. Resolve Client Identity (ID vs Name)
  useEffect(() => {
    const fetchClientIdentity = async () => {
      setLoadingInfo(true);
      try {
        let query = supabase
          .from('bd-cl')
          .select('Cliente, Loja, Nome, "N Fantasia", Endereco, "End.Entrega", "Nome Supervisor", "Nome Vendedor"')
          .limit(1);

        if (clientId && clientId !== 'lookup') {
           // Try to match exact ID (assuming format CODE-STORE or just CODE)
           if (clientId.includes('-')) {
             const [code, store] = clientId.split('-');
             query = query.eq('Cliente', code).eq('Loja', store);
           } else {
             query = query.eq('Cliente', clientId);
           }
        } else if (nameQuery) {
           // Fallback: Search by name if ID is missing
           query = query.ilike('Nome', `%${nameQuery}%`);
        } else {
           throw new Error("Nenhum identificador de cliente fornecido.");
        }

        const { data, error } = await query.single();

        if (error) throw error;
        if (!data) throw new Error("Cliente não encontrado.");

        setClientInfo({
          code: data.Cliente,
          store: data.Loja,
          name: data.Nome,
          fantasy: data['N Fantasia'] || data.Nome,
          address: data.Endereco,
          city: data['End.Entrega'],
          supervisor: data['Nome Supervisor'],
          seller: data['Nome Vendedor']
        });
      } catch (err) {
        console.error("Error fetching client identity:", err);
        setErrorInfo(err);
      } finally {
        setLoadingInfo(false);
      }
    };

    fetchClientIdentity();
  }, [clientId, nameQuery]);

  // 2. Fetch Analytical Data (Only after we have code/store)
  const kpiParams = useMemo(() => {
    if (!clientInfo) return null;
    return {
      p_client_code: String(clientInfo.code),
      p_store: String(clientInfo.store)
    };
  }, [clientInfo]);

  const { data: kpis, loading: loadingKpis } = useAnalyticalData(
    'get_single_client_kpis',
    kpiParams,
    { enabled: !!clientInfo }
  );

  // 3. Fetch History (Using existing RPC or direct query for chart)
  // We'll use a direct query for the chart to ensure we get the exact data shape we need for the chart
  const [salesHistory, setSalesHistory] = useState([]);
  useEffect(() => {
    if (!clientInfo) return;
    
    const fetchHistory = async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 12);

      const { data } = await supabase
        .from('bd-cl')
        .select('"DT Emissao", "Total"')
        .eq('Cliente', clientInfo.code)
        .eq('Loja', clientInfo.store)
        .gte('"DT Emissao"', startDate.toISOString())
        .order('"DT Emissao"', { ascending: true });

      if (data) {
        // Aggregate by month
        const agg = data.reduce((acc, curr) => {
          const date = new Date(curr['DT Emissao']);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!acc[key]) acc[key] = 0;
          acc[key] += curr['Total'];
          return acc;
        }, {});

        const chartData = Object.entries(agg).map(([date, total]) => ({
          date,
          total
        })).sort((a, b) => a.date.localeCompare(b.date));
        
        setSalesHistory(chartData);
      }
    };
    fetchHistory();
  }, [clientInfo]);

  if (loadingInfo) return <LoadingState message="Carregando perfil do cliente..." />;
  if (errorInfo) return <ErrorState error={errorInfo} onRetry={() => window.location.reload()} />;
  if (!clientInfo) return <EmptyState title="Cliente não encontrado" />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <Helmet>
        <title>{clientInfo.fantasy} | Visão 360</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-lg border shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{clientInfo.fantasy}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {clientInfo.name}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span>ID: {clientInfo.code}-{clientInfo.store}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {clientInfo.city}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
           {/* Tags or Status */}
           <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${kpis?.churn === 'Crítico' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
             {kpis?.churn === 'Crítico' ? 'Risco de Churn' : 'Cliente Ativo'}
           </div>
           <div className="px-3 py-1 rounded-full text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-200">
             Classe {kpis?.abc || '-'}
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-12">
        
        {/* Sidebar Info */}
        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalhes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-1">Endereço</p>
                <p className="font-medium">{clientInfo.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Supervisor</p>
                  <p className="font-medium">{clientInfo.supervisor || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Vendedor</p>
                  <p className="font-medium">{clientInfo.seller || '-'}</p>
                </div>
              </div>
              <div className="pt-4 flex flex-col gap-2">
                <Button variant="outline" className="w-full justify-start h-9 text-xs">
                  <Phone className="mr-2 h-3 w-3" /> Contatar (Indisponível)
                </Button>
                <Button variant="outline" className="w-full justify-start h-9 text-xs">
                  <Mail className="mr-2 h-3 w-3" /> Enviar Email (Indisponível)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Area */}
        <div className="md:col-span-9 space-y-6">
          
          {/* KPIs */}
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard 
              title="Curva ABC" 
              value={kpis?.abc || '-'} 
              icon={TrendingUp} 
              subtitle="Classificação de Valor"
              loading={loadingKpis}
            />
            <MetricCard 
              title="Status RFM" 
              value={kpis?.rfm || '-'} 
              icon={Package} 
              subtitle="Recência/Freq./Valor"
              loading={loadingKpis}
            />
            <MetricCard 
              title="Risco Churn" 
              value={kpis?.churn || '-'} 
              icon={AlertTriangle} 
              subtitle="Baseado em inatividade"
              status={kpis?.churn === 'Crítico' ? 'danger' : 'success'}
              loading={loadingKpis}
            />
            <MetricCard 
              title="Tendência" 
              value={kpis?.trend || '-'} 
              icon={Calendar} 
              subtitle="vs. Período Anterior"
              loading={loadingKpis}
            />
          </div>

          {/* Charts & Tables */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Evolução de Vendas (12 Meses)</CardTitle>
                  <CardDescription>Volume financeiro acumulado mensalmente.</CardDescription>
                </CardHeader>
                <CardContent>
                  <SalesChart 
                    data={salesHistory} 
                    height={350}
                    series={[{ key: 'total', name: 'Vendas', color: '#2563eb' }]}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Compras</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground py-10 text-center">
                    Funcionalidade de histórico detalhado será implementada na próxima fase.
                    <br/>
                    Visualize os dados consolidados na aba "Visão Geral".
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </div>
  );
}