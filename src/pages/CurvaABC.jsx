import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Loader2, Star, TrendingUp, TrendingDown, Percent } from 'lucide-react';
import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import AIInsight from '@/components/AIInsight';
import ChartCard from '@/components/ChartCard';
import MetricCard from '@/components/MetricCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIInsight } from '@/hooks/useAIInsight';
import TreeMapChart from '@/components/TreeMapChart';

const formatCurrency = (value) => value ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00';

const CurveDetail = ({ curve, data, loading }) => {
  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!data) {
    return <div className="text-center py-10 text-muted-foreground">Nenhum cliente nesta curva.</div>;
  }
  return (
    <ScrollArea className="h-[400px]">
      <div className="p-4 space-y-2">
        {data.clients.map((client, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-3 rounded-lg bg-muted/50"
          >
            <div className="flex justify-between items-center">
              <p className="font-semibold text-sm truncate pr-4">{client.name}</p>
              <div className="text-right">
                <p className="font-bold text-sm text-primary">{formatCurrency(client.revenue)}</p>
                <p className="text-xs text-muted-foreground">{client.percentage.toFixed(2)}% da curva</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
};

const CurvaABC = () => {
  const { filters } = useFilters();
  const [loading, setLoading] = useState(true);
  const [abcData, setAbcData] = useState(null);
  const [activeTab, setActiveTab] = useState("A+");
  const [isProjected, setIsProjected] = useState(false);
  const { toast } = useToast();

  const aiData = useMemo(() => {
    if (!abcData) return null;
    const summary = Object.keys(abcData).map(key => ({
      curve: key,
      client_count: abcData[key].client_count,
      total_revenue: abcData[key].total_revenue,
      percentage_of_total: abcData[key].percentage_of_total,
    }));
    return { summary };
  }, [abcData]);

  const { insight, loading: loadingAI, generateInsights } = useAIInsight('abc_curve_analysis', aiData);

  useEffect(() => {
    const fetchAbcData = async () => {
      if (!filters.startDate || !filters.endDate) return;
      setLoading(true);
      const rpcName = isProjected ? 'get_projected_abc_analysis' : 'get_abc_analysis';
      const selectedClients = Array.isArray(filters.clients) ? filters.clients.map(c => c.value) : null;
      const { data, error } = await supabase.rpc(rpcName, {
        p_start_date: filters.startDate,
        p_end_date: filters.endDate,
        p_exclude_employees: filters.excludeEmployees,
        p_supervisors: filters.supervisors,
        p_sellers: filters.sellers,
        p_customer_groups: filters.customerGroups,
        p_regions: filters.regions,
        p_clients: selectedClients,
        p_search_term: filters.searchTerm,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao buscar dados da Curva ABC",
          description: error.message,
        });
        setAbcData(null);
      } else {
        setAbcData(data);
        const firstCurve = Object.keys(data || {}).sort()[0] || "A+";
        setActiveTab(firstCurve);
      }
      setLoading(false);
    };

    fetchAbcData();
  }, [filters, isProjected, toast]);

  useEffect(() => {
    if(aiData) {
      generateInsights();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiData]);

  const curves = useMemo(() => {
    return abcData ? Object.keys(abcData).sort((a, b) => {
      if (a === 'A+') return -1;
      if (b === 'A+') return 1;
      return a.localeCompare(b);
    }) : [];
  }, [abcData]);

  const totalRevenue = useMemo(() => {
    if (!abcData) return 0;
    return Object.values(abcData).reduce((sum, curve) => sum + curve.total_revenue, 0);
  }, [abcData]);

  const treemapData = useMemo(() => {
    if (!abcData) return [];
    return Object.keys(abcData).map(curve => ({
      name: `Curva ${curve}`,
      size: abcData[curve].total_revenue,
    })).filter(item => item.size > 0);
  }, [abcData]);

  return (
    <>
      <Helmet>
        <title>Curva ABC de Clientes - Costa Lavos</title>
        <meta name="description" content="Análise da Curva ABC para classificação de clientes com base no faturamento." />
      </Helmet>

      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tighter">Curva ABC de Clientes</h1>
            <p className="text-muted-foreground mt-1">Classifique clientes com base no faturamento para ações estratégicas.</p>
          </div>
          <Tabs value={isProjected ? "projected" : "realized"} onValueChange={(v) => setIsProjected(v === "projected")} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="realized">Realizado</TabsTrigger>
              <TabsTrigger value="projected">Projetado</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <AIInsight insight={insight} loading={loadingAI} onRegenerate={generateInsights} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Faturamento Total" value={formatCurrency(totalRevenue)} icon={Star} />
          <MetricCard title="Clientes Curva A+" value={abcData?.['A+']?.client_count || 0} subtitle={formatCurrency(abcData?.['A+']?.total_revenue)} icon={TrendingUp} />
          <MetricCard title="Clientes Curva A" value={abcData?.['A']?.client_count || 0} subtitle={formatCurrency(abcData?.['A']?.total_revenue)} icon={TrendingUp} />
          <MetricCard title="Clientes Curva E" value={abcData?.['E']?.client_count || 0} subtitle={formatCurrency(abcData?.['E']?.total_revenue)} icon={TrendingDown} />
        </div>

        <ChartCard title="Distribuição de Faturamento por Curva">
          {loading ? (
            <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <TreeMapChart data={treemapData} />
          )}
        </ChartCard>

        <ChartCard title="Detalhes por Curva">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
              {curves.map(curve => (
                <TabsTrigger key={curve} value={curve}>
                  Curva {curve}
                </TabsTrigger>
              ))}
            </TabsList>
            {curves.map(curve => (
              <TabsContent key={curve} value={curve} className="mt-4">
                <div className="bg-muted/30 p-4 rounded-lg mb-4 flex flex-wrap justify-around items-center gap-4 text-center">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Faturamento da Curva</span>
                    <span className="text-lg font-bold text-primary">{formatCurrency(abcData[curve]?.total_revenue)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Nº de Clientes</span>
                    <span className="text-lg font-bold text-primary">{abcData[curve]?.client_count}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">% do Total</span>
                    <span className="text-lg font-bold text-primary flex items-center gap-1"><Percent size={16}/> {abcData[curve]?.percentage_of_total.toFixed(2)}</span>
                  </div>
                </div>
                <CurveDetail curve={curve} data={abcData[curve]} loading={loading} />
              </TabsContent>
            ))}
          </Tabs>
        </ChartCard>
      </motion.div>
    </>
  );
};

export default CurvaABC;