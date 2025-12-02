import React, { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { LoadingState, ErrorState } from '@/components/common';
import { RelatoriLayout } from '../components/RelatoriLayout';
import { RelatoriTable } from '../components/RelatoriTable';
import { RelatoriChart } from '../components/RelatoriChart';
import { RelatoriKpis } from '../components/RelatoriKpis';

export default function RelatoriDesempenhoEvolucao() {
  const { filters } = useFilters();
  const { toast } = useToast();

  const startDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date();
  const endDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date();

  const params = useMemo(() => ({
    p_start_date: startDate.toISOString().split('T')[0],
    p_end_date: endDate.toISOString().split('T')[0],
  }), [startDate, endDate]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_relatorio_desempenho_evolucao',
    params,
    {
      onError: (err) => {
        toast({
          title: 'Erro ao carregar relatório',
          description: err.message,
          variant: 'destructive',
        });
      },
    }
  );

  const kpis = useMemo(() => {
    if (!data || data.length === 0) return [];
    const firstPeriod = data[0]?.performance_score || 0;
    const lastPeriod = data[data.length - 1]?.performance_score || 0;
    const growth = lastPeriod - firstPeriod;
    
    return [
      { label: 'Desempenho Inicial', value: `${Number(firstPeriod).toFixed(1)}%`, change: 0 },
      { label: 'Desempenho Final', value: `${Number(lastPeriod).toFixed(1)}%`, change: growth },
      { label: 'Crescimento', value: `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`, change: growth },
      { label: 'Períodos Analisados', value: data.length, change: 0 },
    ];
  }, [data]);

  const columns = [
    { key: 'period', label: 'Período' },
    { key: 'performance_score', label: 'Desempenho', format: (v) => `${Number(v).toFixed(1)}%`, align: 'right' },
    { key: 'total_sales', label: 'Vendas', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
    { key: 'growth_rate', label: 'Crescimento', format: (v) => `${Number(v).toFixed(1)}%`, align: 'right' },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <RelatoriLayout 
      title="Relatório de Desempenho Evolução"
      onRefresh={retry}
      loading={loading}
    >
      <div className="space-y-6">
        <RelatoriKpis kpis={kpis} />
        <RelatoriChart type="line" data={data} dataKey="performance_score" xAxisKey="period" />
        <RelatoriTable columns={columns} data={data} loading={loading} />
      </div>
    </RelatoriLayout>
  );
}