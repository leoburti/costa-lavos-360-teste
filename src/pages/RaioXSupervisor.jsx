import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, Bot, DollarSign, Users, Target, UserPlus, UserMinus, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useAIInsight } from '@/hooks/useAIInsight';
import AIInsight from '@/components/AIInsight';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

export default function RaioXSupervisorPage() {
  const { filters } = useFilters();
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchSupervisors = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('mv_filter_options').select('supervisors').single();
      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao buscar supervisores', description: error.message });
      } else {
        const list = data?.supervisors || [];
        setSupervisors(list);
        if (list.length > 0) setSelectedSupervisor(list[0]);
      }
      setLoading(false);
    };
    fetchSupervisors();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedSupervisor || !filters.startDate || !filters.endDate) return;
      setLoading(true);
      const { data, error } = await supabase.rpc('get_supervisor_analytical_data', {
        p_start_date: filters.startDate,
        p_end_date: filters.endDate,
        p_supervisor_name: selectedSupervisor,
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
  }, [selectedSupervisor, filters]);

  const aiData = useMemo(() => {
    if (!data) return null;
    return {
      supervisor_name: selectedSupervisor,
      kpis: data.kpis,
      churn_summary: data.churn_analysis,
      rfm_summary: data.rfm_analysis
    };
  }, [data, selectedSupervisor]);

  const { insight, loading: loadingAI, generateInsights } = useAIInsight('supervisor_xray_analysis', aiData);

  useEffect(() => {
    if (aiData) generateInsights();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiData]);

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  const kpis = data?.kpis || {};

  return (
    <>
      <Helmet>
        <title>Raio-X do Supervisor - Costa Lavos</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Raio-X do Supervisor</h1>
            <p className="text-muted-foreground mt-1">Análise 360° da performance de um supervisor e sua equipe.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Select value={selectedSupervisor || ''} onValueChange={setSelectedSupervisor} disabled={loading && supervisors.length === 0}>
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue placeholder="Selecione um supervisor" />
              </SelectTrigger>
              <SelectContent>
                {supervisors.map(s => (
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
                      <h2 className="text-xl font-bold">{selectedSupervisor}</h2>
                      <p className="text-sm text-muted-foreground">Supervisor</p>
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
                  <KPICard title="Novos Clientes" value={kpis.clients_gained} icon={UserPlus} />
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
                    <h3 className="text-lg font-semibold mb-4">Performance da Equipe</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vendedor</TableHead>
                          <TableHead className="text-right">Receita</TableHead>
                          <TableHead className="text-right">Clientes Ativos</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.seller_performance?.map((seller) => (
                          <TableRow key={seller.name}>
                            <TableCell className="font-medium">{seller.name}</TableCell>
                            <TableCell className="text-right">{formatCurrency(seller.total_revenue)}</TableCell>
                            <TableCell className="text-right">{seller.active_clients}</TableCell>
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
            <p className="text-muted-foreground">Selecione um supervisor para ver a análise.</p>
          </div>
        )}
      </div>
    </>
  );
}