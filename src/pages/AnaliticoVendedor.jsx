
import React, { useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Users, TrendingUp, Target, Loader2 } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import ChartCard from '@/components/ChartCard';
import AIInsight from '@/components/AIInsight';
import SellerRankingList from '@/components/SellerRankingList';
import { useFilters } from '@/contexts/FilterContext';
import { useAIInsight } from '@/hooks/useAIInsight';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { format, startOfMonth, endOfMonth, isValid } from 'date-fns';

const AnaliticoVendedor = () => {
  const { filters } = useFilters();

  const dateRange = useMemo(() => {
      const now = new Date();
      const from = filters.dateRange?.from && isValid(new Date(filters.dateRange.from)) ? new Date(filters.dateRange.from) : startOfMonth(now);
      const to = filters.dateRange?.to && isValid(new Date(filters.dateRange.to)) ? new Date(filters.dateRange.to) : endOfMonth(now);
      return { from, to };
  }, [filters.dateRange]);

  const startDateStr = format(dateRange.from, 'yyyy-MM-dd');
  const endDateStr = format(dateRange.to, 'yyyy-MM-dd');

  const params = useMemo(() => {
    return {
      p_start_date: startDateStr,
      p_end_date: endDateStr,
      p_exclude_employees: filters.excludeEmployees ?? true,
      p_supervisors: filters.supervisors === 'all' ? null : filters.supervisors,
      p_sellers: filters.sellers === 'all' ? null : filters.sellers,
      p_customer_groups: filters.customerGroups === 'all' ? null : filters.customerGroups,
      p_regions: filters.regions === 'all' ? null : filters.regions,
      p_clients: Array.isArray(filters.clients) ? filters.clients.map(c => c.value) : null,
      p_search_term: filters.searchTerm || null,
      p_view_mode: 'seller',
      p_show_defined_groups_only: false,
    };
  }, [filters, startDateStr, endDateStr]);

  // Memoize options to ensure referential stability
  const options = useMemo(() => ({ 
    enabled: !!startDateStr && !!endDateStr, 
    defaultValue: { kpis: {}, data: [] } 
  }), [startDateStr, endDateStr]);

  const { data: operationalData, loading, refetch } = useAnalyticalData(
    'get_operational_analysis',
    params,
    options
  );

  const { insight, loading: loadingAI, generateInsights } = useAIInsight('seller_analysis', operationalData);
  
  const kpis = operationalData?.kpis || {};
  const sellerData = Array.isArray(operationalData?.data) ? operationalData.data : [];
  const totalRevenue = sellerData.reduce((acc, seller) => acc + (seller.total_revenue || 0), 0);
  
  const formatCurrency = (value) => value ? `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}` : 'R$ 0';

  return (
    <>
      <Helmet>
        <title>Analítico Vendedor - Costa Lavos</title>
      </Helmet>

      <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Analítico por Vendedor</h1>
            <p className="text-muted-foreground mt-1">Performance individual e análise detalhada dos vendedores.</p>
        </div>

        <AIInsight insight={insight} loading={loadingAI} onRegenerate={generateInsights} />

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricCard title="Ticket Médio Global" value={formatCurrency(kpis.averageTicketGlobal)} icon={Target} />
                <MetricCard title="Positivação Global" value={`${(kpis.positivationRateGlobal || 0).toFixed(2)}%`} icon={TrendingUp} />
                <MetricCard title="Itens por Venda (Média)" value={(kpis.averageItemsPerSaleGlobal || 0).toFixed(2)} icon={Users} />
            </div>

            <ChartCard title="Ranking de Vendas por Vendedor" height={600} childClassName="p-4">
              <SellerRankingList data={sellerData} totalRevenue={totalRevenue} />
            </ChartCard>
          </>
        )}
      </div>
    </>
  );
};

export default AnaliticoVendedor;
