import React, { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { LoadingState, ErrorState } from '@/components/common';
import { RelatoriLayout } from '../components/RelatoriLayout';
import { RelatoriTable } from '../components/RelatoriTable';
import { RelatoriChart } from '../components/RelatoriChart';
import { RelatoriKpis } from '../components/RelatoriKpis';

export default function RelatoriFinanceiroCustos() {
  const { filters } = useFilters();
  const { toast } = useToast();

  const startDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date();
  const endDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date();

  const params = useMemo(() => ({
    p_start_date: startDate.toISOString().split('T')[0],
    p_end_date: endDate.toISOString().split('T')[0],
  }), [startDate, endDate]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_relatorio_financeiro_custos',
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
    const totalCustos = data.reduce((sum, d) => sum + (d.total_cost || 0), 0);
    const avgCusto = totalCustos / data.length;
    const maxCusto = Math.max(...data.map(d => d.total_cost || 0));
    
    return [
      { label: 'Custo Total', value: `R$ ${totalCustos.toLocaleString('pt-BR')}`, change: -3.2 },
      { label: 'Custo Médio', value: `R$ ${avgCusto.toLocaleString('pt-BR')}`, change: -1.5 },
      { label: 'Custo Máximo', value: `R$ ${maxCusto.toLocaleString('pt-BR')}`, change: 2.1 },
      { label: 'Categorias', value: data.length, change: 0 },
    ];
  }, [data]);

  const columns = [
    { key: 'cost_category', label: 'Categoria' },
    { key: 'total_cost', label: 'Custo Total', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
    { key: 'cost_percentage', label: '% do Total', format: (v) => `${Number(v).toFixed(2)}%`, align: 'right' },
    { key: 'cost_trend', label: 'Tendência', format: (v) => `${v > 0 ? '+' : ''}${Number(v).toFixed(1)}%`, align: 'right' },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <RelatoriLayout 
      title="Relatório Financeiro de Custos"
      onRefresh={retry}
      loading={loading}
    >
      <div className="space-y-6">
        <RelatoriKpis kpis={kpis} />
        <RelatoriChart type="pie" data={data} dataKey="total_cost" xAxisKey="cost_category" />
        <RelatoriTable columns={columns} data={data} loading={loading} />
      </div>
    </RelatoriLayout>
  );
}