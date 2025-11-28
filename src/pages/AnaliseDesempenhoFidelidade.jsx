
import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Loader2, Target, TrendingUp, TrendingDown, Percent, ChevronRight, User, Users, ShoppingBag, DollarSign, AlertTriangle, Building2, Store } from 'lucide-react';
import { useFilters } from '@/contexts/FilterContext';
import AIInsight from '@/components/AIInsight';
import MetricCard from '@/components/MetricCard';
import { useAIInsight } from '@/hooks/useAIInsight';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth } from 'date-fns';

// --- Funções de Formatação ---
const formatCurrency = (value) => value != null ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A';
const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'N/A';

// --- Componentes para a Aba de Fidelidade ---
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
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, score)}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
};

const LoyaltyClientRow = ({ client }) => (
  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-background/50 rounded-lg">
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
          <TooltipTrigger asChild><div className="flex items-center gap-2">
            <LoyaltyProgressBar score={client.loyalty_score} />
            <span className="font-bold text-sm">{client.loyalty_score.toFixed(0)}%</span>
          </div></TooltipTrigger>
          <TooltipContent>
            <p>Dias de compra: {client.effective_purchase_days}</p>
            <p>Total comprado: {client.total_kg_sold.toFixed(2)} Kg</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  </motion.div>
);

const LoyaltySellerAccordion = ({ seller }) => (
  <AccordionItem value={seller.name} className="border-b-0">
    <AccordionTrigger className="p-4 bg-muted/50 rounded-t-lg hover:no-underline data-[state=open]:rounded-b-none">
      <div className="flex items-center justify-between w-full gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <User className="h-5 w-5 text-primary" />
          <div className="flex-1 min-w-0"><p className="font-bold text-foreground truncate">{seller.name}</p><p className="text-xs text-muted-foreground">{seller.clients.length} cliente(s)</p></div>
        </div>
        <div className="w-40 flex-shrink-0"><div className="flex items-center gap-2"><LoyaltyProgressBar score={seller.loyalty_score} /><span className="font-bold text-sm">{seller.loyalty_score.toFixed(0)}%</span></div></div>
        <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />
      </div>
    </AccordionTrigger>
    <AccordionContent className="p-4 bg-muted/20 rounded-b-lg"><div className="space-y-2">{seller.clients.map((client, index) => <LoyaltyClientRow key={`${client.client_code}-${index}`} client={client} />)}</div></AccordionContent>
  </AccordionItem>
);

const LoyaltySupervisorAccordion = ({ supervisor }) => (
  <AccordionItem value={supervisor.name} className="border-b border-border/50 bg-card rounded-lg mb-3 shadow-sm hover:shadow-md transition-shadow duration-300">
    <AccordionTrigger className="p-4 text-left hover:no-underline">
      <div className="flex items-center justify-between w-full gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Users className="h-6 w-6 text-primary" />
          <div className="flex-1 min-w-0"><p className="font-bold text-lg text-foreground truncate">{supervisor.name}</p><p className="text-sm text-muted-foreground">{supervisor.sellers.length} vendedor(es)</p></div>
        </div>
        <div className="w-48 flex-shrink-0 hidden sm:block"><div className="flex items-center gap-2"><LoyaltyProgressBar score={supervisor.loyalty_score} /><span className="font-bold text-base">{supervisor.loyalty_score.toFixed(0)}%</span></div></div>
        <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />
      </div>
    </AccordionTrigger>
    <AccordionContent className="border-t border-border/50 px-4 pt-4 pb-2"><Accordion type="multiple" className="space-y-2">{supervisor.sellers.map((seller, index) => <LoyaltySellerAccordion key={`${seller.name}-${index}`} seller={seller} />)}</Accordion></AccordionContent>
  </AccordionItem>
);

