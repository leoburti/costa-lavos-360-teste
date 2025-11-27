
import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Award, TrendingUp, Loader2 } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import ChartCard from '@/components/ChartCard';
import AIInsight from '@/components/AIInsight';
import BonificationDrilldownExplorer from '@/components/BonificationDrilldownExplorer';
import { useFilters } from '@/contexts/FilterContext';
import { useAIInsight } from '@/hooks/useAIInsight';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const PerformanceBonificados = () => {
  const { filters } = useFilters();

  // Correct date access and formatting
  const dateRange = filters.dateRange || { from: startOfMonth(new Date()), to: endOfMonth(new Date()) };
  const startDateStr = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const endDateStr = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : format(endOfMonth(new Date()), 'yyyy-MM-dd');

  // Debug Logs
  useEffect(() => {
    console.log('[PerformanceBonificados] Filters:', filters);
    console.log('[PerformanceBonificados] Dates:', { startDateStr, endDateStr });
  }, [filters, startDateStr, endDateStr]);

  const params = useMemo(() => {
    const selectedClients = filters.clients ? filters.clients.map(c => c.value) : null;
    return {
      p_start_date: startDateStr,
      p_end_date: endDateStr,
      p_exclude_employees: filters.excludeEmployees,
      p_supervisors: filters.supervisors,
      p_sellers: filters.sellers,
      p_customer_groups: filters.customerGroups,
      p_regions: filters.regions,
      p_clients: selectedClients,
      p_search_term: filters.searchTerm,
      p_show_defined_groups_only: false,
      p_group_by: 'supervisor', // Default for overall KPIs
    };
  }, [filters, startDateStr, endDateStr]);

  const { data: kpiData, loading } = useAnalyticalData(
    'get_bonification_performance',
    params,
    { 
        enabled: !!startDateStr && !!endDateStr,
        defaultValue: null
    }
  );

  const aiData = useMemo(() => {
    if (!kpiData) return null;
    return {
      kpis: kpiData.kpis,
    };
  }, [kpiData]);

  const { insight, loading: loadingAI, generateInsights } = useAIInsight('bonification_performance', aiData);

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
        
        {loading ? (
            <div className="flex items-center justify-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricCard title="Média de Bonificação" value={`${(kpis.averagePercentage || 0).toFixed(2)}%`} icon={Award} />
            <MetricCard title="Maior Performance" value={`${(kpis.topPerformer?.value || 0).toFixed(2)}%`} icon={TrendingUp} subtitle={kpis.topPerformer?.name || 'N/A'} />
            </div>
        )}

        <ChartCard title="Explorador de Performance" childClassName="p-0">
          <BonificationDrilldownExplorer />
        </ChartCard>

      </motion.div>
    </>
  );
};

export default PerformanceBonificados;
