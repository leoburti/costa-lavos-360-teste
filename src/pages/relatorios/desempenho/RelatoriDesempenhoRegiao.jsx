import React, { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { LoadingState, ErrorState } from '@/components/common';
import { RelatoriLayout } from '../components/RelatoriLayout';
import { RelatoriTable } from '../components/RelatoriTable';
import { RelatoriChart } from '../components/RelatoriChart';
import { RelatoriKpis } from '../components/RelatoriKpis';

export default function RelatoriDesempenhoRegiao() {
  const { filters } = useFilters();
  const { toast } = useToast();

  const startDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date();
  const endDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date();

  const params = useMemo(() => ({
    p_start_date: startDate.toISOString().split('T')[0],
    p_end_date: endDate.toISOString().split('T')[0],
  }), [startDate, endDate]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_relatorio_desempenho_regiao',
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
    const totalSales = data.reduce((sum, d) => sum + (d.total_sales || 0), 0);
    const avgPerformance = data.reduce((sum, d) => sum + (d.performance_score || 0), 0) / data.length;
    
    return [
      { label: 'Total de Vendas', value: `R$ ${totalSales.toLocaleString('pt-BR')}`, change: 10.8 },
      { label: 'Total de Regiões', value: data.length, change: 0 },
      { label: 'Desempenho Médio', value: `${avgPerformance.toFixed(1)}%`, change: 6.3 },
      { label: 'Melhor Região', value: data[0]?.region_name || '-', change: 15.4 },
    ];
  }, [data]);

  const columns = [
    { key: 'region_name', label: 'Região' },
    { key: 'total_sales', label: 'Vendas', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
    { key: 'total_orders', label: 'Pedidos', align: 'right' },
    { key: 'performance_score', label: 'Desempenho', format: (v) => `${Number(v).toFixed(1)}%`, align: 'right' },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <RelatoriLayout 
      title="Relatório de Desempenho de Região"
      onRefresh={retry}
      loading={loading}
    >
      <div className="space-y-6">
        <RelatoriKpis kpis={kpis} />
        <RelatoriChart type="bar" data={data} dataKey="performance_score" xAxisKey="region_name" />
        <RelatoriTable columns={columns} data={data} loading={loading} />
      </div>
    </RelatoriLayout>
  );
}