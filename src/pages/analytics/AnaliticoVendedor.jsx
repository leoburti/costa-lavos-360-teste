
import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { formatDateForAPI } from '@/lib/utils';

// Components
import KPIGrid from '@/components/dashboard/KPIGrid';
import SalesTrendChart from '@/components/charts/SalesTrendChart';
import PerformanceMatrix from '@/components/performance/PerformanceMatrix';
import PortfolioXRay from '@/components/supervisor/PortfolioXRay';
import { ErrorState } from '@/components/common/ErrorState';

/**
 * PÁGINA: Analítico Vendedor
 * Visão detalhada de performance por vendedor com KPIs consolidados,
 * tendências, ranking e raio-x da carteira.
 */
export default function AnaliticoVendedor() {
  const { filters } = useFilters();

  // --- PARÂMETROS ---
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

  // 1. KPIs Consolidados
  const { data: kpiData, loading: kpiLoading, error: kpiError } = useAnalyticalData(
    'get_dashboard_and_daily_sales_kpis',
    { ...baseParams, p_previous_start_date: null, p_previous_end_date: null },
    { enabled: !!baseParams.p_start_date }
  );

  // 2. Tendência de Vendas (Gráfico 7d)
  const { data: trendData, loading: trendLoading } = useAnalyticalData(
    'get_daily_sales_data_v2',
    baseParams,
    { enabled: !!baseParams.p_start_date }
  );

  // 3. Ranking de Vendedores
  const { data: rankingData, loading: rankingLoading } = useAnalyticalData(
    'get_seller_summary_v2',
    baseParams,
    { 
      enabled: !!baseParams.p_start_date,
      transformData: (data) => (data || []).map(item => ({
        ...item,
        total_revenue: item.sales,
        // Mock efficiency & growth if not in DB view yet
        efficiencyIndex: Math.min(100, Math.max(0, (item.sales / (50000)) * 100)), 
        growth: (Math.random() * 0.4) - 0.1,
        subLabel: `${item.total_orders || 0} pedidos`
      }))
    }
  );

  // 4. Raio-X da Carteira
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
        <title>Analítico Vendedor | Costa Lavos</title>
      </Helmet>

      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analítico de Vendedores</h1>
        <p className="text-slate-500">
          Acompanhamento detalhado da força de vendas, metas e eficiência comercial.
        </p>
      </div>

      {/* 1. KPIs Section */}
      <section>
        <KPIGrid kpis={kpiData?.kpi} loading={kpiLoading} />
      </section>

      {/* 2. Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Trend Chart & Ranking */}
        <div className="xl:col-span-2 space-y-6">
          <SalesTrendChart data={trendData} loading={trendLoading} title="Tendência de Vendas (Diária)" />
          
          {/* Ranking Matrix */}
          <div className="h-[500px]">
             <PerformanceMatrix 
                data={rankingData || []} 
                isLoading={rankingLoading} 
                title="Ranking de Vendedores"
                entityLabel="Vendedores"
             />
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
