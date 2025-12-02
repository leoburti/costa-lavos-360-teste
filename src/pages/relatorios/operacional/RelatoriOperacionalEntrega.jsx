import React, { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { LoadingState, ErrorState } from '@/components/common';
import { RelatoriLayout } from '../components/RelatoriLayout';
import { RelatoriTable } from '../components/RelatoriTable';
import { RelatoriChart } from '../components/RelatoriChart';
import { RelatoriKpis } from '../components/RelatoriKpis';

export default function RelatoriOperacionalEntrega() {
  const { filters } = useFilters();
  const { toast } = useToast();

  const startDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date();
  const endDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date();

  const params = useMemo(() => ({
    p_start_date: startDate.toISOString().split('T')[0],
    p_end_date: endDate.toISOString().split('T')[0],
  }), [startDate, endDate]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_relatorio_operacional_entrega',
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
    const totalEntregas = data.reduce((sum, d) => sum + (d.total_deliveries || 0), 0);
    const entregasNoTempo = data.filter(d => d.on_time).length;
    const entregasAtrasadas = totalEntregas - entregasNoTempo;
    const taxaNoTempo = totalEntregas > 0 ? (entregasNoTempo / (totalEntregas || 1)) * 100 : 0;
    
    return [
      { label: 'Total de Entregas', value: totalEntregas, change: 5.1 },
      { label: 'No Tempo', value: entregasNoTempo, change: 7.2 },
      { label: 'Atrasadas', value: entregasAtrasadas, change: -1.3 },
      { label: 'Taxa de Pontualidade', value: `${taxaNoTempo.toFixed(1)}%`, change: 2.5 },
    ];
  }, [data]);

  const columns = [
    { key: 'delivery_id', label: 'Entrega' },
    { key: 'client_name', label: 'Cliente' },
    { key: 'delivery_date', label: 'Data Entrega', align: 'right' },
    { key: 'expected_date', label: 'Data Prevista', align: 'right' },
    { key: 'status', label: 'Status', align: 'center' },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <RelatoriLayout 
      title="Relatório Operacional de Entrega"
      onRefresh={retry}
      loading={loading}
    >
      <div className="space-y-6">
        <RelatoriKpis kpis={kpis} />
        <RelatoriChart type="bar" data={data} dataKey="total_deliveries" xAxisKey="status" />
        <RelatoriTable columns={columns} data={data} loading={loading} />
      </div>
    </RelatoriLayout>
  );
}