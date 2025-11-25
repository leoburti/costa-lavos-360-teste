
import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Bot, DollarSign, Users, Target, UserPlus, UserMinus, Loader2, ArrowUpRight, ArrowDownRight, Briefcase } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useAIInsight } from '@/hooks/useAIInsight';
import AIInsight from '@/components/AIInsight';
import DrilldownExplorer from '@/components/DrilldownExplorer';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

const ModernKPICard = ({ title, value, icon: Icon, trend, colorClass, formatFn }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all duration-300">
    <div className={cn("absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500", colorClass.text)}>
        <Icon className="w-20 h-20 -mr-6 -mt-6" />
    </div>
    <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
            <div className={cn("p-2.5 rounded-lg shadow-sm", colorClass.bg, colorClass.text)}>
                <Icon className="w-6 h-6" />
            </div>
            {trend !== undefined && (
                <div className={cn("flex items-center px-2.5 py-1 rounded-full text-xs font-bold", trend >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>
                    {trend >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
        <p className="text-2xl font-bold text-slate-900 tracking-tight">{formatFn ? formatFn(value) : value}</p>
    </div>
  </div>
);

const DonutChart = ({ data, type }) => {
  const chartData = data || [];
  const colors = type === 'churn' 
    ? { 'Ativo': '#10b981', 'Risco': '#f59e0b', 'Elevado': '#f97316', 'Crítico': '#ef4444' }
    : { 'Campeões': '#10b981', 'Fiéis': '#3b82f6', 'Em Risco': '#f43f5e', 'Outros': '#94a3b8' };
  
  if (chartData.length === 0) return <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Sem dados disponíveis.</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie 
            data={chartData} 
            dataKey="client_count" 
            nameKey={type === 'churn' ? 'phase' : 'segment'} 
            innerRadius={60} 
            outerRadius={80} 
            paddingAngle={5} 
            stroke="none"
        >
           {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[type === 'churn' ? entry.phase : entry.segment] || '#cbd5e1'} />)}
        </Pie>
        <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Legend verticalAlign="bottom" height={36} iconType="circle" />
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

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedSeller || !filters.startDate || !filters.endDate) return;
      setLoading(true);
      
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

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  const kpis = data?.kpis || {};

  // Memoize overrideFilters to prevent infinite loop in DrilldownExplorer
  const overrideFilters = useMemo(() => ({ sellers: [selectedSeller] }), [selectedSeller]);

  return (
    <>
      <Helmet>
        <title>Raio-X do Vendedor - Costa Lavos</title>
      </Helmet>
      <div className="space-y-8 pb-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Raio-X do Vendedor</h1>
            <p className="text-slate-500">Análise de performance individual e carteira de clientes.</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-4">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                </div>
                <Select value={selectedSeller || ''} onValueChange={setSelectedSeller} disabled={loading && sellers.length === 0}>
                <SelectTrigger className="w-full sm:w-[300px] pl-10 h-11 bg-slate-50 border-slate-200">
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
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-96 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
            <p className="text-slate-500 font-medium">Carregando dados do vendedor...</p>
          </div>
        ) : data ? (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <ModernKPICard 
                title="Receita Total" 
                value={kpis.total_revenue} 
                icon={DollarSign} 
                formatFn={formatCurrency} 
                colorClass={{ bg: 'bg-emerald-100', text: 'text-emerald-600' }}
              />
              <ModernKPICard 
                title="Clientes Ativos" 
                value={kpis.total_clients} 
                icon={Users} 
                colorClass={{ bg: 'bg-blue-100', text: 'text-blue-600' }}
              />
              <ModernKPICard 
                title="Ticket Médio" 
                value={kpis.average_ticket} 
                icon={Target} 
                formatFn={formatCurrency} 
                colorClass={{ bg: 'bg-purple-100', text: 'text-purple-600' }}
              />
              <ModernKPICard 
                title="Ganhos" 
                value={kpis.clients_gained} 
                icon={UserPlus} 
                colorClass={{ bg: 'bg-indigo-100', text: 'text-indigo-600' }}
              />
              <ModernKPICard 
                title="Perdidos" 
                value={kpis.clients_lost} 
                icon={UserMinus} 
                colorClass={{ bg: 'bg-red-100', text: 'text-red-600' }}
              />
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="explorer" className="w-full space-y-6">
              <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm inline-flex">
                <TabsList className="bg-transparent h-auto p-0 gap-2">
                    <TabsTrigger value="explorer" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 px-4 py-2 h-9">Explorador de Carteira</TabsTrigger>
                    <TabsTrigger value="health" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 px-4 py-2 h-9">Saúde da Carteira</TabsTrigger>
                    <TabsTrigger value="ia" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 px-4 py-2 h-9">Insights IA</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="explorer" className="mt-0 focus-visible:outline-none">
                <Card className="border-slate-200 shadow-md overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 px-6 py-4">
                        <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-indigo-500" />
                            Explorador de Vendas da Carteira
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <DrilldownExplorer 
                            analysisMode="seller" 
                            initialFilters={filters} 
                            overrideFilters={overrideFilters}
                        />
                    </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="health" className="mt-0 focus-visible:outline-none space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base font-bold text-slate-800">Risco de Churn (Perda de Clientes)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <DonutChart data={data.churn_analysis} type="churn" />
                    </CardContent>
                  </Card>
                  <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base font-bold text-slate-800">Segmentação RFM</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <DonutChart data={data.rfm_analysis} type="rfm" />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="ia" className="mt-0 focus-visible:outline-none">
                 <AIInsight insight={insight} loading={loadingAI} onRegenerate={generateInsights} />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <User className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900">Nenhum Vendedor Selecionado</h3>
            <p className="text-slate-500 mt-1">Selecione um vendedor acima para visualizar a análise.</p>
          </div>
        )}
      </div>
    </>
  );
}
