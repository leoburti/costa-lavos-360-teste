import React, { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { LoadingState, ErrorState } from '@/components/common';
import { RelatoriLayout } from '../components/RelatoriLayout';
import { RelatoriTable } from '../components/RelatoriTable';
import { RelatoriChart } from '../components/RelatoriChart';
import { RelatoriKpis } from '../components/RelatoriKpis';

export default function RelatoriVendasPorVendedor() {
  const { filters } = useFilters();
  const { toast } = useToast();

  const startDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date();
  const endDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date();

  const params = useMemo(() => ({
    p_start_date: startDate.toISOString().split('T')[0],
    p_end_date: endDate.toISOString().split('T')[0],
  }), [startDate, endDate]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_relatorio_vendas_por_vendedor',
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
    const topSeller = data[0];
    
    return [
      { label: 'Total de Vendas', value: `R$ ${totalSales.toLocaleString('pt-BR')}`, change: 12.5 },
      { label: 'Total de Vendedores', value: data.length, change: 3.2 },
      { label: 'Melhor Vendedor', value: topSeller?.seller_name || '-', change: 18.7 },
      { label: 'Ticket Médio', value: `R$ ${(totalSales / data.length).toLocaleString('pt-BR')}`, change: 5.1 },
    ];
  }, [data]);

  const columns = [
    { key: 'seller_name', label: 'Vendedor' },
    { key: 'total_sales', label: 'Vendas', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
    { key: 'total_orders', label: 'Pedidos', align: 'right' },
    { key: 'average_order_value', label: 'Ticket Médio', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
    { key: 'ranking', label: 'Ranking', align: 'right' },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <RelatoriLayout 
      title="Relatório de Vendas por Vendedor"
      onRefresh={retry}
      loading={loading}
    >
      <div className="space-y-6">
        <RelatoriKpis kpis={kpis} />
        <RelatoriChart type="bar" data={data} dataKey="total_sales" xAxisKey="seller_name" />
        <RelatoriTable columns={columns} data={data} loading={loading} />
      </div>
    </RelatoriLayout>
  );
}