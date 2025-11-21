
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2, DollarSign, Users, Package, TrendingUp, CalendarDays, Factory, Award, ShoppingCart } from 'lucide-react';
import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import MetricCard from '@/components/MetricCard';
import ChartCard from '@/components/ChartCard';
import RankingTable from '@/components/RankingTable';
import { format as fnsFormat, parseISO, isValid } from 'date-fns';

const formatCurrency = (value) => {
  if (value === undefined || value === null) return 'R$ 0,00';
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const Dashboard = () => {
  const { filters, loading: filtersLoading } = useFilters();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const { toast } = useToast();

  const fetchData = useCallback(async (currentFilters) => {
    if (!currentFilters.startDate || !currentFilters.endDate) {
      return;
    }

    setLoading(true);
    
    const rpcParams = {
      p_start_date: currentFilters.startDate,
      p_end_date: currentFilters.endDate,
      p_previous_start_date: currentFilters.previousStartDate,
      p_previous_end_date: currentFilters.previousEndDate,
      p_exclude_employees: currentFilters.excludeEmployees,
      p_supervisors: currentFilters.supervisors,
      p_sellers: currentFilters.sellers,
      p_customer_groups: currentFilters.customerGroups,
      p_regions: currentFilters.regions,
      p_clients: currentFilters.clients,
      p_search_term: currentFilters.searchTerm,
      p_show_defined_groups_only: currentFilters.showDefinedGroupsOnly || false,
    };

    try {
      const { data, error } = await supabase.rpc('get_dashboard_and_daily_sales_kpis', rpcParams);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao buscar dados do dashboard',
          description: error.message,
        });
        setDashboardData(null);
      } else {
        setDashboardData(data);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro inesperado',
        description: `Não foi possível carregar os dados: ${error.message}`,
      });
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const stableFilters = useMemo(() => filters, [
      filters.startDate,
      filters.endDate,
      filters.previousStartDate,
      filters.previousEndDate,
      filters.excludeEmployees,
      filters.supervisors,
      filters.sellers,
      filters.customerGroups,
      filters.regions,
      filters.clients,
      filters.searchTerm,
      filters.showDefinedGroupsOnly
  ]);

  useEffect(() => {
    if (!filtersLoading) {
      fetchData(stableFilters);
    }
  }, [stableFilters, filtersLoading, fetchData]);

  const chartData = useMemo(() => {
    if (!dashboardData?.dailySales) return [];
    return (dashboardData.dailySales).map(day => ({
      date: fnsFormat(parseISO(day.date), 'dd/MM'),
      Receita: day.total,
      Bonificação: day.bonification,
      Equipamentos: day.equipment,
    }));
  }, [dashboardData?.dailySales]);
  
  const transformSalesData = useCallback((data) => {
    return (data || []).map(item => ({
      name: item.name,
      value: item.total_revenue,
      quantity: item.total_quantity,
      trend: item.trend
    }));
  }, []);
  
  const rankingData = useMemo(() => {
    if (!dashboardData?.rankings) {
      return {
        salesBySupervisor: [], salesBySeller: [], salesByProduct: [],
        salesByCustomerGroup: [], salesByClient: [], regionalSales: []
      };
    }
    const { rankings } = dashboardData;
    return {
        salesBySupervisor: transformSalesData(rankings.salesBySupervisor),
        salesBySeller: transformSalesData(rankings.salesBySeller),
        salesByProduct: transformSalesData(rankings.salesByProduct),
        salesByCustomerGroup: transformSalesData(rankings.salesByCustomerGroup),
        salesByClient: transformSalesData(rankings.salesByClient),
        regionalSales: transformSalesData(rankings.regionalSales),
    };
  }, [dashboardData, transformSalesData]);
  
  if (loading || filtersLoading) {
    return (
      <div className="flex items-center justify-center h-full pt-16">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const { kpi } = dashboardData || {};
  const { netSales = 0, totalBonification = 0, totalEquipment = 0, activeClients = 0, salesCount = 0, averageTicket = 0, projectedRevenue = 0, lastSaleDate, totalRevenueMonthToDate = 0, totalRevenueYearToDate = 0 } = kpi || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Receita Líquida" value={formatCurrency(netSales)} icon={DollarSign} />
          <MetricCard title="Clientes Ativos" value={String(activeClients)} icon={Users} />
          <MetricCard title="Vendas Realizadas" value={String(salesCount)} icon={ShoppingCart} />
          <MetricCard title="Ticket Médio" value={formatCurrency(averageTicket)} icon={Award} />
          <MetricCard title="Bonificação Total" value={formatCurrency(totalBonification)} icon={Package} />
          <MetricCard title="Equipamentos Entregues" value={formatCurrency(totalEquipment)} icon={Factory} /> {/* Changed title here */}
          <MetricCard title="Receita Mês Atual (MTD)" value={formatCurrency(totalRevenueMonthToDate)} icon={CalendarDays} />
          <MetricCard title="Receita Projetada" value={formatCurrency(projectedRevenue)} icon={TrendingUp} />
        </div>

        <ChartCard title="Vendas Diárias">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
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
                <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => formatCurrency(value)} />
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

        <RankingTable data={rankingData} />
    </motion.div>
  );
};

export default Dashboard;
