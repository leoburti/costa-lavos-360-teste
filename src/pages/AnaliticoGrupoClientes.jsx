import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import ChartCard from '@/components/ChartCard';
import AIInsight from '@/components/AIInsight';
import CustomerGroupDrilldownExplorer from '@/components/CustomerGroupDrilldownExplorer';
import TreeMapChart from '@/components/TreeMapChart';
import { useFilters } from '@/contexts/FilterContext';
import { useAIInsight } from '@/hooks/useAIInsight';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const AnaliticoGrupoClientes = () => {
  const { filters } = useFilters();
  const { toast } = useToast();
  const [treemapData, setTreemapData] = useState([]);
  const [loadingTreemap, setLoadingTreemap] = useState(true);

  const fetchTreemapData = useCallback(async () => {
    if (!filters.startDate || !filters.endDate) return;
    
    setLoadingTreemap(true);
    try {
      const { data, error } = await supabase.rpc('get_treemap_data', {
        p_start_date: filters.startDate,
        p_end_date: filters.endDate,
        p_exclude_employees: filters.excludeEmployees,
        p_supervisors: filters.supervisors,
        p_sellers: filters.sellers,
        p_customer_groups: filters.customerGroups,
        p_regions: filters.regions,
        p_clients: filters.clients, // Correctly formatted array of strings from context
        p_search_term: filters.searchTerm,
        p_analysis_mode: 'customerGroup',
        p_show_defined_groups_only: true,
      });

      if (error) throw error;
      setTreemapData(data);
    } catch (error) {
      console.error("Error fetching treemap data:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados do gráfico",
        description: error.message,
      });
      setTreemapData([]);
    } finally {
      setLoadingTreemap(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    fetchTreemapData();
  }, [fetchTreemapData]);

  const aiContextData = useMemo(() => ({
    topGroups: treemapData.slice(0, 5).map(d => ({ name: d.name, sales: d.size }))
  }), [treemapData]);

  const { insight, loading: loadingAI, retry: retryAI } = useAIInsight('customer_group_analysis', aiContextData);

  return (
    <>
      <Helmet>
        <title>Analítico Grupos de Clientes - Costa Lavos</title>
        <meta name="description" content="Análise detalhada da performance por grupos de clientes." />
      </Helmet>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tighter">Analítico por Grupos de Clientes</h1>
          <p className="text-muted-foreground mt-1">Explore as vendas navegando através dos grupos de clientes, clientes, pedidos e produtos.</p>
        </div>
        
        <AIInsight insight={insight} loading={loadingAI} onRegenerate={retryAI} />

        <div className="grid grid-cols-1 gap-8">
           <ChartCard title="Distribuição de Vendas por Grupo de Cliente" height={400}>
            {loadingTreemap ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <TreeMapChart data={treemapData} dataKey="size" nameKey="name" />
            )}
          </ChartCard>

          <ChartCard title="Explorador de Vendas por Grupo de Cliente" childClassName="p-0">
            <CustomerGroupDrilldownExplorer />
          </ChartCard>
        </div>
      </div>
    </>
  );
};

export default AnaliticoGrupoClientes;