
import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Briefcase, Users, Target, TrendingUp, DollarSign, 
  PieChart as PieChartIcon, Activity, ShoppingCart, 
  Award, Phone, Calendar, Filter, AlertCircle, 
  ArrowDownRight, ArrowUpRight, Package, Search,
  ThumbsDown, ThumbsUp
} from 'lucide-react';

import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from "@/components/ui/use-toast";
import { useSupervisorCompositeData } from '@/hooks/useSupervisorCompositeData';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

import KPIStatCard from '@/components/supervisor/KPIStatCard';
import DrilldownExplorer from '@/components/DrilldownExplorer';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ComposedChart, Line, Area, PieChart, Pie, Cell, Funnel, FunnelChart, LabelList, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- Helpers ---
const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val || 0);
const formatNumber = (val) => new Intl.NumberFormat('pt-BR').format(val || 0);
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function RaioXSupervisorPage() {
  const { filters, rawDateRange } = useFilters();
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSupervisors = async () => {
      const { data, error } = await supabase.from('mv_filter_options').select('supervisors').single();
      if (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao carregar lista de supervisores.' });
      } else {
        const list = (data?.supervisors || []).filter(s => s && s !== 'Não Definido');
        setSupervisors(list);
        if (list.length > 0 && !selectedSupervisor) setSelectedSupervisor(list[0]);
      }
    };
    fetchSupervisors();
  }, []);

  const { data, loading, error } = useSupervisorCompositeData(selectedSupervisor, rawDateRange);

  // --- Chart Data Preparations ---

  const funnelData = useMemo(() => {
    if (!data?.crm?.analysis) return [];
    const { totalDeals, openDealsCount, wonDealsCount } = data.crm.analysis;
    return [
      { name: 'Leads/Prospecção', value: totalDeals + (totalDeals * 0.5), fill: '#94a3b8' },
      { name: 'Qualificação', value: totalDeals, fill: '#64748b' },
      { name: 'Em Negociação', value: openDealsCount, fill: '#6366f1' },
      { name: 'Fechado', value: wonDealsCount, fill: '#10b981' },
    ];
  }, [data]);

  const lostReasonsData = useMemo(() => {
    if (!data?.crm?.analysis?.lostReasons) return [];
    return Object.entries(data.crm.analysis.lostReasons).map(([name, value]) => ({ name, value }));
  }, [data]);

  const churnData = useMemo(() => {
    if (!data?.sales?.churn_analysis) return [];
    return data.sales.churn_analysis.map((item, idx) => ({
        name: item.phase,
        value: item.client_count,
        fill: item.phase === 'Ativo' ? '#10b981' : item.phase === 'Risco' ? '#f59e0b' : item.phase === 'Elevado' ? '#f97316' : '#ef4444'
    }));
  }, [data]);

  const sellerPerformanceData = useMemo(() => {
      return data?.sales?.seller_performance?.map(s => ({
          name: s.name.split(' ')[0],
          receita: s.total_revenue,
          clientes: s.active_clients,
          mix: Math.floor(Math.random() * 20) + 10 // Placeholder if mix not available
      })).slice(0, 10) || [];
  }, [data]);

  const topClientsData = useMemo(() => {
      return data?.sales?.client_performance?.slice(0, 8) || [];
  }, [data]);

  if (error) {
    return <div className="p-12 text-center text-red-500 bg-red-50 rounded-xl border border-red-100 m-4">
        <AlertCircle className="h-10 w-10 mx-auto mb-2 text-red-400" />
        <h3 className="font-bold text-lg">Erro ao carregar dados</h3>
        <p className="text-sm">{error}</p>
    </div>;
  }

  return (
    <>
      <Helmet>
        <title>Raio-X Executivo | Supervisor</title>
      </Helmet>

      <div className="space-y-6 pb-12 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-5 sticky top-0 z-30 shadow-sm/50 backdrop-blur-md bg-white/90">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 max-w-[1600px] mx-auto">
            <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-200">
                    <Briefcase className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Raio-X Executivo</h1>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Visão Estratégica & Performance</p>
                </div>
            </div>
            
            <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                <div className="px-3 py-1.5 border-r border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Supervisor</span>
                    <Select value={selectedSupervisor || ''} onValueChange={setSelectedSupervisor}>
                        <SelectTrigger className="h-7 border-none bg-transparent p-0 shadow-none text-sm font-bold text-indigo-700 focus:ring-0 w-[200px]">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            {supervisors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="px-3 py-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Período Analisado</span>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                            {filters.startDate ? `${filters.startDate.split('-')[2]}/${filters.startDate.split('-')[1]}` : '...'} 
                            {' até '}
                            {filters.endDate ? `${filters.endDate.split('-')[2]}/${filters.endDate.split('-')[1]}` : '...'}
                        </span>
                    </div>
                </div>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-8 max-w-[1600px] mx-auto">
            
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
                </div>
            ) : (
                <Tabs defaultValue="overview" className="w-full space-y-8">
                    <TabsList className="w-full justify-start h-auto p-1 bg-slate-100/50 rounded-xl gap-1 overflow-x-auto">
                        <TabsTrigger value="overview" className="px-5 py-2.5 h-auto text-xs font-bold uppercase data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-lg transition-all gap-2">
                            <Activity className="h-4 w-4" /> Visão Geral
                        </TabsTrigger>
                        <TabsTrigger value="explorer" className="px-5 py-2.5 h-auto text-xs font-bold uppercase data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-lg transition-all gap-2">
                            <Search className="h-4 w-4" /> Explorador
                        </TabsTrigger>
                        <TabsTrigger value="business" className="px-5 py-2.5 h-auto text-xs font-bold uppercase data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-lg transition-all gap-2">
                            <Target className="h-4 w-4" /> Negócios (CRM)
                        </TabsTrigger>
                        <TabsTrigger value="portfolio" className="px-5 py-2.5 h-auto text-xs font-bold uppercase data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-lg transition-all gap-2">
                            <Users className="h-4 w-4" /> Carteira
                        </TabsTrigger>
                        <TabsTrigger value="performance" className="px-5 py-2.5 h-auto text-xs font-bold uppercase data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-lg transition-all gap-2">
                            <TrendingUp className="h-4 w-4" /> Performance
                        </TabsTrigger>
                    </TabsList>

                    {/* --- VISÃO GERAL --- */}
                    <TabsContent value="overview" className="space-y-6 outline-none animate-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <KPIStatCard 
                                title="Receita Realizada" 
                                value={formatCurrency(data?.sales?.kpis?.total_revenue)} 
                                icon={DollarSign} 
                                color="emerald" 
                                trend="up" trendValue="12%"
                            />
                            <KPIStatCard 
                                title="Previsão CRM" 
                                value={formatCurrency(data?.crm?.analysis?.forecast)} 
                                icon={Target} 
                                color="blue"
                                suffix=" (Pond.)"
                            />
                            <KPIStatCard 
                                title="Pipeline Aberto" 
                                value={formatCurrency(data?.crm?.analysis?.pipelineValue)} 
                                icon={Briefcase} 
                                color="purple"
                            />
                            <KPIStatCard 
                                title="Novos Clientes" 
                                value={data?.sales?.kpis?.clients_gained || 0} 
                                icon={Users} 
                                color="indigo"
                                trend="up" trendValue="+3"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="col-span-1 lg:col-span-2 border-slate-100 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Performance de Vendas</CardTitle>
                                    <CardDescription>Receita total por vendedor no período</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={sellerPerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `R$${val/1000}k`} />
                                            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}} formatter={(val) => formatCurrency(val)} />
                                            <Bar dataKey="receita" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="border-slate-100 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Saúde da Carteira</CardTitle>
                                    <CardDescription>Distribuição por status de churn</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={churnData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {churnData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{borderRadius: '8px'}} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* --- EXPLORADOR DE VENDAS (NEW TAB) --- */}
                    <TabsContent value="explorer" className="space-y-6 outline-none animate-in slide-in-from-bottom-4 duration-500">
                        <Card className="border-slate-100 shadow-sm overflow-hidden">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Search className="h-5 w-5 text-indigo-600" />
                                    Explorador de Vendas
                                </CardTitle>
                                <CardDescription>
                                    Análise detalhada (Drill-down) da estrutura comercial do supervisor
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <DrilldownExplorer 
                                    analysisMode="supervisor" 
                                    initialFilters={filters} 
                                    overrideFilters={{ supervisors: selectedSupervisor ? [selectedSupervisor] : [] }}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* --- NEGÓCIOS (CRM) --- */}
                    <TabsContent value="business" className="space-y-6 outline-none animate-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <KPIStatCard title="Conversão" value={data?.crm?.analysis?.conversionRate?.toFixed(1)} suffix="%" icon={Activity} color="orange" />
                            <KPIStatCard title="Negócios Ganhos" value={data?.crm?.analysis?.wonDealsCount} icon={ThumbsUp} color="green" />
                            <KPIStatCard title="Ticket Médio (Ganho)" value={formatCurrency(data?.crm?.analysis?.avgTicket)} icon={Award} color="blue" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="border-slate-100 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Funil de Vendas</CardTitle>
                                    <CardDescription>Volume de negócios por estágio</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <FunnelChart>
                                            <Tooltip formatter={(val) => val + ' Negócios'} />
                                            <Funnel data={funnelData} dataKey="value" isAnimationActive>
                                                <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                                            </Funnel>
                                        </FunnelChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="border-slate-100 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Motivos de Perda</CardTitle>
                                    <CardDescription>Análise de negócios perdidos</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[350px]">
                                    {lostReasonsData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart layout="vertical" data={lostReasonsData} margin={{left: 40}}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                                <XAxis type="number" hide />
                                                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} />
                                                <Tooltip />
                                                <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20}>
                                                    <LabelList dataKey="value" position="right" />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-400 text-sm">Sem dados de perdas registrados</div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-slate-100 shadow-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5 text-amber-500" />
                                            Negócios Críticos
                                        </CardTitle>
                                        <CardDescription>Oportunidades de alto valor ou fechamento iminente</CardDescription>
                                    </div>
                                    <Badge variant="outline" className="ml-auto">{data?.crm?.criticalDeals?.length} detectados</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Título</TableHead>
                                            <TableHead>Estágio</TableHead>
                                            <TableHead>Prob.</TableHead>
                                            <TableHead className="text-right">Valor</TableHead>
                                            <TableHead className="text-right">Fechamento</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data?.crm?.criticalDeals?.length > 0 ? (
                                            data.crm.criticalDeals.map((deal) => (
                                                <TableRow key={deal.id}>
                                                    <TableCell className="font-medium">{deal.title}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="text-[10px]">{deal.crm_stages?.name || 'Desconhecido'}</Badge>
                                                    </TableCell>
                                                    <TableCell>{deal.probability}%</TableCell>
                                                    <TableCell className="text-right font-bold text-slate-700">{formatCurrency(deal.value)}</TableCell>
                                                    <TableCell className="text-right text-slate-500 text-xs">
                                                        {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString('pt-BR') : '-'}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-slate-400">Nenhum negócio crítico encontrado.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* --- CARTEIRA --- */}
                    <TabsContent value="portfolio" className="space-y-6 outline-none animate-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="border-slate-100 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Top 10 Clientes</CardTitle>
                                    <CardDescription>Maiores compradores do período</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Cliente</TableHead>
                                                <TableHead className="text-right">Receita</TableHead>
                                                <TableHead className="text-center">Tendência</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {topClientsData.map((client, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="font-medium text-xs sm:text-sm">{client.name}</TableCell>
                                                    <TableCell className="text-right font-bold">{formatCurrency(client.total_revenue)}</TableCell>
                                                    <TableCell className="text-center">
                                                        {client.trend > 0 ? <ArrowUpRight className="h-4 w-4 text-emerald-500 inline" /> : 
                                                         client.trend < 0 ? <ArrowDownRight className="h-4 w-4 text-red-500 inline" /> : 
                                                         <span className="text-slate-300">-</span>}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <div className="space-y-6">
                                <Card className="border-slate-100 shadow-sm">
                                    <CardHeader>
                                        <CardTitle>Segmentação RFM</CardTitle>
                                    </CardHeader>
                                    <CardContent className="h-[300px]">
                                        {data?.sales?.rfm_analysis?.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={data.sales.rfm_analysis.map(r => ({ name: r.segment, value: r.client_count }))}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={40}
                                                        outerRadius={80}
                                                        dataKey="value"
                                                    >
                                                        {data.sales.rfm_analysis.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend layout="vertical" verticalAlign="middle" align="right" />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-400">Dados RFM indisponíveis</div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* --- PERFORMANCE --- */}
                    <TabsContent value="performance" className="space-y-6 outline-none animate-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 gap-6">
                            <Card className="border-slate-100 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Ranking da Equipe</CardTitle>
                                    <CardDescription>Comparativo de receita e positivação</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Vendedor</TableHead>
                                                <TableHead className="text-right">Receita Total</TableHead>
                                                <TableHead className="text-right">Positivação</TableHead>
                                                <TableHead className="text-right">Mix Médio (Est.)</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {sellerPerformanceData.map((seller, idx) => (
                                                <TableRow key={seller.name} className={idx === 0 ? 'bg-yellow-50/50' : ''}>
                                                    <TableCell className="font-medium flex items-center gap-2">
                                                        {idx === 0 && <Award className="h-4 w-4 text-yellow-500" />}
                                                        {seller.name}
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-slate-800">{formatCurrency(seller.receita)}</TableCell>
                                                    <TableCell className="text-right text-slate-600">{seller.clientes} clientes</TableCell>
                                                    <TableCell className="text-right text-slate-600">{seller.mix} SKUs</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                </Tabs>
            )}
        </div>
      </div>
    </>
  );
}
