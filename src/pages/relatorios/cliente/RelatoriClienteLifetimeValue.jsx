import React, { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { LoadingState, ErrorState } from '@/components/common';
import { RelatoriLayout } from '../components/RelatoriLayout';
import { RelatoriTable } from '../components/RelatoriTable';
import { RelatoriChart } from '../components/RelatoriChart';
import { RelatoriKpis } from '../components/RelatoriKpis';

export default function RelatoriClienteLifetimeValue() {
  const { filters } = useFilters();
  const { toast } = useToast();

  const startDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date();
  const endDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date();

  const params = useMemo(() => ({
    p_start_date: startDate.toISOString().split('T')[0],
    p_end_date: endDate.toISOString().split('T')[0],
  }), [startDate, endDate]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_relatorio_cliente_lifetime_value',
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
    const totalLTV = data.reduce((sum, d) => sum + (d.lifetime_value || 0), 0);
    const avgLTV = totalLTV / (data.length || 1);
    const maxLTV = Math.max(...data.map(d => d.lifetime_value || 0));
    
    return [
      { label: 'LTV Total', value: `R$ ${totalLTV.toLocaleString('pt-BR')}`, change: 9.5 },
      { label: 'LTV Médio', value: `R$ ${avgLTV.toLocaleString('pt-BR')}`, change: 4.2 },
      { label: 'LTV Máximo', value: `R$ ${maxLTV.toLocaleString('pt-BR')}`, change: 12.3 },
      { label: 'Clientes Analisados', value: data.length, change: 0 },
    ];
  }, [data]);

  const columns = [
    { key: 'client_name', label: 'Cliente' },
    { key: 'lifetime_value', label: 'LTV', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
    { key: 'total_purchases', label: 'Total de Compras', align: 'right' },
    { key: 'average_purchase_value', label: 'Compra Média', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
    { key: 'customer_since', label: 'Cliente Desde', align: 'right' },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <RelatoriLayout 
      title="Relatório de Lifetime Value de Clientes"
      onRefresh={retry}
      loading={loading}
    >
      <div className="space-y-6">
        <RelatoriKpis kpis={kpis} />
        <RelatoriChart type="bar" data={data} dataKey="lifetime_value" xAxisKey="client_name" />
        <RelatoriTable columns={columns} data={data} loading={loading} />
      </div>
    </RelatoriLayout>
  );
}