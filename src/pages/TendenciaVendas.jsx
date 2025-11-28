
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
import { TrendingUp, TrendingDown, ArrowRight, UserCheck, UserPlus, UserX } from 'lucide-react';
import AIInsight from '@/components/AIInsight';

const formatCurrency = (value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const reasonConfig = {
  'AUMENTO_EXPRESSIVO': { label: 'Aumento Expressivo', color: 'bg-emerald-500', icon: TrendingUp },
  'AUMENTO': { label: 'Aumento', color: 'bg-green-500', icon: TrendingUp },
  'ESTABILIDADE': { label: 'Estabilidade', color: 'bg-blue-500', icon: ArrowRight },
  'QUEDA_ACENTUADA': { label: 'Queda Acentuada', color: 'bg-orange-500', icon: TrendingDown },
  'RISCO_CHURN': { label: 'Risco de Churn', color: 'bg-red-600', icon: TrendingDown },
  'PROMISSOR': { label: 'Promissor', color: 'bg-sky-500', icon: UserPlus },
  'INDEFINIDO': { label: 'Indefinido', color: 'bg-gray-500', icon: UserX },
};

const TendenciaVendas = ({ isTab = false }) => {
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
      p_analysis_type: 'all_clients', // Default analysis type
    };
  }, [filters, dateRange]);

  const { data, loading, error } = useAnalyticalData('get_new_client_trends', params, { enabled: !!params.p_start_date && !!params.p_end_date, defaultValue: [] });

  const kpis = useMemo(() => {
    if (!data) return { growing: 0, stable: 0, declining: 0, totalChange: 0 };
    let growing = 0, stable = 0, declining = 0, totalChange = 0;
    data.forEach(item => {
      totalChange += item.trendChange;
      if (item.reason === 'AUMENTO_EXPRESSIVO' || item.reason === 'AUMENTO') growing++;
      else if (item.reason === 'ESTABILIDADE' || item.reason === 'PROMISSOR') stable++;
      else declining++;
    });
    return { growing, stable, declining, totalChange };
  }, [data]);

  const pageContent = (
    <div className="space-y-6">
      {!isTab && (
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tendência de Vendas por Cliente</h1>
          <p className="text-muted-foreground">Compare o desempenho de vendas entre dois períodos para identificar tendências.</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner message="Analisando tendências..." />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">Erro ao carregar dados: {error.message}</div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard title="Variação Total" value={formatCurrency(kpis.totalChange)} icon={kpis.totalChange > 0 ? TrendingUp : TrendingDown} subtitle="Soma das variações de receita" />
            <MetricCard title="Clientes em Crescimento" value={kpis.growing.toString()} icon={TrendingUp} subtitle="Receita aumentou no período" />
            <MetricCard title="Clientes Estáveis" value={kpis.stable.toString()} icon={ArrowRight} subtitle="Receita se manteve" />
            <MetricCard title="Clientes em Queda" value={kpis.declining.toString()} icon={TrendingDown} subtitle="Receita diminuiu no período" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Tendência por Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead>Tendência</TableHead>
                      <TableHead className="text-right">Variação (R$)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item, index) => {
                      const config = reasonConfig[item.reason] || reasonConfig['INDEFINIDO'];
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.clientName}</TableCell>
                          <TableCell>{item.seller}</TableCell>
                          <TableCell>
                            <Badge className={config.color}>
                              <config.icon className="h-3 w-3 mr-1" />
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-right font-semibold ${item.trendChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(item.trendChange)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          <AIInsight 
            context="Análise de Tendência de Vendas"
            data={data}
            question="Com base nos dados de tendência, quais são as 3 principais ações para clientes em queda e para potencializar clientes em crescimento?"
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
        <title>Tendência de Vendas - Costa Lavos</title>
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

export default TendenciaVendas;
