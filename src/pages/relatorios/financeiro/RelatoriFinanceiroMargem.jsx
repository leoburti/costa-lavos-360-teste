import React, { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { LoadingState, ErrorState } from '@/components/common';
import { RelatoriLayout } from '../components/RelatoriLayout';
import { RelatoriTable } from '../components/RelatoriTable';
import { RelatoriChart } from '../components/RelatoriChart';
import { RelatoriKpis } from '../components/RelatoriKpis';

export default function RelatoriFinanceiroMargem() {
  const { filters } = useFilters();
  const { toast } = useToast();

  const startDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date();
  const endDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date();

  const params = useMemo(() => ({
    p_start_date: startDate.toISOString().split('T')[0],
    p_end_date: endDate.toISOString().split('T')[0],
  }), [startDate, endDate]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_relatorio_financeiro_margem',
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
    const avgMargem = data.reduce((sum, d) => sum + (d.margin_percentage || 0), 0) / data.length;
    const maxMargem = Math.max(...data.map(d => d.margin_percentage || 0));
    const minMargem = Math.min(...data.map(d => d.margin_percentage || 0));
    
    return [
      { label: 'Margem Média', value: `${avgMargem.toFixed(1)}%`, change: 2.3 },
      { label: 'Margem Máxima', value: `${maxMargem.toFixed(1)}%`, change: 5.1 },
      { label: 'Margem Mínima', value: `${minMargem.toFixed(1)}%`, change: -1.2 },
      { label: 'Produtos Analisados', value: data.length, change: 0 },
    ];
  }, [data]);

  const columns = [
    { key: 'product_name', label: 'Produto' },
    { key: 'revenue', label: 'Receita', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
    { key: 'cost', label: 'Custo Estimado', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
    { key: 'margin_percentage', label: 'Margem', format: (v) => `${Number(v).toFixed(2)}%`, align: 'right' },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <RelatoriLayout 
      title="Relatório Financeiro de Margem"
      onRefresh={retry}
      loading={loading}
    >
      <div className="space-y-6">
        <RelatoriKpis kpis={kpis} />
        <RelatoriChart type="bar" data={data} dataKey="margin_percentage" xAxisKey="product_name" />
        <RelatoriTable columns={columns} data={data} loading={loading} />
      </div>
    </RelatoriLayout>
  );
}