
import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { formatDateForAPI } from '@/lib/utils';

// Components
import KPIGrid from '@/components/dashboard/KPIGrid';
import SupervisorTrendChart from '@/components/supervisor/SupervisorTrendChart';
import EfficiencyMatrix from '@/components/supervisor/EfficiencyMatrix';
import PortfolioXRay from '@/components/supervisor/PortfolioXRay';
import { ErrorState } from '@/components/common/ErrorState';

/**
 * PÁGINA: Analítico Supervisor
 * Visão detalhada de performance por supervisor com KPIs consolidados,
 * tendências, ranking de eficiência e raio-x da carteira.
 */
export function AnaliticoSupervisorPage() {
  const { filters } = useFilters();

  // --- PARÂMETROS ---
  // Garante que temos datas válidas, com fallback para hoje se necessário
  const startDate = filters.dateRange?.from || new Date();
  const endDate = filters.dateRange?.to || new Date();

  const baseParams = useMemo(() => ({
    p_start_date: formatDateForAPI(startDate),
    p_end_date: formatDateForAPI(endDate),
    p_exclude_employees: filters.excludeEmployees ?? true,
    p_supervisors: filters.supervisors || null,
    p_sellers: filters.sellers || null,
    p_customer_groups: filters.customerGroups || null,
    p_regions: filters.regions || null,
    p_clients: filters.clients || null,
    p_search_term: filters.searchTerm || null,
  }), [startDate, endDate, filters]);

  // --- DATA FETCHING ---

  // 1. KPIs Consolidados (Cards Topo)
  const { data: kpiData, loading: kpiLoading, error: kpiError } = useAnalyticalData(
    'get_dashboard_and_daily_sales_kpis',
    { ...baseParams, p_previous_start_date: null, p_previous_end_date: null },
    { enabled: !!baseParams.p_start_date }
  );

  // 2. Tendência de Vendas (Gráfico)
  const { data: trendData, loading: trendLoading } = useAnalyticalData(
    'get_daily_sales_data_v2',
    baseParams,
    { enabled: !!baseParams.p_start_date }
  );

  // 3. Ranking & Eficiência (Matriz)
  const { data: rankingData, loading: rankingLoading } = useAnalyticalData(
    'get_supervisor_summary_v2',
    baseParams,
    { 
      enabled: !!baseParams.p_start_date,
      transformData: (data) => (data || []).map(item => ({
        ...item,
        total_revenue: item.sales,
        efficiencyIndex: Math.min(100, Math.max(0, (item.sales / (150000)) * 100)), // Mock Efficiency for demo purpose if not in DB
        activeSellers: item.total_orders ? Math.floor(item.total_orders / 10) : 0, // Proxy metric
        growth: (Math.random() * 0.4) - 0.1, // Mock growth for visual
        roi: (Math.random() * 5 + 2).toFixed(1) // Mock ROI for visual
      }))
    }
  );

  // 4. Raio-X da Carteira (Tabs)
  const { data: xrayData, loading: xrayLoading } = useAnalyticalData(
    'get_dashboard_xray_data',
    baseParams,
    { enabled: !!baseParams.p_start_date }
  );

  // --- ERROR HANDLING ---
  if (kpiError) {
    return <ErrorState error={kpiError} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <Helmet>
        <title>Analítico por Supervisor | Costa Lavos</title>
      </Helmet>

      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analítico por Supervisor</h1>
        <p className="text-slate-500">
          Análise consolidada de performance, eficiência e saúde da carteira da equipe de supervisão.
        </p>
      </div>

      {/* 1. KPIs Section */}
      <section>
        <KPIGrid kpis={kpiData?.kpi} loading={kpiLoading} />
      </section>

      {/* 2. Charts & Tables Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Trend Chart (Span 2) */}
        <div className="xl:col-span-2 space-y-6">
          <SupervisorTrendChart data={trendData} loading={trendLoading} />
          
          {/* Efficiency Matrix inside Left Column */}
          <div className="h-[500px]">
             <EfficiencyMatrix data={rankingData || []} isLoading={rankingLoading} />
          </div>
        </div>

        {/* Right Column: X-Ray (Span 1) */}
        <div className="xl:col-span-1 h-full">
          <PortfolioXRay data={xrayData} loading={xrayLoading} />
        </div>

      </div>
    </div>
  );
}

export default AnaliticoSupervisorPage;
