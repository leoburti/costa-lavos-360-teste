import React, { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { LoadingState, ErrorState } from '@/components/common';
import { RelatoriLayout } from '../components/RelatoriLayout';
import { RelatoriTable } from '../components/RelatoriTable';
import { RelatoriChart } from '../components/RelatoriChart';
import { RelatoriKpis } from '../components/RelatoriKpis';

export default function RelatoriVendasComparativo() {
  const { filters } = useFilters();
  const { toast } = useToast();

  const startDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date();
  const endDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date();

  const params = useMemo(() => ({
    p_start_date: startDate.toISOString().split('T')[0],
    p_end_date: endDate.toISOString().split('T')[0],
  }), [startDate, endDate]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_relatorio_vendas_comparativo',
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
    const currentPeriod = data[0]?.current_period || 0;
    const previousPeriod = data[0]?.previous_period || 0;
    const growth = previousPeriod > 0 ? ((currentPeriod - previousPeriod) / previousPeriod) * 100 : 0;
    
    return [
      { label: 'Período Atual', value: `R$ ${Number(currentPeriod).toLocaleString('pt-BR')}`, change: growth },
      { label: 'Período Anterior', value: `R$ ${Number(previousPeriod).toLocaleString('pt-BR')}`, change: 0 },
      { label: 'Crescimento', value: `${growth.toFixed(1)}%`, change: growth },
      { label: 'Diferença', value: `R$ ${(currentPeriod - previousPeriod).toLocaleString('pt-BR')}`, change: growth },
    ];
  }, [data]);

  const columns = [
    { key: 'period', label: 'Período' },
    { key: 'current_period', label: 'Período Atual', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
    { key: 'previous_period', label: 'Período Anterior', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
    { key: 'growth_rate', label: 'Crescimento', format: (v) => `${Number(v).toFixed(2)}%`, align: 'right' },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <RelatoriLayout 
      title="Relatório de Vendas Comparativo"
      onRefresh={retry}
      loading={loading}
    >
      <div className="space-y-6">
        <RelatoriKpis kpis={kpis} />
        <RelatoriChart type="line" data={data} dataKey="current_period" xAxisKey="period" />
        <RelatoriTable columns={columns} data={data} loading={loading} />
      </div>
    </RelatoriLayout>
  );
}