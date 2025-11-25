
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2, DollarSign, Users, Package, TrendingUp, CalendarDays, Factory, Award, ShoppingCart, Database, WifiOff, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { useFilters } from '@/contexts/FilterContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import MetricCard from '@/components/MetricCard';
import ChartCard from '@/components/ChartCard';
import RankingTable from '@/components/RankingTable';
import DashboardHeader from '@/components/DashboardHeader';
import { format as fnsFormat, parseISO } from 'date-fns';
import { supabase } from '@/lib/customSupabaseClient';

const formatCurrency = (value) => {
  if (value === undefined || value === null) return 'R$ 0,00';
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatLargeNumber = (num) => {
  if (num >= 1000000) {
    return `R$ ${(num / 1000000).toFixed(0)}M`;
  }
  if (num >= 1000) {
    return `R$ ${(num / 1000).toFixed(0)}k`;
  }
  return `R$ ${num.toFixed(0)}`;
};

// NUCLEAR FALLBACK DATA - Hardcoded to guarantee render even if API fails
const NUCLEAR_FALLBACK = {
    kpi: {
        netSales: 0,
        totalBonification: 0,
        totalEquipment: 0,
        activeClients: 0,
        salesCount: 0,
        averageTicket: 0,
        projectedRevenue: 0,
        totalRevenueMonthToDate: 0
    },
    dailySales: [],
    rankings: {
        salesBySupervisor: [], salesBySeller: [], salesByProduct: [],
        salesByCustomerGroup: [], salesByClient: [], regionalSales: []
    }
};

const Dashboard = () => {
  const { filters, loading: filtersLoading } = useFilters();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(NUCLEAR_FALLBACK);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [useRealData, setUseRealData] = useState(false);

  // Nuclear Fetch Implementation: Simple fetch with timeout
  const fetchDashboardData = async () => {
    setLoading(true);
    setIsOfflineMode(false);

    // Create a timeout promise - aggressive 5s timeout
    const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout de 5s excedido')), 5000)
    );

    try {
        // Race between the fetch and the timeout
        const response = await Promise.race([
            supabase.functions.invoke('get-nuclear-dashboard'),
            timeout
        ]);

        if (response.error) throw new Error(response.error.message);
        
        const result = response.data;
        if (!result || !result.data) throw new Error('Dados inválidos recebidos');

        setData(result.data);
        setLastUpdated(result.meta?.updated_at);
        
        // Verify if we truly have real data (sales > 0)
        if (result.data.kpi?.netSales > 0) {
            setUseRealData(true);
        } else {
            setUseRealData(false); // Cache exists but might be empty/zeroed
        }

    } catch (err) {
        console.error("Nuclear Solution Fallback triggered:", err);
        setIsOfflineMode(true);
        // Keep using existing data or fallback
        if (Object.keys(data.kpi).length === 0) {
             setData(NUCLEAR_FALLBACK);
        }
        toast({
            variant: "destructive",
            title: "Modo Fallback Ativado",
            description: "Usando dados locais de segurança. Tente atualizar novamente.",
        });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []); // Run once on mount

  const handleRefresh = async () => {
      setLoading(true);
      // Optionally trigger a recalculation if user presses refresh
      try {
          await supabase.functions.invoke('trigger-dashboard-refresh');
          // Wait 2s then fetch
          setTimeout(fetchDashboardData, 2000);
      } catch (e) {
          fetchDashboardData();
      }
  };

  // Transform Data for Charts
  const chartData = useMemo(() => {
    if (!data?.dailySales) return [];
    return (data.dailySales).map(day => ({
      date: fnsFormat(parseISO(day.date), 'dd/MM'),
      Receita: day.total,
      Bonificação: day.bonification,
      Equipamentos: day.equipment,
    }));
  }, [data?.dailySales]);
  
  const transformSalesData = (list) => {
    return (list || []).map(item => ({
      name: item.name,
      value: item.total_revenue,
      quantity: item.total_quantity,
      trend: item.trend
    }));
  };
  
  const rankingData = useMemo(() => {
    const rankings = data?.rankings || NUCLEAR_FALLBACK.rankings;
    return {
        salesBySupervisor: transformSalesData(rankings.salesBySupervisor),
        salesBySeller: transformSalesData(rankings.salesBySeller),
        salesByProduct: transformSalesData(rankings.salesByProduct),
        salesByCustomerGroup: transformSalesData(rankings.salesByCustomerGroup),
        salesByClient: transformSalesData(rankings.salesByClient),
        regionalSales: transformSalesData(rankings.regionalSales),
    };
  }, [data]);

  if (loading && !data.kpi.netSales && !isOfflineMode) {
    return (
      <div className="flex items-center justify-center h-full pt-16">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Carregando dados acelerados...</p>
        </div>
      </div>
    );
  }

  const { kpi } = data || NUCLEAR_FALLBACK;
  const { netSales = 0, totalBonification = 0, totalEquipment = 0, activeClients = 0, salesCount = 0, averageTicket = 0, projectedRevenue = 0, totalRevenueMonthToDate = 0 } = kpi || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
        {/* Header with Offline Indicator */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    Visão Geral Comercial
                    {isOfflineMode && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full flex items-center gap-1"><WifiOff size={12}/> Offline</span>}
                    {useRealData && !isOfflineMode && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle2 size={12}/> Dados Reais</span>}
                </h1>
                <p className="text-sm text-slate-500 flex items-center gap-2">
                    {isOfflineMode 
                        ? "Exibindo dados estáticos de segurança." 
                        : <>Fonte: Tabela Cache Otimizada • Atualizado: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '...'}</>
                    }
                </p>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm" className="gap-2">
                <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
                {loading ? "Atualizando..." : "Recarregar"}
            </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Receita Líquida" value={formatCurrency(netSales)} icon={DollarSign} />
          <MetricCard title="Clientes Ativos" value={String(activeClients)} icon={Users} />
          <MetricCard title="Vendas Realizadas" value={String(salesCount)} icon={ShoppingCart} />
          <MetricCard title="Ticket Médio" value={formatCurrency(averageTicket)} icon={Award} />
          <MetricCard title="Bonificação Total" value={formatCurrency(totalBonification)} icon={Package} />
          <MetricCard title="Equipamentos Entregues" value={formatCurrency(totalEquipment)} icon={Factory} />
          <MetricCard title="Receita Mês Atual (MTD)" value={formatCurrency(totalRevenueMonthToDate)} icon={CalendarDays} />
          <MetricCard title="Receita Projetada" value={formatCurrency(projectedRevenue)} icon={TrendingUp} />
        </div>

        {/* Charts Area */}
        {chartData.length > 0 ? (
            <ChartCard title="Vendas Diárias">
                <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                >
                    <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorBonification" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEquipamentos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        tickFormatter={formatLargeNumber}
                        width={80}
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                    formatter={(value, name) => [formatCurrency(value), name]}
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                        fontSize: '0.875rem',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="Receita" stroke="hsl(var(--primary))" fill="url(#colorRevenue)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Bonificação" stroke="hsl(var(--secondary))" fill="url(#colorBonification)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Equipamentos" stroke="#3b82f6" fill="url(#colorEquipamentos)" strokeWidth={2} />
                </AreaChart>
                </ResponsiveContainer>
            </ChartCard>
        ) : (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
                <Database className="mx-auto h-10 w-10 mb-2 opacity-50" />
                <p>Sem dados de vendas diárias para exibir no momento.</p>
            </div>
        )}

        <RankingTable data={rankingData} />
    </motion.div>
  );
};

export default Dashboard;
