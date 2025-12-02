import React, { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { LoadingState, ErrorState } from '@/components/common';
import { RelatoriLayout } from '../components/RelatoriLayout';
import { RelatoriTable } from '../components/RelatoriTable';
import { RelatoriChart } from '../components/RelatoriChart';
import { RelatoriKpis } from '../components/RelatoriKpis';

export default function RelatoriClienteCarteira() {
  const { filters } = useFilters();
  const { toast } = useToast();

  const startDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date();
  const endDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date();

  const params = useMemo(() => ({
    p_start_date: startDate.toISOString().split('T')[0],
    p_end_date: endDate.toISOString().split('T')[0],
  }), [startDate, endDate]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_relatorio_cliente_carteira',
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
    const totalClientes = data.length;
    const totalVendas = data.reduce((sum, d) => sum + (d.total_sales || 0), 0);
    const clienteAtivo = data.filter(d => d.is_active).length;
    const avgVendas = totalVendas / (totalClientes || 1);
    
    return [
      { label: 'Total de Clientes', value: totalClientes, change: 5.2 },
      { label: 'Clientes Ativos', value: clienteAtivo, change: 3.1 },
      { label: 'Total de Vendas', value: `R$ ${totalVendas.toLocaleString('pt-BR')}`, change: 8.7 },
      { label: 'Venda Média', value: `R$ ${avgVendas.toLocaleString('pt-BR')}`, change: 2.5 },
    ];
  }, [data]);

  const columns = [
    { key: 'client_name', label: 'Cliente' },
    { key: 'total_sales', label: 'Vendas', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
    { key: 'total_orders', label: 'Pedidos', align: 'right' },
    { key: 'status', label: 'Status', align: 'center' },
    { key: 'last_purchase', label: 'Última Compra', align: 'right' },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <RelatoriLayout 
      title="Relatório de Carteira de Clientes"
      onRefresh={retry}
      loading={loading}
    >
      <div className="space-y-6">
        <RelatoriKpis kpis={kpis} />
        <RelatoriChart type="bar" data={data} dataKey="total_sales" xAxisKey="client_name" />
        <RelatoriTable columns={columns} data={data} loading={loading} />
      </div>
    </RelatoriLayout>
  );
}