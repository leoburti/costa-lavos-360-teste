import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Loader2, TrendingUp, TrendingDown, UserCheck, UserX, AlertTriangle, CheckCircle, MinusCircle } from 'lucide-react';
import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import AIInsight from '@/components/AIInsight';
import ChartCard from '@/components/ChartCard';
import MetricCard from '@/components/MetricCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIInsight } from '@/hooks/useAIInsight';

const formatCurrency = (value) => value ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00';

const TrendIcon = ({ reason }) => {
  switch (reason) {
    case 'AUMENTO_EXPRESSIVO':
    case 'AUMENTO':
    case 'PROMISSOR':
      return <TrendingUp className="h-5 w-5 text-emerald-500" />;
    case 'QUEDA_ACENTUADA':
    case 'RISCO_CHURN':
      return <TrendingDown className="h-5 w-5 text-red-500" />;
    default:
      return <MinusCircle className="h-5 w-5 text-muted-foreground" />;
  }
};

const TrendDetail = ({ data, loading }) => {
  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!data || data.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">Nenhum cliente nesta categoria.</div>;
  }
  return (
    <ScrollArea className="h-[400px]">
      <div className="p-4 space-y-2">
        {data.map((client, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-3 rounded-lg bg-muted/50"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm truncate">{client.clientName}</p>
                <p className="text-xs text-muted-foreground">{client.seller}</p>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${client.trendChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {formatCurrency(client.trendChange)}
                </p>
                <p className="text-xs text-muted-foreground">Última Compra: {formatCurrency(client.lastPurchaseValue)}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
};

const TendenciaVendas = () => {
  const { filters } = useFilters();
  const [loading, setLoading] = useState(true);
  const [trendsData, setTrendsData] = useState(null);
  const [activeTab, setActiveTab] = useState("AUMENTO_EXPRESSIVO");
  const [analysisType, setAnalysisType] = useState('new_clients');
  const { toast } = useToast();

  const aiData = useMemo(() => {
    if (!trendsData) return null;
    const summary = Object.keys(trendsData).map(key => ({
      reason: key,
      count: trendsData[key].length,
    }));
    return { summary };
  }, [trendsData]);

  const { insight, loading: loadingAI, generateInsights } = useAIInsight('sales_trends', aiData);

  useEffect(() => {
    const fetchTrendsData = async () => {
      if (!filters.startDate || !filters.endDate) return;
      setLoading(true);
      const selectedClients = Array.isArray(filters.clients) ? filters.clients.map(c => c.value) : null;
      const { data, error } = await supabase.rpc('get_new_client_trends', {
        p_start_date: filters.startDate,
        p_end_date: filters.endDate,
        p_exclude_employees: filters.excludeEmployees,
        p_supervisors: filters.supervisors,
        p_sellers: filters.sellers,
        p_customer_groups: filters.customerGroups,
        p_regions: filters.regions,
        p_clients: selectedClients,
        p_search_term: filters.searchTerm,
        p_analysis_type: analysisType,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao buscar dados de Tendências",
          description: error.message,
        });
        setTrendsData(null);
      } else {
        const groupedData = (data || []).reduce((acc, item) => {
          const reason = item.reason || 'INDEFINIDO';
          if (!acc[reason]) {
            acc[reason] = [];
          }
          acc[reason].push(item);
          return acc;
        }, {});
        setTrendsData(groupedData);
        const firstTab = Object.keys(groupedData)[0] || "AUMENTO_EXPRESSIVO";
        setActiveTab(firstTab);
      }
      setLoading(false);
    };

    fetchTrendsData();
  }, [filters, analysisType, toast]);

  useEffect(() => {
    if(aiData) {
      generateInsights();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiData]);

  const kpis = useMemo(() => {
    if (!trendsData) return { growing: 0, falling: 0, stable: 0, promising: 0 };
    return {
      growing: (trendsData['AUMENTO_EXPRESSIVO']?.length || 0) + (trendsData['AUMENTO']?.length || 0),
      falling: (trendsData['QUEDA_ACENTUADA']?.length || 0) + (trendsData['RISCO_CHURN']?.length || 0),
      stable: trendsData['ESTABILIDADE']?.length || 0,
      promising: trendsData['PROMISSOR']?.length || 0,
    };
  }, [trendsData]);

  const tabs = useMemo(() => {
    if (!trendsData) return [];
    const order = ['PROMISSOR', 'AUMENTO_EXPRESSIVO', 'AUMENTO', 'ESTABILIDADE', 'QUEDA_ACENTUADA', 'RISCO_CHURN', 'INDEFINIDO'];
    return order.filter(key => trendsData[key] && trendsData[key].length > 0);
  }, [trendsData]);

  const tabLabels = {
    'PROMISSOR': 'Promissor',
    'AUMENTO_EXPRESSIVO': 'Aumento Expressivo',
    'AUMENTO': 'Aumento',
    'ESTABILIDADE': 'Estabilidade',
    'QUEDA_ACENTUADA': 'Queda Acentuada',
    'RISCO_CHURN': 'Risco de Churn',
    'INDEFINIDO': 'Indefinido',
  };

  return (
    <>
      <Helmet>
        <title>Tendências de Vendas - Costa Lavos</title>
        <meta name="description" content="Análise de tendências de compra dos clientes, identificando crescimento e risco de churn." />
      </Helmet>

      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tighter">Tendências de Vendas</h1>
            <p className="text-muted-foreground mt-1">Identifique clientes em crescimento, estabilidade ou risco.</p>
          </div>
          <Tabs value={analysisType} onValueChange={setAnalysisType} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="new_clients_30">Novos Clientes (30 dias)</TabsTrigger>
              <TabsTrigger value="new_clients">Novos Clientes (60 dias)</TabsTrigger>
              <TabsTrigger value="all_clients">Todos Clientes (90 dias)</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <AIInsight insight={insight} loading={loadingAI} onRegenerate={generateInsights} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Clientes em Crescimento" value={kpis.growing} icon={UserCheck} />
          <MetricCard title="Clientes em Queda" value={kpis.falling} icon={UserX} />
          <MetricCard title="Clientes Estáveis" value={kpis.stable} icon={CheckCircle} />
          <MetricCard title="Clientes Promissores" value={kpis.promising} icon={AlertTriangle} />
        </div>

        <ChartCard>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
              {tabs.map(tabKey => (
                <TabsTrigger key={tabKey} value={tabKey}>
                  {tabLabels[tabKey]} ({trendsData[tabKey]?.length || 0})
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs.map(tabKey => (
              <TabsContent key={tabKey} value={tabKey} className="mt-4">
                <TrendDetail data={trendsData[tabKey]} loading={loading} />
              </TabsContent>
            ))}
          </Tabs>
        </ChartCard>
      </motion.div>
    </>
  );
};

export default TendenciaVendas;