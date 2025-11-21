
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { UserCheck, Users, Target, Loader2 } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import ChartCard from '@/components/ChartCard';
import AIInsight from '@/components/AIInsight';
import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import SupervisorRankingList from '@/components/SupervisorRankingList';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAIInsight } from '@/hooks/useAIInsight';

const AnaliticoSupervisor = () => {
  const { filters } = useFilters();
  const [loading, setLoading] = useState(true);
  const [operationalData, setOperationalData] = useState(null);
  const { toast } = useToast();

  const simplifiedDataContext = React.useMemo(() => {
    if (!operationalData || !operationalData.kpis || !operationalData.data) return null;
    const { data, kpis } = operationalData;
    return {
      kpis,
      top_5_supervisors: data.slice(0, 5).map(s => ({ 
        name: s.name, 
        total_revenue: s.total_revenue, 
        client_activation: s.client_activation,
        averageTicket: s.averageTicket
      })),
    };
  }, [operationalData]);

  const { insight, loading: loadingAI, retry: retryAI } = useAIInsight('supervisor_analysis', simplifiedDataContext, filters);

  const fetchOperationalData = useCallback(async () => {
    if (!filters.startDate || !filters.endDate) return;
    setLoading(true);
    const selectedClients = filters.clients ? filters.clients.map(c => c.value) : null;
    const { data, error } = await supabase.rpc('get_operational_analysis', {
      p_start_date: filters.startDate,
      p_end_date: filters.endDate,
      p_exclude_employees: filters.excludeEmployees,
      p_supervisors: filters.supervisors,
      p_sellers: filters.sellers,
      p_customer_groups: filters.customerGroups,
      p_regions: filters.regions,
      p_clients: selectedClients,
      p_search_term: filters.searchTerm,
      p_view_mode: 'supervisor',
      p_show_defined_groups_only: false,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar dados de Supervisor",
        description: error.message,
      });
      setOperationalData(null);
    } else {
      setOperationalData(data);
    }
    setLoading(false);
  }, [filters, toast]);

  useEffect(() => {
    fetchOperationalData();
  }, [fetchOperationalData]);

  const kpis = useMemo(() => operationalData?.kpis || {}, [operationalData]);
  
  const supervisorData = useMemo(() => {
    if (!operationalData?.data) return [];
    return (operationalData.data || [])
      .map(item => ({
        name: item.name,
        total_revenue: item.total_revenue,
        client_activation: item.client_activation,
        averageTicket: item.averageTicket
      }))
      .sort((a, b) => b.total_revenue - a.total_revenue);
  }, [operationalData]);


  if (loading && !operationalData) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const formatCurrency = (value) => value != null ? `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}` : 'R$ 0';
  const formatPercentage = (value) => value != null ? `${value.toFixed(2)}%` : '0.00%';
  const formatDecimal = (value) => value != null ? value.toFixed(2) : '0.00';

  return (
    <TooltipProvider>
      <Helmet>
        <title>Analítico Supervisor - Costa Lavos</title>
        <meta name="description" content="Análise detalhada da performance dos supervisores de vendas" />
      </Helmet>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tighter">Analítico por Supervisor</h1>
          <p className="text-muted-foreground mt-1">Performance e análise detalhada dos supervisores de vendas.</p>
        </div>
        
        <AIInsight insight={insight} loading={loadingAI || loading} onRegenerate={retryAI} />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard title="Ticket Médio Global" value={formatCurrency(kpis.averageTicketGlobal)} icon={Target} />
          <MetricCard title="Positivação Global" value={formatPercentage(kpis.positivationRateGlobal)} icon={UserCheck} />
          <MetricCard title="Itens por Venda (Média)" value={formatDecimal(kpis.averageItemsPerSaleGlobal)} icon={Users} />
        </div>
        
        <ChartCard title="Ranking de Supervisores" childClassName="p-0">
          <SupervisorRankingList data={supervisorData} isLoading={loading} />
        </ChartCard>

      </div>
    </TooltipProvider>
  );
};

export default AnaliticoSupervisor;
