
import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Loader2, DollarSign, AlertTriangle, TrendingUp, Building2, User, Store } from 'lucide-react';
import { useFilters } from '@/contexts/FilterContext';
import AIInsight from '@/components/AIInsight';
import MetricCard from '@/components/MetricCard';
import ChartCard from '@/components/ChartCard';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useAIInsight } from '@/hooks/useAIInsight';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const formatCurrency = (value) => value != null ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A';
const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'N/A';

const DrilldownLevel = ({ items, level = 0 }) => {
  const hierarchy = [
    { icon: Building2, label: 'Supervisor' },
    { icon: User, label: 'Vendedor' },
    { icon: Store, label: 'Cliente' },
  ];

  const currentLevel = hierarchy[level];

  if (!items || items.length === 0) {
    if (level === 0) {
      return (
        <div className="text-center py-16">
          <TrendingUp className="mx-auto h-12 w-12 text-green-500" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">Parabéns!</h3>
          <p className="mt-1 text-muted-foreground">Nenhum cliente com baixo desempenho encontrado.</p>
        </div>
      );
    }
    return null;
  }
  
  return (
    <Accordion type="multiple" className="w-full">
      {items.map((item, index) => (
        <AccordionItem value={`item-${level}-${index}`} key={index}>
          <AccordionTrigger className="hover:no-underline p-2 rounded-lg hover:bg-muted transition-colors">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-3 truncate">
                <currentLevel.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-semibold text-sm text-foreground text-left truncate">{item.name}</span>
              </div>
              {item.children && <Badge variant="destructive" className="font-bold ml-2">{item.children.length} {level === 1 ? 'clientes' : 'vendedores'}</Badge>}
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-0 pl-6">
            {item.children ? (
              <div className="border-l-2 border-dashed border-border/50 pl-4">
                <DrilldownLevel items={item.children} level={level + 1} />
              </div>
            ) : (
              <div className="p-3 my-2 bg-background rounded-md border text-sm text-foreground">
                <div className="grid grid-cols-2 gap-2">
                    <p className="font-semibold">Receita no Mês:</p> <p className="font-bold text-destructive">{formatCurrency(item.total_revenue)}</p>
                    <p className="font-semibold">Última Compra:</p> <p className="font-bold">{formatDate(item.last_purchase_date)}</p>
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};


const BaixoDesempenho = () => {
  const { filters } = useFilters();

  // Correct date access and formatting
  const dateRange = filters.dateRange || { from: startOfMonth(new Date()), to: endOfMonth(new Date()) };
  const startDateStr = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const endDateStr = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : format(endOfMonth(new Date()), 'yyyy-MM-dd');

  // Debug Logs
  useEffect(() => {
    console.log('[BaixoDesempenho] Filters:', filters);
    console.log('[BaixoDesempenho] Dates:', { startDateStr, endDateStr });
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
    };
  }, [filters, startDateStr, endDateStr]);

  const { data: performanceData, loading } = useAnalyticalData(
    'get_low_performance_clients',
    params,
    { 
        enabled: !!startDateStr && !!endDateStr,
        defaultValue: null
    }
  );

  const aiContextData = useMemo(() => {
    if (!performanceData) return null;
    const topRiskSupervisor = performanceData.data?.[0];
    return {
      kpis: performanceData.kpis,
      topRiskSupervisor: topRiskSupervisor ? {
        name: topRiskSupervisor.name,
        clientCount: topRiskSupervisor.children?.reduce((acc, seller) => acc + seller.children.length, 0),
      } : null,
    };
  }, [performanceData]);

  const { insight, loading: loadingAI, generateInsights } = useAIInsight('low_performance_analysis', aiContextData);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  const kpis = performanceData?.kpis || {};
  const drilldownData = performanceData?.data || [];

  return (
    <>
      <Helmet>
        <title>Baixo Desempenho - Costa Lavos</title>
        <meta name="description" content="Análise de clientes com vendas mensais abaixo de R$ 3.000,00." />
      </Helmet>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tighter">Análise de Baixo Desempenho</h1>
          <p className="text-muted-foreground mt-1">Clientes com vendas no mês abaixo de R$ 3.000,00.</p>
        </div>

        <AIInsight insight={insight} loading={loadingAI} onRegenerate={generateInsights} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricCard title="Clientes em Risco" value={String(kpis.totalClientsInRisk || 0)} icon={AlertTriangle} />
          <MetricCard title="Receita Potencial Perdida" value={formatCurrency(kpis.potentialLostRevenue)} icon={DollarSign} subtitle="Valor para atingir a meta mensal" />
        </div>

        <ChartCard title="Clientes por Estrutura Comercial" childClassName="p-2">
          <DrilldownLevel items={drilldownData} />
        </ChartCard>
      </motion.div>
    </>
  );
};

export default BaixoDesempenho;
