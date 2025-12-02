import React, { useMemo, useState } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { LoadingState, ErrorState } from '@/components/common';
import { RelatoriLayout } from '../components/RelatoriLayout';
import { RelatoriTable } from '../components/RelatoriTable';
import { RelatoriChart } from '../components/RelatoriChart';
import { RelatoriKpis } from '../components/RelatoriKpis';

export default function RelatoriVendasDiario() {
  const { filters } = useFilters();
  const { toast } = useToast();
  const [currentPage] = useState(1);

  const startDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date();
  const endDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date();

  const params = useMemo(() => ({
    p_start_date: startDate.toISOString().split('T')[0],
    p_end_date: endDate.toISOString().split('T')[0],
    p_page: currentPage,
    p_page_size: 50,
  }), [startDate, endDate, currentPage]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_relatorio_vendas_diario',
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
    const totalOrders = data.reduce((sum, d) => sum + (d.total_orders || 0), 0);
    const avgOrder = totalOrders > 0 ? totalSales / totalOrders : 0;
    
    return [
      { label: 'Total de Vendas', value: `R$ ${totalSales.toLocaleString('pt-BR')}`, change: 5.2 },
      { label: 'Total de Pedidos', value: totalOrders, change: 3.1 },
      { label: 'Ticket Médio', value: `R$ ${avgOrder.toLocaleString('pt-BR')}`, change: 2.0 },
      { label: 'Dias com Venda', value: data.length, change: 1.5 },
    ];
  }, [data]);

  const columns = [
    { key: 'sales_date', label: 'Data' },
    { key: 'total_sales', label: 'Vendas', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
    { key: 'total_orders', label: 'Pedidos', align: 'right' },
    { key: 'average_order_value', label: 'Ticket Médio', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <RelatoriLayout 
      title="Relatório de Vendas Diário"
      onRefresh={retry}
      loading={loading}
    >
      <div className="space-y-6">
        <RelatoriKpis kpis={kpis} />
        <RelatoriChart type="bar" data={data} dataKey="total_sales" xAxisKey="sales_date" />
        <RelatoriTable columns={columns} data={data} loading={loading} />
      </div>
    </RelatoriLayout>
  );
}