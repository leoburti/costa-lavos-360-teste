import React, { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { LoadingState, ErrorState } from '@/components/common';
import { RelatoriLayout } from '../components/RelatoriLayout';
import { RelatoriTable } from '../components/RelatoriTable';
import { RelatoriChart } from '../components/RelatoriChart';
import { RelatoriKpis } from '../components/RelatoriKpis';

export default function RelatoriOperacionalPedidos() {
  const { filters } = useFilters();
  const { toast } = useToast();

  const startDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date();
  const endDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date();

  const params = useMemo(() => ({
    p_start_date: startDate.toISOString().split('T')[0],
    p_end_date: endDate.toISOString().split('T')[0],
  }), [startDate, endDate]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_relatorio_operacional_pedidos',
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
    const totalPedidos = data.reduce((sum, d) => sum + (d.total_orders || 0), 0);
    const pedidosPendentes = data.filter(d => d.status === 'Pendente').length;
    const pedidosEntregues = data.filter(d => d.status === 'Entregue').length;
    const taxaEntrega = totalPedidos > 0 ? (pedidosEntregues / (totalPedidos || 1)) * 100 : 0;
    
    return [
      { label: 'Total de Pedidos', value: totalPedidos, change: 6.2 },
      { label: 'Pedidos Pendentes', value: pedidosPendentes, change: -2.1 },
      { label: 'Pedidos Entregues', value: pedidosEntregues, change: 8.5 },
      { label: 'Taxa de Entrega', value: `${taxaEntrega.toFixed(1)}%`, change: 3.2 },
    ];
  }, [data]);

  const columns = [
    { key: 'order_id', label: 'Pedido' },
    { key: 'client_name', label: 'Cliente' },
    { key: 'total_orders', label: 'Quantidade', align: 'right' },
    { key: 'status', label: 'Status', align: 'center' },
    { key: 'order_date', label: 'Data', align: 'right' },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <RelatoriLayout 
      title="Relatório Operacional de Pedidos"
      onRefresh={retry}
      loading={loading}
    >
      <div className="space-y-6">
        <RelatoriKpis kpis={kpis} />
        <RelatoriChart type="bar" data={data} dataKey="total_orders" xAxisKey="status" />
        <RelatoriTable columns={columns} data={data} loading={loading} />
      </div>
    </RelatoriLayout>
  );
}