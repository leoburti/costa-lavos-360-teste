import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useFilters } from '@/contexts/FilterContext'; // Import Context
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  Users, 
  ShoppingCart, 
  CreditCard, 
  Gift, 
  Truck, 
  Calendar, 
  TrendingUp, 
  RefreshCw,
  Download,
  Maximize2
} from 'lucide-react';
import SalesChart from '@/components/SalesChart';
import PerformanceRanking from '@/components/dashboard/PerformanceRanking';
import DashboardLoading from '@/components/DashboardLoading';
import MetricCard from '@/components/MetricCard';
import { formatCurrency } from '@/lib/utils';
import { startOfMonth, format, endOfMonth } from 'date-fns';

const DashboardComercial = () => {
  const { filters } = useFilters(); // Use global filters
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Correct date access and formatting from context
  const dateRange = filters.dateRange || { from: startOfMonth(new Date()), to: endOfMonth(new Date()) };
  const startDateStr = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const endDateStr = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : format(endOfMonth(new Date()), 'yyyy-MM-dd');

  // Debug Logs
  useEffect(() => {
    console.log('[DashboardComercial] Filters:', filters);
    console.log('[DashboardComercial] Dates:', { startDateStr, endDateStr });
  }, [filters, startDateStr, endDateStr]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Previous period for trend calculation (Month over Month relative to selected range)
      const start = new Date(startDateStr);
      const end = new Date(endDateStr);
      const duration = end - start;
      
      const prevEnd = new Date(start.getTime() - 24 * 60 * 60 * 1000); // Day before start
      const prevStart = new Date(prevEnd.getTime() - duration);
      
      const prevStartStr = format(prevStart, 'yyyy-MM-dd');
      const prevEndStr = format(prevEnd, 'yyyy-MM-dd');

      const { data: result, error } = await supabase.rpc('get_dashboard_and_daily_sales_kpis', {
        p_start_date: startDateStr,
        p_end_date: endDateStr,
        p_previous_start_date: prevStartStr,
        p_previous_end_date: prevEndStr,
        p_exclude_employees: filters.excludeEmployees ?? true,
        p_supervisors: filters.supervisors || null,
        p_sellers: filters.sellers || null,
        p_customer_groups: filters.customerGroups || null,
        p_regions: filters.regions || null,
        p_clients: filters.clients ? filters.clients.map(c => c.value) : null,
        p_search_term: filters.searchTerm || null,
        p_show_defined_groups_only: false
      });

      if (error) throw error;

      if (result) {
        setData(result);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Dashboard Error:", err);
    } finally {
      setLoading(false);
    }
  }, [startDateStr, endDateStr, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading && !data) {
    return <DashboardLoading loading={true} />;
  }

  const kpis = data?.kpi || {};
  const rankings = data?.rankings || {};
  const dailySales = data?.dailySales || [];

  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-500 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Visão Geral</h1>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground text-sm">
              Acompanhamento de indicadores comerciais e performance.
            </p>
            {lastUpdated && (
              <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
                Atualizado às {format(lastUpdated, 'HH:mm:ss')}
              </span>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="bg-white shadow-sm">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Atualizando...' : 'Atualizar Dados'}
        </Button>
      </div>

      {/* KPI Grid - 2 Rows of 4 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Row 1 */}
        <MetricCard
          title="Receita Líquida"
          value={formatCurrency(kpis.netSales)}
          icon={DollarSign}
          subtitle="Nenhum dado no período."
        />
        <MetricCard
          title="Clientes Ativos"
          value={kpis.activeClients}
          icon={Users}
          subtitle="Compraram no período"
        />
        <MetricCard
          title="Vendas Realizadas"
          value={kpis.salesCount}
          icon={ShoppingCart}
          subtitle="Pedidos faturados"
        />
        <MetricCard
          title="Ticket Médio"
          value={formatCurrency(kpis.averageTicket)}
          icon={CreditCard}
          subtitle="Nenhum dado no período."
        />

        {/* Row 2 */}
        <MetricCard
          title="Bonificação Total"
          value={formatCurrency(kpis.totalBonification)}
          icon={Gift}
          subtitle="Investimento em bonificação"
        />
        <MetricCard
          title="Equipamentos Entregues"
          value={formatCurrency(kpis.totalEquipment)}
          icon={Truck}
          subtitle="Valor em comodato"
        />
        <MetricCard
          title="Receita Mês Atual (MTD)"
          value={formatCurrency(kpis.totalRevenueMonthToDate)}
          icon={Calendar}
          subtitle="Nenhum dado no período."
        />
        <MetricCard
          title="Receita Projetada"
          value={formatCurrency(kpis.projectedRevenue)}
          icon={TrendingUp}
          subtitle="Estimativa fechamento mês"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-1">
        
        {/* Sales Chart */}
        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold text-slate-800">Vendas Diárias</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <SalesChart 
              data={dailySales} 
              height={380}
              title=""
              series={[
                { key: 'total', name: 'Receita', color: '#10b981' }, // Green
                { key: 'bonification', name: 'Bonificação', color: '#8b5cf6' }, // Purple
                { key: 'equipment', name: 'Equipamentos', color: '#3b82f6' } // Blue
              ]}
            />
            <div className="flex justify-center mt-4 gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#10b981]"></span>
                <span className="text-slate-600 font-medium">Receita</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#8b5cf6]"></span>
                <span className="text-slate-600 font-medium">Bonificação</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#3b82f6]"></span>
                <span className="text-slate-600 font-medium">Equipamentos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Ranking Table */}
        <PerformanceRanking rankings={rankings} totalRevenue={kpis.netSales} />
        
      </div>
    </div>
  );
};

export default DashboardComercial;