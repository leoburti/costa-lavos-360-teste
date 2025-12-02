import React, { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { LoadingState, ErrorState } from '@/components/common';
import { RelatoriLayout } from '../components/RelatoriLayout';
import { RelatoriTable } from '../components/RelatoriTable';
import { RelatoriChart } from '../components/RelatoriChart';
import { RelatoriKpis } from '../components/RelatoriKpis';

export default function RelatoriClienteSegmentacao() {
  const { filters } = useFilters();
  const { toast } = useToast();

  const startDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date();
  const endDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date();

  const params = useMemo(() => ({
    p_start_date: startDate.toISOString().split('T')[0],
    p_end_date: endDate.toISOString().split('T')[0],
  }), [startDate, endDate]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_relatorio_cliente_segmentacao',
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
    const totalClientes = data.reduce((sum, d) => sum + (d.client_count || 0), 0);
    const totalVendas = data.reduce((sum, d) => sum + (d.total_sales || 0), 0);
    const avgVendas = totalVendas / (totalClientes || 1);
    
    return [
      { label: 'Total de Clientes', value: totalClientes, change: 4.3 },
      { label: 'Segmentos', value: data.length, change: 0 },
      { label: 'Total de Vendas', value: `R$ ${totalVendas.toLocaleString('pt-BR')}`, change: 7.2 },
      { label: 'Venda Média', value: `R$ ${avgVendas.toLocaleString('pt-BR')}`, change: 3.1 },
    ];
  }, [data]);

  const columns = [
    { key: 'segment_name', label: 'Segmento' },
    { key: 'client_count', label: 'Clientes', align: 'right' },
    { key: 'total_sales', label: 'Vendas', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
    { key: 'average_order_value', label: 'Ticket Médio', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <RelatoriLayout 
      title="Relatório de Segmentação de Clientes"
      onRefresh={retry}
      loading={loading}
    >
      <div className="space-y-6">
        <RelatoriKpis kpis={kpis} />
        <RelatoriChart type="pie" data={data} dataKey="client_count" xAxisKey="segment_name" />
        <RelatoriTable columns={columns} data={data} loading={loading} />
      </div>
    </RelatoriLayout>
  );
}