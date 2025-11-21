import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Loader2, TrendingDown, TrendingUp, DollarSign, Package, Users, Building2, Store } from 'lucide-react';
import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import AIInsight from '@/components/AIInsight';
import ChartCard from '@/components/ChartCard';
import MetricCard from '@/components/MetricCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { useAIInsight } from '@/hooks/useAIInsight';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'R$ 0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/80 backdrop-blur-sm p-2 border rounded-lg shadow-lg">
        <p className="font-bold">{label}</p>
        <p className="text-sm text-primary">
          Bonificado: {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const DataList = ({ data, loading }) => {
  if (loading) return <div className="h-[300px] flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!data || data.length === 0) return <div className="h-[300px] flex justify-center items-center text-muted-foreground">Nenhum dado encontrado.</div>;
  
  return (
    <ScrollArea className="h-[300px]">
      <div className="p-4 space-y-2">
      {data.map((item, index) => (
        <motion.div 
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex justify-between items-center p-2 bg-muted/50 rounded-md text-sm"
        >
          <p className="font-semibold truncate pr-4">{item.name}</p>
          <p className="font-bold text-primary whitespace-nowrap">{formatCurrency(item.value)}</p>
        </motion.div>
      ))}
      </div>
    </ScrollArea>
  )
}

const AnaliticoBonificados = () => {
  const { filters } = useFilters();
  const [loading, setLoading] = useState(true);
  const [bonificationData, setBonificationData] = useState(null);
  const [groupBy, setGroupBy] = useState('supervisor');
  const [activeBar, setActiveBar] = useState(null);
  const { toast } = useToast();

  const aiData = useMemo(() => {
    if (!bonificationData) return null;
    
    const kpis = bonificationData.kpis || {};
    const distribution = bonificationData.distribution || {};

    return {
      kpis: {
        mostBonifiedProduct: kpis.mostBonifiedProduct || 'N/A',
        topSupervisor: kpis.topSupervisor || 'N/A',
        bottomSupervisor: kpis.bottomSupervisor || 'N/A',
      },
      topProducts: bonificationData.topProducts?.slice(0, 5) || [],
      distributionSummary: {
        topSupervisor: distribution.supervisor?.[0],
        topSeller: distribution.seller?.[0],
        topClient: distribution.client?.[0],
      }
    };
  }, [bonificationData]);

  const { insight, loading: loadingAI, generateInsights } = useAIInsight('bonification_analysis', aiData);

  useEffect(() => {
    const fetchBonificationData = async () => {
      if (!filters.startDate || !filters.endDate) return;
      setLoading(true);
      const selectedClients = Array.isArray(filters.clients) ? filters.clients.map(c => c.value) : null;
      const { data, error } = await supabase.rpc('get_bonification_analysis', {
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
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao buscar dados de Bonificação",
          description: error.message,
        });
        setBonificationData(null);
      } else {
        setBonificationData(data);
      }
      setLoading(false);
    };

    fetchBonificationData();
  }, [filters, toast]);

  useEffect(() => {
    if(aiData) {
      generateInsights();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiData]);

  const totalBonified = useMemo(() => {
    if (!bonificationData || !bonificationData.distribution?.supervisor) return 0;
    return bonificationData.distribution.supervisor.reduce((acc, s) => acc + (s.value || 0), 0);
  }, [bonificationData]);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  
  const kpis = bonificationData?.kpis || {};
  const topProducts = bonificationData?.topProducts || [];
  const distribution = bonificationData?.distribution || {};
  
  const tabs = [
    { value: 'supervisor', label: 'Supervisor', icon: Building2 },
    { value: 'seller', label: 'Vendedor', icon: Users },
    { value: 'customer_group', label: 'Grupo de Cliente', icon: Package },
    { value: 'client', label: 'Cliente', icon: Store },
  ];

  return (
    <>
      <Helmet>
        <title>Analítico de Bonificados - Costa Lavos</title>
        <meta name="description" content="Análise detalhada de produtos bonificados." />
      </Helmet>

      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tighter">Análise de Bonificações</h1>
          <p className="text-muted-foreground mt-1">Entenda o impacto e a distribuição das bonificações.</p>
        </div>
        
        <AIInsight insight={insight} loading={loadingAI} onRegenerate={generateInsights} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard title="Total Bonificado" value={formatCurrency(totalBonified)} icon={DollarSign} />
            <MetricCard title="Produto Mais Bonificado" value={kpis.mostBonifiedProduct || 'N/A'} icon={Package} />
            <MetricCard title="Supervisor com Mais Bonif." value={kpis.topSupervisor || 'N/A'} icon={TrendingUp} />
            <MetricCard title="Supervisor com Menos Bonif." value={kpis.bottomSupervisor || 'N/A'} icon={TrendingDown} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Top 10 Produtos Bonificados" childClassName="p-4">
                {topProducts.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topProducts} margin={{ top: 20, right: 20, left: -20, bottom: 5 }} onMouseMove={(state) => {
                            if (state.isTooltipActive) {
                                setActiveBar(state.activeTooltipIndex);
                            } else {
                                setActiveBar(null);
                            }
                        }}>
                            <XAxis 
                                dataKey="product_name" 
                                tickFormatter={(value) => value.substring(0, 8) + '...'} 
                                interval={0} 
                                angle={-45} 
                                textAnchor="end" 
                                height={60} 
                                fontSize={11}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `R${(value/1000).toFixed(0)}k`} fontSize={11} />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ fill: 'hsl(var(--accent))' }}
                            />
                            <Bar dataKey="total_bonified" name="Bonificado" radius={[4, 4, 0, 0]}>
                                {topProducts.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === activeBar ? 'hsl(var(--primary))' : 'hsl(var(--primary)/0.5)'} />
                                ))}
                                <LabelList 
                                    dataKey="total_bonified" 
                                    position="top" 
                                    formatter={(value) => formatCurrency(value)} 
                                    fontSize={11} 
                                    className="fill-foreground"
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : <div className="h-[300px] flex justify-center items-center text-muted-foreground">Nenhum produto bonificado no período.</div>}
            </ChartCard>
            <ChartCard title="Distribuição de Bonificações">
              <Tabs value={groupBy} onValueChange={setGroupBy} className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                  {tabs.map(tab => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                      <tab.icon className="mr-2 h-4 w-4" />
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <DataList data={distribution[groupBy]} loading={loading} />
              </Tabs>
            </ChartCard>
        </div>
      </motion.div>
    </>
  );
};

export default AnaliticoBonificados;