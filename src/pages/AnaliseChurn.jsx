import React, { useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { TrendingDown, UserX, AlertTriangle, Target, Loader2, CheckCircle, ServerCrash } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import ChartCard from '@/components/ChartCard';
import AIInsight from '@/components/AIInsight';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useFilters } from '@/contexts/FilterContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from '@/lib/utils';
import { useAIInsight } from '@/hooks/useAIInsight';
import { useChurnData } from '@/hooks/useChurnData';
import { useChurnCalculations } from '@/hooks/useChurnCalculations';

const ChurnPhaseAccordion = ({ phase, title, data, count, value, valueLabel, color, icon: Icon }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-muted/50 rounded-lg p-4 text-center text-sm text-muted-foreground">
        Nenhum cliente na fase "{title}".
      </div>
    );
  }

  return (
    <AccordionItem value={phase} className="border-b-0">
      <AccordionTrigger className={cn("!no-underline hover:!no-underline rounded-lg p-4 flex w-full justify-between items-center transition-colors", color.bg, color.text)}>
        <div className="flex items-center gap-3">
          <Icon size={20} />
          <h3 className="font-semibold">{title} ({count} clientes)</h3>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg">{valueLabel}: {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          <p className="text-xs font-medium">Potencial Mensal</p>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 bg-card border border-t-0 rounded-b-lg">
          <div className="space-y-2">
            {data.map((client, index) => (
              <motion.div 
                key={`${client.client_code}-${index}`}
                className="flex justify-between items-center p-3 rounded bg-muted/50 text-sm"
                initial={{opacity: 0, y: 10}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: index * 0.05}}
              >
                <div>
                  <p className="font-semibold">{client.client_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Vendedor: {client.seller_name} | Dias s/ Compra: {client.days_since_last_purchase}
                  </p>
                </div>
                <p className="font-medium text-red-600">
                  - {client.monthly_revenue_loss.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </motion.div>
            ))}
          </div>
      </AccordionContent>
    </AccordionItem>
  );
};

const AnaliseChurn = () => {
  const { filters } = useFilters();
  const { data: churnData, loading, error } = useChurnData(filters);
  const { kpis, totalChurned, totalAtRisk, churnRate, totalPotentialLoss, pieData } = useChurnCalculations(churnData);
  
  const aiHookData = useMemo(() => {
    if (!churnData || !churnData.kpis) return null;
    return { kpis: churnData.kpis };
  }, [churnData]);

  const { insight, loading: loadingAI, generateInsights } = useAIInsight('churn_analysis', aiHookData);

  useEffect(() => {
    if(aiHookData) {
      generateInsights();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiHookData]);

  const phaseColors = {
    phase1: { bg: 'bg-green-100/50', text: 'text-green-800', icon: CheckCircle, pie: 'hsl(142.1, 76.2%, 36.3%)' },
    phase2: { bg: 'bg-yellow-100/50', text: 'text-yellow-800', icon: AlertTriangle, pie: 'hsl(47.9, 95.8%, 53.1%)' },
    phase3: { bg: 'bg-orange-100/50', text: 'text-orange-800', icon: AlertTriangle, pie: 'hsl(24.6, 95%, 53.1%)' },
    phase4: { bg: 'bg-red-100/50', text: 'text-red-800', icon: UserX, pie: 'hsl(0, 84.2%, 60.2%)' },
  };
  
  const chartPieData = useMemo(() => [
    { name: 'Ativos', value: kpis.phase1Count, color: phaseColors.phase1.pie },
    { name: 'Risco', value: kpis.phase2Count, color: phaseColors.phase2.pie },
    { name: 'Risco Elevado', value: kpis.phase3Count, color: phaseColors.phase3.pie },
    { name: 'Crítico (Churn)', value: kpis.phase4Count, color: phaseColors.phase4.pie }
  ], [kpis]);

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const totalClients = chartPieData.reduce((a, b) => a + b.value, 0) || 1;
      return (
        <div className="p-3 bg-background/80 border rounded-lg shadow-lg backdrop-blur-sm">
          <p className="font-bold text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} clientes ({((data.value / totalClients) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-semibold text-foreground">Calculando Análise de Churn...</p>
        <p className="text-muted-foreground">Isso pode levar um momento, estamos processando os dados.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center bg-destructive/10 p-8 rounded-lg">
        <ServerCrash className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-destructive mb-2">Ocorreu um Erro</h2>
        <p className="text-destructive/80 max-w-md">Não foi possível carregar os dados da Análise de Churn. Por favor, tente atualizar a página ou ajuste seus filtros.</p>
        <p className="text-xs text-muted-foreground mt-4 font-mono">{error}</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Análise de Churn - Costa Lavos</title>
        <meta name="description" content="Análise detalhada sobre o churn de clientes" />
      </Helmet>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Análise de Churn</h1>
          <p className="text-muted-foreground mt-1">Entendendo e combatendo a perda de clientes.</p>
        </div>
        
        <AIInsight insight={insight} loading={loadingAI} onRegenerate={generateInsights} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Taxa de Churn (Críticos)" value={`${churnRate.toFixed(1)}%`} icon={TrendingDown} />
          <MetricCard title="Clientes Críticos" value={String(totalChurned)} icon={UserX} />
          <MetricCard title="Clientes em Risco" value={String(totalAtRisk)} icon={AlertTriangle} />
          <MetricCard title="Perda Potencial (Risco+Crítico)" value={totalPotentialLoss.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })} icon={Target} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <ChartCard title="Distribuição de Clientes por Fase de Churn" className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={chartPieData} cx="50%" cy="50%" outerRadius={100} innerRadius={60} dataKey="value" nameKey="name" labelLine={false} label={({ name, percent }) => percent > 0.02 ? `${(percent * 100).toFixed(0)}%` : ''}>
                      {chartPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend iconType="circle" iconSize={10} wrapperStyle={{fontSize: '12px'}}/>
                  </PieChart>
                </ResponsiveContainer>
            </ChartCard>
            <div className="lg:col-span-3">
              <Accordion type="single" collapsible className="w-full space-y-3" defaultValue="phase4">
                <ChurnPhaseAccordion 
                  phase="phase1" 
                  title="Ativos (Até 30 dias)" 
                  data={churnData?.phase1} 
                  count={kpis.phase1Count} 
                  value={kpis.phase1Loss}
                  valueLabel="Faturamento"
                  color={phaseColors.phase1} 
                  icon={phaseColors.phase1.icon} 
                />
                <ChurnPhaseAccordion phase="phase2" title="Risco (31-60 dias)" data={churnData?.phase2} count={kpis.phase2Count} value={kpis.phase2Loss} valueLabel="Perda" color={phaseColors.phase2} icon={phaseColors.phase2.icon} />
                <ChurnPhaseAccordion phase="phase3" title="Risco Elevado (61-90 dias)" data={churnData?.phase3} count={kpis.phase3Count} value={kpis.phase3Loss} valueLabel="Perda" color={phaseColors.phase3} icon={phaseColors.phase3.icon} />
                <ChurnPhaseAccordion phase="phase4" title="Críticos (Churn, >90 dias)" data={churnData?.phase4} count={kpis.phase4Count} value={kpis.phase4Loss} valueLabel="Perda" color={phaseColors.phase4} icon={phaseColors.phase4.icon} />
              </Accordion>
            </div>
        </div>
      </div>
    </>
  );
};

export default AnaliseChurn;