// --- Componentes para a Aba de Desempenho ---
const PerformanceDrilldown = ({ items, level = 0 }) => {
  const hierarchy = [{ icon: Building2, label: 'Supervisor' }, { icon: User, label: 'Vendedor' }, { icon: Store, label: 'Cliente' }];
  const currentLevel = hierarchy[level];

  if (!items || items.length === 0) {
    if (level === 0) return <div className="text-center py-16"><TrendingUp className="mx-auto h-12 w-12 text-emerald-500" /><h3 className="mt-4 text-lg font-semibold text-foreground">Parabéns!</h3><p className="mt-1 text-muted-foreground">Nenhum cliente com baixo desempenho encontrado.</p></div>;
    return null;
  }
  
  return (
    <Accordion type="multiple" className="w-full">
      {items.map((item, index) => (
        <AccordionItem value={`item-${level}-${index}`} key={index}>
          <AccordionTrigger className="hover:no-underline p-2 rounded-lg hover:bg-muted transition-colors">
            <div className="flex justify-between items-center w-full"><div className="flex items-center gap-3 truncate"><currentLevel.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" /><span className="font-semibold text-sm text-foreground text-left truncate">{item.name}</span></div>{item.children && <Badge variant="destructive" className="font-bold ml-2">{item.children.length} {level === 1 ? 'clientes' : 'vendedores'}</Badge>}</div>
          </AccordionTrigger>
          <AccordionContent className="p-0 pl-6">
            {item.children ? <div className="border-l-2 border-dashed border-border/50 pl-4"><PerformanceDrilldown items={item.children} level={level + 1} /></div> : <div className="p-3 my-2 bg-background rounded-md border text-sm text-foreground"><div className="grid grid-cols-2 gap-2"><p className="font-semibold">Receita no Mês:</p><p className="font-bold text-destructive">{formatCurrency(item.total_revenue)}</p><p className="font-semibold">Última Compra:</p><p className="font-bold">{formatDate(item.last_purchase_date)}</p></div></div>}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};


// --- Página Unificada ---
const AnaliseDesempenhoFidelidade = () => {
  const { filters } = useFilters();
  const [activeTab, setActiveTab] = useState("desempenho");

  const dateRange = filters.dateRange || { from: startOfMonth(new Date()), to: endOfMonth(new Date()) };
  const startDateStr = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const endDateStr = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : format(endOfMonth(new Date()), 'yyyy-MM-dd');

  const commonParams = useMemo(() => {
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

  const { data: performanceData, loading: loadingPerformance } = useAnalyticalData(
    'get_low_performance_clients', commonParams, { enabled: activeTab === 'desempenho' && !!startDateStr && !!endDateStr, defaultValue: null }
  );

  const { data: loyaltyData, loading: loadingLoyalty } = useAnalyticalData(
    'get_loyalty_analysis_drilldown', commonParams, { enabled: activeTab === 'fidelidade' && !!startDateStr && !!endDateStr, defaultValue: { kpis: {}, supervisors: [] } }
  );

  const kpisPerformance = performanceData?.kpis || {};
  const drilldownData = performanceData?.data || [];
  const { kpis: kpisLoyalty, supervisors: supervisorsLoyalty } = loyaltyData || { kpis: {}, supervisors: [] };

  return (
    <>
      <Helmet>
        <title>Análise de Desempenho e Fidelidade - Costa Lavos</title>
        <meta name="description" content="Análise unificada de desempenho e fidelidade dos clientes." />
      </Helmet>

      <motion.div className="space-y-6 p-4 sm:p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tighter flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-primary" />
            Análise de Desempenho e Fidelidade
          </h1>
          <p className="text-muted-foreground mt-1">Monitore o desempenho de vendas e a lealdade dos seus clientes.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="desempenho">Desempenho</TabsTrigger>
            <TabsTrigger value="fidelidade">Fidelidade</TabsTrigger>
          </TabsList>

          <TabsContent value="desempenho" className="mt-6 space-y-6">
            {loadingPerformance ? (
              <div className="flex items-center justify-center h-96"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <MetricCard title="Clientes em Risco" value={String(kpisPerformance.totalClientsInRisk || 0)} icon={AlertTriangle} />
                  <MetricCard title="Receita Potencial Perdida" value={formatCurrency(kpisPerformance.potentialLostRevenue)} icon={DollarSign} subtitle="Valor para atingir a meta mensal" />
                </div>
                <Card>
                  <CardHeader><CardTitle>Clientes por Estrutura Comercial</CardTitle></CardHeader>
                  <CardContent><PerformanceDrilldown items={drilldownData} /></CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="fidelidade" className="mt-6 space-y-6">
            {loadingLoyalty ? (
              <div className="flex items-center justify-center h-96"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
            ) : (
              <TooltipProvider>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard title="Pontuação Média" value={`${(kpisLoyalty?.average_loyalty_score || 0).toFixed(1)}%`} icon={Percent} subtitle="Média de fidelidade geral" />
                  <MetricCard title="Clientes Acima da Meta" value={kpisLoyalty?.clients_above_target || 0} icon={TrendingUp} subtitle="Performando como esperado" />
                  <MetricCard title="Clientes Abaixo da Meta" value={kpisLoyalty?.clients_below_target || 0} icon={TrendingDown} subtitle="Oportunidades de melhoria" />
                  <MetricCard title="Total com Meta Definida" value={kpisLoyalty?.total_clients_with_target || 0} icon={Target} subtitle="Clientes com meta de compra" />
                </div>
                <Card>
                  <CardHeader><CardTitle>Desempenho de Fidelidade por Equipe</CardTitle></CardHeader>
                  <CardContent className="p-4">
                    {supervisorsLoyalty && supervisorsLoyalty.length > 0 ? (
                      <Accordion type="multiple" className="space-y-0">{supervisorsLoyalty.map((supervisor, index) => <LoyaltySupervisorAccordion key={`${supervisor.name}-${index}`} supervisor={supervisor} />)}</Accordion>
                    ) : (
                      <div className="flex items-center justify-center h-64 bg-muted/50 rounded-lg"><p className="text-muted-foreground">Nenhum dado de fidelidade encontrado.</p></div>
                    )}
                  </CardContent>
                </Card>
              </TooltipProvider>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </>
  );
};

export default AnaliseDesempenhoFidelidade;
