import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Users, TrendingUp, Target, Loader2 } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import ChartCard from '@/components/ChartCard';
import AIInsight from '@/components/AIInsight';
import SellerRankingList from '@/components/SellerRankingList';
import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAIInsight } from '@/hooks/useAIInsight';

const AnaliticoVendedor = () => {
  const { filters } = useFilters();
  const [loading, setLoading] = useState(true);
  const [operationalData, setOperationalData] = useState(null);
  const { toast } = useToast();

  const simplifiedDataContext = React.useMemo(() => {
    if (!operationalData) return null;
    const { data, ...rest } = operationalData;
    return {
      ...rest,
      top_5_sellers: data?.slice(0, 5).map(s => ({ name: s.name, total_revenue: s.total_revenue, client_activation: s.client_activation })),
    };
  }, [operationalData]);

  const { insight, loading: loadingAI, retry: retryAI } = useAIInsight('seller_analysis', simplifiedDataContext, filters);
  
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
      p_view_mode: 'seller',
      p_show_defined_groups_only: false,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar dados de Vendedor",
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
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const kpis = operationalData?.kpis || {};
  const sellerData = operationalData?.data || [];
  const totalRevenue = sellerData.reduce((acc, seller) => acc + seller.total_revenue, 0);
  const formatCurrency = (value) => value ? `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}` : 'R$ 0';

  return (
    <>
      <Helmet>
        <title>Analítico Vendedor - Costa Lavos</title>
        <meta name="description" content="Análise detalhada da performance individual dos vendedores" />
      </Helmet>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Analítico por Vendedor</h1>
          <p className="text-muted-foreground mt-1">Performance individual e análise detalhada dos vendedores.</p>
        </div>

        <AIInsight insight={insight} loading={loadingAI} onRegenerate={retryAI} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard title="Ticket Médio Global" value={formatCurrency(kpis.averageTicketGlobal)} icon={Target} />
            <MetricCard title="Positivação Global" value={`${(kpis.positivationRateGlobal || 0).toFixed(2)}%`} icon={TrendingUp} />
            <MetricCard title="Itens por Venda (Média)" value={(kpis.averageItemsPerSaleGlobal || 0).toFixed(2)} icon={Users} />
        </div>

        <ChartCard title="Ranking de Vendas por Vendedor" height={600} childClassName="p-4">
          <SellerRankingList data={sellerData} totalRevenue={totalRevenue} />
        </ChartCard>
      </div>
    </>
  );
};

export default AnaliticoVendedor;