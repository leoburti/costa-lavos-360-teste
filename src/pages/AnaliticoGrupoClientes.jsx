
import React, { useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import ChartCard from '@/components/ChartCard';
import AIInsight from '@/components/AIInsight';
import CustomerGroupDrilldownExplorer from '@/components/CustomerGroupDrilldownExplorer';
import TreeMapChart from '@/components/TreeMapChart';
import { useFilters } from '@/contexts/FilterContext';
import { useAIInsight } from '@/hooks/useAIInsight';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { Loader2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isValid } from 'date-fns';

const AnaliticoGrupoClientes = () => {
  const { filters } = useFilters();

  // Safe date extraction
  const dateRange = useMemo(() => {
      const now = new Date();
      const from = filters.dateRange?.from && isValid(new Date(filters.dateRange.from)) ? new Date(filters.dateRange.from) : startOfMonth(now);
      const to = filters.dateRange?.to && isValid(new Date(filters.dateRange.to)) ? new Date(filters.dateRange.to) : endOfMonth(now);
      return { from, to };
  }, [filters.dateRange]);

  const startDateStr = format(dateRange.from, 'yyyy-MM-dd');
  const endDateStr = format(dateRange.to, 'yyyy-MM-dd');

  const params = useMemo(() => ({
    p_start_date: startDateStr,
    p_end_date: endDateStr,
    p_exclude_employees: filters.excludeEmployees ?? true,
    p_supervisors: filters.supervisors === 'all' ? null : filters.supervisors,
    p_sellers: filters.sellers === 'all' ? null : filters.sellers,
    p_customer_groups: filters.customerGroups === 'all' ? null : filters.customerGroups,
    p_regions: filters.regions === 'all' ? null : filters.regions,
    p_clients: Array.isArray(filters.clients) ? filters.clients.map(c => c.value) : null,
    p_search_term: filters.searchTerm || null,
    p_analysis_mode: 'customerGroup',
    p_show_defined_groups_only: true,
  }), [filters, startDateStr, endDateStr]);

  // Memoize options to ensure referential stability
  const options = useMemo(() => ({ 
    enabled: !!startDateStr && !!endDateStr, 
    defaultValue: [] 
  }), [startDateStr, endDateStr]);

  const { data: treemapData, loading: loadingTreemap, refetch } = useAnalyticalData(
    'get_treemap_data', 
    params, 
    options
  );

  const { insight, loading: loadingAI, generateInsights } = useAIInsight('customer_group_analysis', treemapData);

  return (
    <>
      <Helmet>
        <title>Analítico Grupos de Clientes - Costa Lavos</title>
      </Helmet>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tighter">Analítico por Grupos de Clientes</h1>
          <p className="text-muted-foreground mt-1">Explore as vendas navegando através dos grupos de clientes, clientes, pedidos e produtos.</p>
        </div>
        
        <AIInsight insight={insight} loading={loadingAI} onRegenerate={generateInsights} />

        <div className="grid grid-cols-1 gap-8">
           <ChartCard title="Distribuição de Vendas por Grupo de Cliente" height={400}>
            {loadingTreemap ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <TreeMapChart data={treemapData || []} />
            )}
          </ChartCard>

          <ChartCard title="Explorador de Vendas por Grupo de Cliente" childClassName="p-0">
            <CustomerGroupDrilldownExplorer key={JSON.stringify(params)} />
          </ChartCard>
        </div>
      </div>
    </>
  );
};

export default AnaliticoGrupoClientes;
