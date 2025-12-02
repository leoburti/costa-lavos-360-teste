import React from 'react';
import AnalyticsTemplate from '@/components/analytics/AnalyticsTemplate';
import KPIGrid from '@/components/analytics/KPIGrid';
import ChartContainer from '@/components/analytics/ChartContainer';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { useFilters } from '@/contexts/FilterContext';
import { formatDateForAPI } from '@/lib/utils';
import { DollarSign, ShoppingCart, Users, Percent } from 'lucide-react';
import SalesChart from '@/components/SalesChart';
import PerformanceRanking from '@/components/dashboard/PerformanceRanking';

export default function Dashboard() {
  const { filters } = useFilters();
  
  const params = {
    p_start_date: formatDateForAPI(filters.dateRange?.from || new Date()),
    p_end_date: formatDateForAPI(filters.dateRange?.to || new Date()),
    p_exclude_employees: filters.excludeEmployees,
    p_supervisors: filters.supervisors,
  };

  const mockKPIs = {
    kpi: { totalRevenue: 0, salesCount: 0, activeClients: 0, efficiencyGlobal: 0 },
    dailySales: [],
    rankings: { salesBySeller: [] }
  };

  const { data, isLoading, refetch } = useAnalyticsData(
    'get_dashboard_and_daily_sales_kpis',
    mockKPIs, 
    { 
      ...params,
      fallbackOnError: true, 
      fallbackOnEmpty: true
    }
  );

  const safeData = data || mockKPIs;

  const kpis = [
    { title: 'Vendas Totais', value: safeData.kpi?.totalRevenue || 0, format: 'currency', icon: DollarSign, trend: 'up', trendValue: '12%' },
    { title: 'Pedidos', value: safeData.kpi?.salesCount || 0, format: 'number', icon: ShoppingCart, trend: 'up', trendValue: '5%' },
    { title: 'Clientes Ativos', value: safeData.kpi?.activeClients || 0, format: 'number', icon: Users, trend: 'neutral', trendValue: '0%' },
    { title: 'Eficiência', value: safeData.kpi?.efficiencyGlobal || 0, format: 'percentage', icon: Percent, trend: 'down', trendValue: '2%' },
  ];

  return (
    <AnalyticsTemplate 
      title="Dashboard Principal" 
      description="Visão geral da performance comercial."
      onRefresh={refetch}
      loading={isLoading}
    >
      <KPIGrid kpis={kpis} loading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 h-[400px]">
          <ChartContainer title="Evolução de Vendas" loading={isLoading} height={350}>
             <SalesChart data={safeData.dailySales} />
          </ChartContainer>
        </div>
        <div className="lg:col-span-1 h-[400px]">
          <ChartContainer title="Ranking Vendedores" loading={isLoading} height={350}>
             <PerformanceRanking data={safeData.rankings?.salesBySeller} />
          </ChartContainer>
        </div>
      </div>
    </AnalyticsTemplate>
  );
}