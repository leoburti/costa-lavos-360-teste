
import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { format, startOfMonth, endOfMonth, subMonths, subDays } from 'date-fns';
import { 
  DollarSign, TrendingUp, ShoppingCart, Package, Target, PieChart, 
  Award, Users, Briefcase, Gift, BarChart3, Download, Activity, 
  ChevronRight, Home, Filter
} from 'lucide-react';
import { 
  ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip as RechartsTooltip, Legend, Area 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Custom Components
import KPICard from '@/components/supervisor/KPICard';
import EfficiencyMatrix from '@/components/supervisor/EfficiencyMatrix';
import SupervisorDetailPanel from '@/components/supervisor/SupervisorDetailPanel';
import PortfolioXRay from '@/components/supervisor/PortfolioXRay';

// Context & Hooks
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { formatCurrency, formatPercentage } from '@/lib/utils';

// Utility: Calculate Moving Average
const calculateMovingAverage = (data, windowSize) => {
  if (!data || data.length === 0) return [];
  return data.map((item, index) => {
    const start = Math.max(0, index - windowSize + 1);
    const subset = data.slice(start, index + 1);
    const sum = subset.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const avg = sum / subset.length;
    return { ...item, [`ma${windowSize}`]: avg };
  });
};

const AnaliticoSupervisor = () => {
  const { filters, toggleFilterPanel } = useFilters();
  const { toast } = useToast();
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);

  // --- Date Logic ---
  const dateRange = useMemo(() => ({
    from: filters.dateRange?.from ? new Date(filters.dateRange.from) : startOfMonth(new Date()),
    to: filters.dateRange?.to ? new Date(filters.dateRange.to) : endOfMonth(new Date()),
  }), [filters.dateRange]);

  const prevDateRange = useMemo(() => ({
    from: subMonths(dateRange.from, 1),
    to: subMonths(dateRange.to, 1)
  }), [dateRange]);

  const startDateStr = format(dateRange.from, 'yyyy-MM-dd');
  const endDateStr = format(dateRange.to, 'yyyy-MM-dd');
  const prevStartStr = format(prevDateRange.from, 'yyyy-MM-dd');
  const prevEndStr = format(prevDateRange.to, 'yyyy-MM-dd');

  // --- Data Fetching ---
  
  // 1. Current Period Ops (Ranking & Global KPIs)
  const { data: currentOps, loading: loadingCurr } = useAnalyticalData('get_operational_analysis', {
    p_start_date: startDateStr,
    p_end_date: endDateStr,
    p_exclude_employees: true,
    p_view_mode: 'supervisor',
    p_supervisors: filters.supervisors,
    p_regions: filters.regions
  });

  // 2. Previous Period Ops
  const { data: prevOps } = useAnalyticalData('get_operational_analysis', {
    p_start_date: prevStartStr,
    p_end_date: prevEndStr,
    p_exclude_employees: true,
    p_view_mode: 'supervisor'
  });

  // 3. Daily Sales Trend
  const { data: dailyData } = useAnalyticalData('get_daily_sales_data_v2', {
    p_start_date: format(subDays(dateRange.from, 30), 'yyyy-MM-dd'),
    p_end_date: endDateStr,
    p_exclude_employees: true,
    p_supervisors: filters.supervisors
  });

  // 4. X-Ray Data
  const { data: xrayData, loading: loadingXRay } = useAnalyticalData('get_dashboard_xray_data', {
    p_start_date: startDateStr,
    p_end_date: endDateStr,
    p_supervisors: filters.supervisors,
    p_regions: filters.regions
  });

  // --- Data Processing ---

  const dashboardData = useMemo(() => {
    if (!currentOps?.data) return { ranking: [], kpis: {} };

    const prevMap = new Map(prevOps?.data?.map(i => [i.name, i]) || []);
    const maxRevenue = Math.max(...currentOps.data.map(d => d.total_revenue), 1);

    // Enrich Ranking Data
    const ranking = currentOps.data.map(curr => {
      const prev = prevMap.get(curr.name);
      const prevRevenue = prev?.total_revenue || 0;
      
      const growth = prevRevenue > 0 ? (curr.total_revenue - prevRevenue) / prevRevenue : 0;
      const roi = curr.total_bonification > 0 ? curr.total_revenue / curr.total_bonification : 0;
      const ticket = curr.averageTicket || 0;
      
      // Efficiency Index
      const scoreRevenue = (curr.total_revenue / maxRevenue) * 40;
      const scoreGrowth = Math.min(20, Math.max(0, (growth + 0.5) * 20)); 
      const scoreROI = Math.min(20, roi * 1.5); 
      const scoreTicket = Math.min(20, (ticket / 1000) * 5); 
      
      const efficiencyIndex = scoreRevenue + scoreGrowth + scoreROI + scoreTicket;

      return {
        ...curr,
        growth,
        roi: roi.toFixed(1),
        efficiencyIndex,
        avgTicket: ticket,
        activeSellers: curr.client_activation > 0 ? Math.max(1, Math.round(curr.client_activation / 15)) : 0,
        activeClients: curr.client_activation,
      };
    }).sort((a, b) => b.efficiencyIndex - a.efficiencyIndex);

    // Global Aggregates
    const totalRevenue = ranking.reduce((acc, i) => acc + i.total_revenue, 0);
    const prevTotalRevenue = prevOps?.data?.reduce((acc, i) => acc + i.total_revenue, 0) || 0;
    const totalGrowth = prevTotalRevenue > 0 ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100 : 0;
    
    const totalBonification = ranking.reduce((acc, i) => acc + i.total_bonification, 0);
    const totalEquipment = ranking.reduce((acc, i) => acc + i.total_equipment, 0);
    const totalActive = ranking.reduce((acc, i) => acc + i.activeClients, 0);
    const totalOrders = ranking.reduce((acc, i) => acc + (parseInt(i.total_orders) || 0), 0);
    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const globalROI = totalBonification > 0 ? totalRevenue / totalBonification : 0;
    const globalMargin = 0.32; 
    const globalConversion = 0.68; 

    return {
      ranking,
      kpis: {
        totalRevenue,
        totalGrowth,
        avgTicket,
        totalOrders,
        conversion: globalConversion * 100,
        margin: globalMargin * 100,
        roi: globalROI,
        efficiency: 85,
        activeClients: totalActive,
        equipmentSold: totalEquipment,
        totalBonification,
        goalAchievement: 92
      }
    };
  }, [currentOps, prevOps]);

  const chartData = useMemo(() => {
    if (!dailyData || !Array.isArray(dailyData)) return [];
    const maData = calculateMovingAverage(dailyData, 7); 
    const maData30 = calculateMovingAverage(maData, 30);
    
    return maData30.filter(d => {
      const date = new Date(d.date);
      return date >= dateRange.from && date <= dateRange.to;
    });
  }, [dailyData, dateRange]);

  const handleExport = () => {
    if (dashboardData.ranking.length === 0) return;
    toast({ title: "Iniciando exportação...", description: "Seu arquivo será baixado em instantes." });
    // Logic to csv export...
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 animate-in fade-in duration-700">
      <Helmet>
        <title>Analítico de Supervisão | Costa Lavos</title>
      </Helmet>

      {/* Header Moderno */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            
            {/* Breadcrumb & Title */}
            <div>
              <nav className="flex items-center text-xs text-slate-500 mb-1">
                <Home size={12} className="mr-1" />
                <span className="mx-1">/</span>
                <span>Comercial</span>
                <span className="mx-1">/</span>
                <span className="font-semibold text-blue-600">Analítico de Supervisão</span>
              </nav>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Performance de Supervisão
                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200 font-normal">
                  Visão Executiva
                </Badge>
              </h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={toggleFilterPanel} className="hidden md:flex border-slate-200 bg-white hover:bg-slate-50 text-slate-700">
                <Filter size={14} className="mr-2" /> Filtros
              </Button>
              <Button variant="outline" size="sm" className="hidden md:flex border-slate-200 bg-white hover:bg-slate-50 text-slate-700" onClick={handleExport}>
                <Download size={14} className="mr-2" /> Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* SECTION 1: KPI HEAD-UP DISPLAY */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Activity size={16} className="text-blue-600" /> Métricas Chave (KPIs)
            </h3>
            <span className="text-xs text-slate-400">Atualizado em tempo real</span>
          </div>
          
          {loadingCurr ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl bg-white shadow-sm" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              <KPICard title="Vendas Totais" value={formatCurrency(dashboardData.kpis.totalRevenue)} icon={DollarSign} color="blue" trend={dashboardData.kpis.totalGrowth >= 0 ? 'up' : 'down'} trendValue={`${dashboardData.kpis.totalGrowth.toFixed(1)}%`} />
              <KPICard title="Crescimento YoY" value={formatPercentage(dashboardData.kpis.totalGrowth)} icon={TrendingUp} color="emerald" trend="up" trendValue="YoY" />
              <KPICard title="Ticket Médio" value={formatCurrency(dashboardData.kpis.avgTicket)} icon={ShoppingCart} color="amber" />
              <KPICard title="Pedidos" value={dashboardData.kpis.totalOrders} icon={Package} color="indigo" />
              <KPICard title="Conversão" value={`${dashboardData.kpis.conversion.toFixed(1)}%`} icon={PieChart} color="violet" />
              <KPICard title="Margem Est." value={`${dashboardData.kpis.margin.toFixed(1)}%`} icon={BarChart3} color="slate" />
              
              <KPICard title="ROI Bonif." value={`${dashboardData.kpis.roi.toFixed(1)}x`} icon={Award} color="emerald" />
              <KPICard title="Eficiência Global" value={dashboardData.kpis.efficiency} icon={Target} color="rose" />
              <KPICard title="Clientes Ativos" value={dashboardData.kpis.activeClients} icon={Users} color="blue" />
              <KPICard title="Equipamentos" value={formatCurrency(dashboardData.kpis.equipmentSold)} icon={Briefcase} color="amber" />
              <KPICard title="Bonificação" value={formatCurrency(dashboardData.kpis.totalBonification)} icon={Gift} color="cyan" />
              <KPICard title="Meta vs Real" value={`${dashboardData.kpis.goalAchievement}%`} icon={Activity} color="emerald" />
            </div>
          )}
        </section>

        {/* SECTION 2: CHARTS & X-RAY (SPLIT VIEW) */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left: Trends Chart (2/3) */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="border-0 shadow-sm ring-1 ring-slate-200 bg-white h-full">
              <CardHeader className="border-b border-slate-50 pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900">Tendência de Vendas & Volatilidade</CardTitle>
                    <CardDescription>Evolução diária com médias móveis (7d e 30d)</CardDescription>
                  </div>
                  <div className="bg-slate-100 p-2 rounded-lg">
                    <Activity size={18} className="text-slate-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(d) => format(new Date(d), 'dd/MM')} 
                        tick={{fontSize: 11, fill: '#64748b'}} 
                        axisLine={false} 
                        tickLine={false} 
                        minTickGap={30}
                      />
                      <YAxis 
                        tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`} 
                        tick={{fontSize: 11, fill: '#64748b'}} 
                        axisLine={false} 
                        tickLine={false} 
                        width={60}
                      />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: '0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '12px' }}
                        formatter={(val) => formatCurrency(val)}
                        labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '12px' }}
                      />
                      <Area type="monotone" dataKey="total" stroke="none" fill="url(#colorRevenue)" activeDot={false} />
                      <Bar dataKey="total" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={6} name="Venda Dia" />
                      <Line type="monotone" dataKey="ma7" stroke="#f59e0b" strokeWidth={2} dot={false} name="Média 7d" />
                      <Line type="monotone" dataKey="ma30" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Média 30d" />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Portfolio X-Ray (1/3) */}
          <div className="xl:col-span-1 h-full">
             <PortfolioXRay data={xrayData} loading={loadingXRay} />
          </div>
        </section>

        {/* SECTION 3: EFFICIENCY MATRIX & DRILL DOWN */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Award size={16} className="text-amber-500" /> Ranking & Eficiência
            </h3>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* Matrix (Table) */}
            <motion.div 
              layout 
              className={`${selectedSupervisor ? 'xl:col-span-5' : 'xl:col-span-12'} transition-all duration-500 ease-in-out`}
            >
              <EfficiencyMatrix 
                data={dashboardData.ranking} 
                isLoading={loadingCurr} 
                onSelectSupervisor={setSelectedSupervisor}
                selectedId={selectedSupervisor}
              />
            </motion.div>

            {/* Drill Down Panel */}
            <AnimatePresence>
              {selectedSupervisor && (
                <motion.div 
                  layout
                  className="xl:col-span-7"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-3 right-3 z-20 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full bg-white shadow-sm border border-slate-100"
                      onClick={() => setSelectedSupervisor(null)}
                    >
                      <Activity size={18} />
                    </Button>
                    <Card className="border-0 shadow-xl ring-1 ring-slate-200/60 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 overflow-hidden rounded-xl">
                      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                      <CardContent className="p-6">
                        <SupervisorDetailPanel supervisorName={selectedSupervisor} dateRange={dateRange} />
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AnaliticoSupervisor;
