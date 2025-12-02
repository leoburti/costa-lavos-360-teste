import React, { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { LoadingState, ErrorState } from '@/components/common';
import { RelatoriLayout } from '../components/RelatoriLayout';
import { RelatoriTable } from '../components/RelatoriTable';
import { RelatoriChart } from '../components/RelatoriChart';
import { RelatoriKpis } from '../components/RelatoriKpis';

export default function RelatoriOperacionalDevolucoes() {
  const { filters } = useFilters();
  const { toast } = useToast();

  const startDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date();
  const endDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date();

  const params = useMemo(() => ({
    p_start_date: startDate.toISOString().split('T')[0],
    p_end_date: endDate.toISOString().split('T')[0],
  }), [startDate, endDate]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_relatorio_operacional_devolucoes',
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
    const totalDevolucoes = data.reduce((sum, d) => sum + (d.return_count || 0), 0);
    const totalValor = data.reduce((sum, d) => sum + (d.return_value || 0), 0);
    const taxaDevolucao = data.length > 0 ? (totalDevolucoes / (data.length || 1)) * 100 : 0;
    
    return [
      { label: 'Total de Devoluções', value: totalDevolucoes, change: -1.2 },
      { label: 'Valor Devolvido', value: `R$ ${totalValor.toLocaleString('pt-BR')}`, change: -0.8 },
      { label: 'Taxa de Devolução', value: `${taxaDevolucao.toFixed(1)}%`, change: -0.5 },
      { label: 'Produtos Analisados', value: data.length, change: 0 },
    ];
  }, [data]);

  const columns = [
    { key: 'product_name', label: 'Produto' },
    { key: 'return_count', label: 'Devoluções', align: 'right' },
    { key: 'return_value', label: 'Valor', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
    { key: 'return_reason', label: 'Motivo' },
    { key: 'return_rate', label: 'Taxa', format: (v) => `${Number(v).toFixed(1)}%`, align: 'right' },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <RelatoriLayout 
      title="Relatório Operacional de Devoluções"
      onRefresh={retry}
      loading={loading}
    >
      <div className="space-y-6">
        <RelatoriKpis kpis={kpis} />
        <RelatoriChart type="pie" data={data} dataKey="return_count" xAxisKey="product_name" />
        <RelatoriTable columns={columns} data={data} loading={loading} />
      </div>
    </RelatoriLayout>
  );
}