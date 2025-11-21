import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, Bot, DollarSign, Users, Target, UserPlus, UserMinus, Loader2, ShoppingBag } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useAIInsight } from '@/hooks/useAIInsight';
import AIInsight from '@/components/AIInsight';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Componentes locais para garantir identidade visual exata com Raio-X Supervisor
const KPICard = ({ title, value, icon: Icon, formatFn }) => (
  <Card className="flex-1 min-w-[160px] bg-background/50 shadow-md">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <p className="text-2xl font-bold">{formatFn ? formatFn(value) : value}</p>
      {title === 'Clientes Perdidos' && value === 0 && (
        <p className="text-xs text-muted-foreground mt-1">Nenhum dado no período.</p>
      )}
    </CardContent>
  </Card>
);

const ChurnChart = ({ data }) => {
  const chartData = data || [];
  const colors = { 'Ativo': '#22C55E', 'Risco': '#F59E0B', 'Elevado': '#F97316', 'Crítico': '#EF4444' };
  
  if (chartData.length === 0) return <div className="flex items-center justify-center h-64 text-muted-foreground">Sem dados de Churn.</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={chartData} dataKey="client_count" nameKey="phase" outerRadius={80} label>
          {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[entry.phase] || '#8884d8'} />)}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

const RfmChart = ({ data }) => {
  const chartData = data || [];
  const colors = { 'Campeões': '#10B981', 'Fiéis': '#3B82F6', 'Em Risco': '#F43F5E', 'Outros': '#6B7280' };

  if (chartData.length === 0) return <div className="flex items-center justify-center h-64 text-muted-foreground">Sem dados RFM.</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={chartData} dataKey="client_count" nameKey="segment" innerRadius={60} outerRadius={80} paddingAngle={5} label>
           {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[entry.segment] || '#8884d8'} />)}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default function RaioXVendedorPage() {
  const { filters } = useFilters();
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // Carrega a lista de vendedores
  useEffect(() => {
    const fetchSellers = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('mv_filter_options').select('sellers').single();
      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao buscar vendedores', description: error.message });
      } else {
        const list = data?.sellers || [];
        setSellers(list);
        if (list.length > 0) setSelectedSeller(list[0]);
      }
      setLoading(false);
    };
    fetchSellers();
  }, []);

  // Carrega os dados analíticos do vendedor selecionado
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedSeller || !filters.startDate || !filters.endDate) return;
      setLoading(true);
      
      // Usa a RPC específica para vendedor que retorna a estrutura correta
      const { data, error } = await supabase.rpc('get_seller_analytical_data', {
        p_start_date: filters.startDate,
        p_end_date: filters.endDate,
        p_seller_name: selectedSeller,
        p_exclude_employees: filters.excludeEmployees
      });

      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao buscar dados', description: error.message });
        setData(null);
      } else {
        setData(data);
      }
      setLoading(false);
    };
    fetchData();
  }, [selectedSeller, filters]);

  const aiData = useMemo(() => {
    if (!data) return null;
    return {
      seller_name: selectedSeller,
      kpis: data.kpis,
      churn_summary: data.churn_analysis,
      rfm_summary: data.rfm_analysis
    };
  }, [data, selectedSeller]);

  const { insight, loading: loadingAI, generateInsights } = useAIInsight('seller_xray_analysis', aiData);

  useEffect(() => {
    if (aiData) generateInsights();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiData]);

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  const kpis = data?.kpis || {};

  return (
    <>
      <Helmet>
        <title>Raio-X do Vendedor - Costa Lavos</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Raio-X do Vendedor</h1>
            <p className="text-muted-foreground mt-1">Análise 360° da performance individual e carteira de clientes.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Select value={selectedSeller || ''} onValueChange={setSelectedSeller} disabled={loading && sellers.length === 0}>
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue placeholder="Selecione um vendedor" />
              </SelectTrigger>
              <SelectContent>
                {sellers.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : data ? (
          <>
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                      <Briefcase className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{selectedSeller}</h2>
                      <p className="text-sm text-muted-foreground">Vendedor</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => toast({ title: "Funcionalidade em desenvolvimento", description: "Solicite a implementação em um próximo prompt."})}
                    className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-opacity"
                  >
                    <Bot className="h-5 w-5 mr-2" />
                    One-on-One com o Senhor Lavos
                  </Button>
                </div>
                
                <div className="mt-6 flex flex-wrap gap-4">
                  <KPICard title="Receita Total" value={kpis.total_revenue} icon={DollarSign} formatFn={formatCurrency} />
                  <KPICard title="Clientes Ativos" value={kpis.total_clients} icon={Users} />
                  <KPICard title="Ticket Médio" value={kpis.average_ticket} icon={Target} formatFn={formatCurrency} />
                  <KPICard title="Clientes Ganhos" value={kpis.clients_gained} icon={UserPlus} />
                  <KPICard title="Clientes Perdidos" value={kpis.clients_lost} icon={UserMinus} />
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="ia" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ia">Visão Geral (IA)</TabsTrigger>
                <TabsTrigger value="sales">Explorador de Vendas</TabsTrigger>
                <TabsTrigger value="wallet">Análise de Carteira</TabsTrigger>
              </TabsList>
              <TabsContent value="ia" className="mt-4">
                 <AIInsight insight={insight} loading={loadingAI} onRegenerate={generateInsights} />
              </TabsContent>
              <TabsContent value="sales" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Performance por Cliente</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead className="text-right">Receita</TableHead>
                          <TableHead className="text-right">Qtd. Pedidos</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.client_performance?.map((client) => (
                          <TableRow key={client.name}>
                            <TableCell className="font-medium">{client.name}</TableCell>
                            <TableCell className="text-right">{formatCurrency(client.total_revenue)}</TableCell>
                            <TableCell className="text-right">{client.sales_count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="wallet" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Risco de Churn</h3>
                      <ChurnChart data={data.churn_analysis} />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Segmentação RFM</h3>
                      <RfmChart data={data.rfm_analysis} />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Selecione um vendedor para ver a análise.</p>
          </div>
        )}
      </div>
    </>
  );
}