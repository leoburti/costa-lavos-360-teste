
import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import LoadingSpinner from '@/components/LoadingSpinner';
import MetricCard from '@/components/MetricCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Award, Star, Diamond, TrendingDown, Users, TrendingUp } from 'lucide-react';
import AIInsight from '@/components/AIInsight';

const formatCurrency = (value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const segmentConfig = {
  'Campeões': { icon: Award, color: 'bg-yellow-400 text-yellow-900', description: 'Compram muito, com frequência e recentemente.' },
  'Clientes Fiéis': { icon: Star, color: 'bg-blue-400 text-blue-900', description: 'Compram com frequência, valorizam a marca.' },
  'Potenciais Fiéis': { icon: Diamond, color: 'bg-green-400 text-green-900', description: 'Compradores recentes com bom potencial.' },
  'Novos Clientes': { icon: Users, color: 'bg-sky-400 text-sky-900', description: 'Recém-chegados, precisam de atenção.' },
  'Em Risco': { icon: TrendingDown, color: 'bg-orange-400 text-orange-900', description: 'Não compram há algum tempo, risco de churn.' },
  'Hibernando': { icon: TrendingDown, color: 'bg-red-500 text-red-900', description: 'Não compram há muito tempo, quase perdidos.' },
  'Precisam de Atenção': { icon: TrendingDown, color: 'bg-purple-400 text-purple-900', description: 'Baixa frequência, precisam de estímulo.' },
  'Promissores': { icon: TrendingUp, color: 'bg-indigo-400 text-indigo-900', description: 'Compraram recentemente, mas precisam de mais frequência.' },
};

const CalculoRFM = ({ isTab = false }) => {
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

  const { data, loading, error } = useAnalyticalData('get_rfm_analysis', params, { enabled: !!params.p_start_date && !!params.p_end_date });

  const segments = useMemo(() => {
    if (!data) return {};
    const segmentedData = {};
    data.forEach(client => {
      if (!segmentedData[client.segment]) {
        segmentedData[client.segment] = [];
      }
      segmentedData[client.segment].push(client);
    });
    return segmentedData;
  }, [data]);

  const sortedSegments = Object.entries(segments).sort(([, a], [, b]) => b.length - a.length);
  
  const pageContent = (
    <div className="space-y-6">
      {!isTab && (
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cálculo RFM</h1>
          <p className="text-muted-foreground">Segmente seus clientes por Recência, Frequência e Valor Monetário.</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner message="Calculando segmentos RFM..." />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">Erro ao carregar dados: {error.message}</div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedSegments.slice(0, 4).map(([segmentName, clients]) => {
              const config = segmentConfig[segmentName] || { icon: Users, description: '' };
              return (
                <MetricCard 
                  key={segmentName}
                  title={segmentName}
                  value={clients.length.toString()}
                  icon={config.icon}
                  subtitle={config.description}
                />
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Segmentos de Clientes (RFM)</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Segmento</TableHead>
                      <TableHead className="text-right">Valor (R$)</TableHead>
                      <TableHead className="text-right">Recência (dias)</TableHead>
                      <TableHead className="text-right">Frequência</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((client, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{client.clientName}</TableCell>
                        <TableCell>
                          <Badge className={segmentConfig[client.segment]?.color}>
                            {client.segment}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(client.monetary)}</TableCell>
                        <TableCell className="text-right">{client.recency}</TableCell>
                        <TableCell className="text-right">{client.frequency}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
          
          <AIInsight 
            context="Análise RFM"
            data={data}
            question="Com base na segmentação RFM, quais são as 3 principais estratégias para engajar os diferentes segmentos de clientes?"
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
        <title>Cálculo RFM - Costa Lavos</title>
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

export default CalculoRFM;
