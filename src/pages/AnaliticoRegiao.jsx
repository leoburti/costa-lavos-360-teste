import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Loader2 } from 'lucide-react';
import ChartCard from '@/components/ChartCard';
import AIInsight from '@/components/AIInsight';
import TreeMapChart from '@/components/TreeMapChart';
import DrilldownExplorer from '@/components/DrilldownExplorer';
import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAIInsight } from '@/hooks/useAIInsight';
import { useDebounce } from '@/hooks/useDebounce';

const MemoizedDrilldownExplorer = React.memo(DrilldownExplorer);

const AnaliticoRegiao = () => {
  const { filters } = useFilters();
  const debouncedFilters = useDebounce(filters, 500);
  const [loading, setLoading] = useState(true);
  const [treemapData, setTreemapData] = useState([]);
  const { toast } = useToast();

  const kpiDataForAI = useMemo(() => ({
    regionalSales: treemapData.map(d => ({ region: d.name, sales: d.size })).slice(0, 10)
  }), [treemapData]);

  const { insight, loading: loadingAI, retry: retryAI } = useAIInsight('regional_analysis', kpiDataForAI, filters);

  const fetchChartData = useCallback(async () => {
    setLoading(true);
    const selectedClients = debouncedFilters.clients ? debouncedFilters.clients.map(c => c.value || c.name) : null;
    const { data, error } = await supabase.rpc('get_treemap_data', {
      p_start_date: debouncedFilters.startDate,
      p_end_date: debouncedFilters.endDate,
      p_exclude_employees: debouncedFilters.excludeEmployees,
      p_supervisors: debouncedFilters.supervisors,
      p_sellers: debouncedFilters.sellers,
      p_customer_groups: debouncedFilters.customerGroups,
      p_regions: debouncedFilters.regions,
      p_clients: selectedClients,
      p_search_term: debouncedFilters.searchTerm,
      p_analysis_mode: 'region',
      p_show_defined_groups_only: false,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar dados para o Treemap",
        description: error.message,
      });
      setTreemapData([]);
    } else {
      setTreemapData(data || []);
    }
    setLoading(false);
  }, [debouncedFilters, toast]);

  useEffect(() => {
    if (debouncedFilters.startDate && debouncedFilters.endDate) {
      fetchChartData();
    }
  }, [fetchChartData, debouncedFilters.startDate, debouncedFilters.endDate]);
  
  const drilldownInitialFilters = useMemo(() => ({
    startDate: debouncedFilters.startDate,
    endDate: debouncedFilters.endDate,
    excludeEmployees: debouncedFilters.excludeEmployees,
    supervisors: debouncedFilters.supervisors,
    sellers: debouncedFilters.sellers,
    customerGroups: debouncedFilters.customerGroups,
    regions: debouncedFilters.regions,
    clients: debouncedFilters.clients ? debouncedFilters.clients.map(c => c.value || c.name) : null,
    searchTerm: debouncedFilters.searchTerm,
  }), [debouncedFilters]);

  return (
    <>
      <Helmet>
        <title>Analítico por Região - Costa Lavos</title>
        <meta name="description" content="Análise detalhada da performance de vendas por região." />
      </Helmet>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tighter">Analítico por Região</h1>
          <p className="text-muted-foreground mt-1">Explore a performance de vendas em diferentes regiões.</p>
        </div>
        
        <AIInsight insight={insight} loading={loadingAI} onRegenerate={retryAI} />

        <div className="flex flex-col gap-8">
          <ChartCard 
            title="Participação nas Vendas"
          >
            {loading ? (
               <div className="flex items-center justify-center h-[400px]">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
               </div>
            ) : treemapData && treemapData.length > 0 ? (
              <TreeMapChart data={treemapData} />
            ) : (
              <div className="flex items-center justify-center h-[400px]">
                  <p className="text-muted-foreground">Nenhum dado para exibir.</p>
              </div>
            )}
          </ChartCard>
          
          <ChartCard title="Explorador de Vendas por Região">
             <MemoizedDrilldownExplorer 
                analysisMode="region" 
                key={JSON.stringify(drilldownInitialFilters)}
                initialFilters={drilldownInitialFilters}
             />
          </ChartCard>
        </div>
      </div>
    </>
  );
};

export default AnaliticoRegiao;