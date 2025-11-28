
import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Users, DollarSign, Activity, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import MetricCard from '@/components/MetricCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import AIInsight from '@/components/AIInsight';

const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';
const formatCurrency = (value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ChurnPhaseCard = ({ phase, data, loading, onClientSelect }) => {
  const phaseConfig = {
    phase1: { title: 'Ativos (Últimos 30 dias)', icon: Activity, color: 'text-emerald-500' },
    phase2: { title: 'Risco (31-60 dias)', icon: AlertTriangle, color: 'text-yellow-500' },
    phase3: { title: 'Risco Elevado (61-90 dias)', icon: TrendingDown, color: 'text-orange-500' },
    phase4: { title: 'Crítico (>90 dias)', icon: TrendingUp, color: 'text-red-500' },
  };

  const currentPhase = phaseConfig[phase];
  const count = data?.kpis?.[`${phase}Count`] || 0;
  const loss = data?.kpis?.[`${phase}Loss`] || 0;
  const clients = data?.[phase] || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <currentPhase.icon className={`h-5 w-5 ${currentPhase.color}`} />
          {currentPhase.title}
        </CardTitle>
        <Badge variant={count > 0 ? "destructive" : "secondary"}>{count}</Badge>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(loss)}</div>
        <p className="text-xs text-muted-foreground">Perda de receita mensal potencial</p>
        {clients.length > 0 && (
          <Accordion type="single" collapsible className="w-full mt-4">
            <AccordionItem value="clients">
              <AccordionTrigger>Ver Clientes</AccordionTrigger>
              <AccordionContent>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                  {clients.map((client, index) => (
                    <div key={index} className="text-sm p-2 rounded-md hover:bg-muted cursor-pointer" onClick={() => onClientSelect(client)}>
                      <p className="font-semibold">{client.client_name}</p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Última Compra: {formatDate(client.last_purchase_date)}</span>
                        <span className="font-bold">{formatCurrency(client.monthly_revenue_loss)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

const AnaliseChurn = ({ isTab = false }) => {
  const { filters } = useFilters();
  
  const dateRange = useMemo(() => filters.dateRange || { from: startOfMonth(new Date()), to: endOfMonth(new Date()) }, [filters.dateRange]);
  
  const params = useMemo(() => {
    const selectedClients = filters.clients ? filters.clients.map(c => c.value) : null;
    return {
      p_start_date: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null,
      p_end_date: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null,
      p_exclude_employees: filters.excludeEmployees,
      p_supervisors: filters.supervisors,
      p_sellers: filters.sellers,
      p_customer_groups: filters.customerGroups,
      p_regions: filters.regions,
      p_clients: selectedClients,
      p_search_term: filters.searchTerm,
    };
  }, [filters, dateRange]);

  const { data, loading, error } = useAnalyticalData('get_churn_analysis_data_v3', params, { enabled: !!params.p_start_date && !!params.p_end_date });

  const totalClientsInRisk = (data?.kpis?.phase2Count || 0) + (data?.kpis?.phase3Count || 0) + (data?.kpis?.phase4Count || 0);
  const totalPotentialLoss = (data?.kpis?.phase2Loss || 0) + (data?.kpis?.phase3Loss || 0) + (data?.kpis?.phase4Loss || 0);

  const handleClientSelect = (client) => {
    // This could open a dialog with more client details in the future
    console.log("Selected client:", client);
  };
  
  const pageContent = (
    <div className="space-y-6">
      {!isTab && (
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Análise de Churn</h1>
          <p className="text-muted-foreground">Identifique clientes em risco de inatividade e a perda potencial de receita.</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner message="Analisando dados de churn..." />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">Erro ao carregar dados: {error.message}</div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricCard 
              title="Total de Clientes em Risco"
              value={totalClientsInRisk.toString()}
              icon={Users}
              subtitle="Clientes que não compram há mais de 30 dias."
            />
            <MetricCard 
              title="Perda de Receita Potencial Total"
              value={formatCurrency(totalPotentialLoss)}
              icon={DollarSign}
              subtitle="Soma da receita mensal perdida com clientes em risco."
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            <ChurnPhaseCard phase="phase1" data={data} loading={loading} onClientSelect={handleClientSelect} />
            <ChurnPhaseCard phase="phase2" data={data} loading={loading} onClientSelect={handleClientSelect} />
            <ChurnPhaseCard phase="phase3" data={data} loading={loading} onClientSelect={handleClientSelect} />
            <ChurnPhaseCard phase="phase4" data={data} loading={loading} onClientSelect={handleClientSelect} />
          </div>
          
          <AIInsight 
            context="Análise de Churn"
            data={data}
            question="Com base nos dados de churn, quais são os 3 principais insights e ações recomendadas para reter clientes em risco?"
          />

        </>
      ) : (
        <div className="text-center py-12">Nenhum dado encontrado para os filtros selecionados.</div>
      )}
    </div>
  );

  if (isTab) {
    return pageContent;
  }

  return (
    <>
      <Helmet>
        <title>Análise de Churn - Costa Lavos</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 sm:p-6"
      >
        {pageContent}
      </motion.div>
    </>
  );
};

export default AnaliseChurn;
