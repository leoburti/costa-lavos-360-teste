import React, { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { LoadingState, ErrorState } from '@/components/common';
import { RelatoriLayout } from '../components/RelatoriLayout';
import { RelatoriTable } from '../components/RelatoriTable';
import { RelatoriChart } from '../components/RelatoriChart';
import { RelatoriKpis } from '../components/RelatoriKpis';

export default function RelatoriDesempenhoSupervisor() {
  const { filters } = useFilters();
  const { toast } = useToast();

  const startDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date();
  const endDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date();

  const params = useMemo(() => ({
    p_start_date: startDate.toISOString().split('T')[0],
    p_end_date: endDate.toISOString().split('T')[0],
  }), [startDate, endDate]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_relatorio_desempenho_supervisor',
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
    const avgTeamSize = data.reduce((sum, d) => sum + (d.team_size || 0), 0) / data.length;
    
    return [
      { label: 'Total de Vendas', value: `R$ ${totalSales.toLocaleString('pt-BR')}`, change: 14.3 },
      { label: 'Total de Supervisores', value: data.length, change: 2.1 },
      { label: 'Tamanho Médio de Equipe', value: avgTeamSize.toFixed(0), change: 1.5 },
      { label: 'Melhor Supervisor', value: data[0]?.supervisor_name || '-', change: 19.2 },
    ];
  }, [data]);

  const columns = [
    { key: 'supervisor_name', label: 'Supervisor' },
    { key: 'total_sales', label: 'Vendas', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
    { key: 'team_size', label: 'Tamanho da Equipe', align: 'right' },
    { key: 'average_seller_performance', label: 'Desempenho Médio', format: (v) => `${Number(v).toFixed(1)}%`, align: 'right' },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <RelatoriLayout 
      title="Relatório de Desempenho de Supervisor"
      onRefresh={retry}
      loading={loading}
    >
      <div className="space-y-6">
        <RelatoriKpis kpis={kpis} />
        <RelatoriChart type="bar" data={data} dataKey="total_sales" xAxisKey="supervisor_name" />
        <RelatoriTable columns={columns} data={data} loading={loading} />
      </div>
    </RelatoriLayout>
  );
}