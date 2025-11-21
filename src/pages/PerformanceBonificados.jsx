import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Award, TrendingUp } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import ChartCard from '@/components/ChartCard';
import AIInsight from '@/components/AIInsight';
import BonificationDrilldownExplorer from '@/components/BonificationDrilldownExplorer';
import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAIInsight } from '@/hooks/useAIInsight';

const PerformanceBonificados = () => {
  const { filters } = useFilters();
  const [loadingKpis, setLoadingKpis] = useState(true);
  const [kpiData, setKpiData] = useState(null);
  const { toast } = useToast();

  const aiData = useMemo(() => {
    if (!kpiData) return null;
    return {
      kpis: kpiData.kpis,
    };
  }, [kpiData]);

  const { insight, loading: loadingAI, generateInsights } = useAIInsight('bonification_performance', aiData);

  useEffect(() => {
    const fetchData = async () => {
      if (!filters.startDate || !filters.endDate) return;
      setLoadingKpis(true);
      const selectedClients = Array.isArray(filters.clients) ? filters.clients.map(c => c.value) : null;
      const { data, error } = await supabase.rpc('get_bonification_performance', {
        p_start_date: filters.startDate,
        p_end_date: filters.endDate,
        p_exclude_employees: filters.excludeEmployees,
        p_supervisors: filters.supervisors,
        p_sellers: filters.sellers,
        p_customer_groups: filters.customerGroups,
        p_regions: filters.regions,
        p_clients: selectedClients,
        p_search_term: filters.searchTerm,
        p_show_defined_groups_only: false,
        p_group_by: 'supervisor', // Default for overall KPIs
      });

      if (error) {
        toast({ variant: "destructive", title: "Erro na Análise", description: error.message });
        setKpiData(null);
      } else {
        setKpiData(data);
      }
      setLoadingKpis(false);
    };
    fetchData();
  }, [filters, toast]);

  useEffect(() => {
    if(aiData) {
      generateInsights();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiData]);

  const kpis = kpiData?.kpis || {};

  return (
    <>
      <Helmet>
        <title>Performance de Bonificados - Costa Lavos</title>
        <meta name="description" content="Análise da correlação entre bonificações e vendas." />
      </Helmet>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tighter">Performance de Bonificação</h1>
          <p className="text-muted-foreground mt-1">Análise do percentual de bonificação sobre a receita líquida.</p>
        </div>

        <AIInsight insight={insight} loading={loadingAI} onRegenerate={generateInsights} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricCard title="Média de Bonificação" value={`${(kpis.averagePercentage || 0).toFixed(2)}%`} icon={Award} />
          <MetricCard title="Maior Performance" value={`${(kpis.topPerformer?.value || 0).toFixed(2)}%`} icon={TrendingUp} subtitle={kpis.topPerformer?.name || 'N/A'} />
        </div>

        <ChartCard title="Explorador de Performance" childClassName="p-0">
          <BonificationDrilldownExplorer />
        </ChartCard>

      </motion.div>
    </>
  );
};

export default PerformanceBonificados;