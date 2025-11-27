
import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Loader2, Target, TrendingUp, TrendingDown, Percent, ChevronRight, User, Users, ShoppingBag } from 'lucide-react';
import { useFilters } from '@/contexts/FilterContext';
import AIInsight from '@/components/AIInsight';
import ChartCard from '@/components/ChartCard';
import MetricCard from '@/components/MetricCard';
import { useAIInsight } from '@/hooks/useAIInsight';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const LoyaltyProgressBar = ({ score }) => {
  const getScoreColor = (s) => {
    if (s >= 90) return 'bg-emerald-500';
    if (s >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full bg-muted rounded-full h-2">
      <motion.div
        className={cn("h-2 rounded-full", getScoreColor(score))}
        style={{ width: `${Math.min(100, score)}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, score)}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
};

const ClientRow = ({ client }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-4 bg-background/50 rounded-lg"
  >
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{client.client_name}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
          <span>Meta: <span className="font-mono">{client.target_kg_day.toFixed(2)}kg</span></span>
          <span>Realizado: <span className="font-mono">{client.actual_kg_per_effective_day.toFixed(2)}kg</span></span>
        </div>
      </div>
      <div className="w-32 flex-shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <LoyaltyProgressBar score={client.loyalty_score} />
              <span className="font-bold text-sm">{client.loyalty_score.toFixed(0)}%</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Dias de compra: {client.effective_purchase_days}</p>
            <p>Total comprado: {client.total_kg_sold.toFixed(2)} Kg</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  </motion.div>
);

const SellerAccordion = ({ seller }) => (
  <AccordionItem value={seller.name} className="border-b-0">
    <AccordionTrigger className="p-4 bg-muted/50 rounded-t-lg hover:no-underline data-[state=open]:rounded-b-none">
      <div className="flex items-center justify-between w-full gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <User className="h-5 w-5 text-primary" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground truncate">{seller.name}</p>
            <p className="text-xs text-muted-foreground">{seller.clients.length} cliente(s)</p>
          </div>
        </div>
        <div className="w-40 flex-shrink-0">
          <div className="flex items-center gap-2">
            <LoyaltyProgressBar score={seller.loyalty_score} />
            <span className="font-bold text-sm">{seller.loyalty_score.toFixed(0)}%</span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />
      </div>
    </AccordionTrigger>
    <AccordionContent className="p-4 bg-muted/20 rounded-b-lg">
      <div className="space-y-2">
        {seller.clients.map((client, index) => (
          <ClientRow key={`${client.client_code}-${index}`} client={client} />
        ))}
      </div>
    </AccordionContent>
  </AccordionItem>
);

const SupervisorAccordion = ({ supervisor }) => (
  <AccordionItem value={supervisor.name} className="border-b border-border/50 bg-card rounded-lg mb-3 shadow-sm hover:shadow-md transition-shadow duration-300">
    <AccordionTrigger className="p-4 text-left hover:no-underline">
      <div className="flex items-center justify-between w-full gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Users className="h-6 w-6 text-primary" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-lg text-foreground truncate">{supervisor.name}</p>
            <p className="text-sm text-muted-foreground">{supervisor.sellers.length} vendedor(es)</p>
          </div>
        </div>
        <div className="w-48 flex-shrink-0 hidden sm:block">
          <div className="flex items-center gap-2">
            <LoyaltyProgressBar score={supervisor.loyalty_score} />
            <span className="font-bold text-base">{supervisor.loyalty_score.toFixed(0)}%</span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />
      </div>
    </AccordionTrigger>
    <AccordionContent className="border-t border-border/50 px-4 pt-4 pb-2">
      <Accordion type="multiple" className="space-y-2">
        {supervisor.sellers.map((seller, index) => (
          <SellerAccordion key={`${seller.name}-${index}`} seller={seller} />
        ))}
      </Accordion>
    </AccordionContent>
  </AccordionItem>
);

const AnaliseFidelidade = () => {
  const { filters } = useFilters();

  // Correct date access and formatting
  const dateRange = filters.dateRange || { from: startOfMonth(new Date()), to: endOfMonth(new Date()) };
  const startDateStr = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const endDateStr = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : format(endOfMonth(new Date()), 'yyyy-MM-dd');

  // Debug logging
  useEffect(() => {
    console.log('[AnaliseFidelidade] Filters:', filters);
    console.log('[AnaliseFidelidade] Dates:', { startDateStr, endDateStr });
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

  const { data: loyaltyData, loading } = useAnalyticalData(
    'get_loyalty_analysis_drilldown',
    params,
    { 
        enabled: !!startDateStr && !!endDateStr,
        defaultValue: { kpis: {}, supervisors: [] }
    }
  );

  const aiData = useMemo(() => {
    if (!loyaltyData || !loyaltyData.supervisors) return null;
    return {
      kpis: loyaltyData.kpis,
      top_performers: loyaltyData.supervisors.filter(c => c.loyalty_score > 90).slice(0, 3),
      bottom_performers: loyaltyData.supervisors.filter(c => c.loyalty_score < 50).slice(0, 3),
    };
  }, [loyaltyData]);

  const { insight, loading: loadingAI, generateInsights } = useAIInsight('loyalty_analysis', aiData);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  const { kpis, supervisors } = loyaltyData;

  return (
    <>
      <Helmet>
        <title>Análise de Fidelidade - Costa Lavos</title>
        <meta name="description" content="Análise de fidelidade dos clientes com base na meta de compra vs. realizado." />
      </Helmet>

      <motion.div
        className="space-y-8 p-4 sm:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tighter flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-primary" />
            Análise de Fidelidade
          </h1>
          <p className="text-muted-foreground mt-1">Compare a meta de compra prometida com o desempenho real dos clientes.</p>
        </div>

        <AIInsight insight={insight} loading={loadingAI} onRegenerate={generateInsights} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Pontuação Média" value={`${(kpis?.average_loyalty_score || 0).toFixed(1)}%`} icon={Percent} subtitle="Média de fidelidade geral" />
          <MetricCard title="Clientes Acima da Meta" value={kpis?.clients_above_target || 0} icon={TrendingUp} subtitle="Performando como esperado ou melhor" />
          <MetricCard title="Clientes Abaixo da Meta" value={kpis?.clients_below_target || 0} icon={TrendingDown} subtitle="Oportunidades de melhoria" />
          <MetricCard title="Total com Meta Definida" value={kpis?.total_clients_with_target || 0} icon={Target} subtitle="Clientes com meta de compra" />
        </div>

        <ChartCard title="Desempenho de Fidelidade por Equipe" childClassName="p-0">
          <TooltipProvider>
            <div className="p-4">
              {supervisors && supervisors.length > 0 ? (
                <Accordion type="multiple" className="space-y-0">
                  {supervisors.map((supervisor, index) => (
                    <SupervisorAccordion key={`${supervisor.name}-${index}`} supervisor={supervisor} />
                  ))}
                </Accordion>
              ) : (
                <div className="flex items-center justify-center h-64 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground">Nenhum dado de fidelidade encontrado para os filtros selecionados.</p>
                </div>
              )}
            </div>
          </TooltipProvider>
        </ChartCard>
      </motion.div>
    </>
  );
};

export default AnaliseFidelidade;
