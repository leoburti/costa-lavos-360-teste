import React, { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { LoadingState, ErrorState } from '@/components/common';
import { RelatoriLayout } from '../components/RelatoriLayout';
import { RelatoriTable } from '../components/RelatoriTable';
import { RelatoriChart } from '../components/RelatoriChart';
import { RelatoriKpis } from '../components/RelatoriKpis';

export default function RelatoriFinanceiroFluxoCaixa() {
  const { filters } = useFilters();
  const { toast } = useToast();

  const startDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date();
  const endDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date();

  const params = useMemo(() => ({
    p_start_date: startDate.toISOString().split('T')[0],
    p_end_date: endDate.toISOString().split('T')[0],
  }), [startDate, endDate]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_relatorio_financeiro_fluxo_caixa',
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
    const totalEntrada = data.reduce((sum, d) => sum + (d.inflow || 0), 0);
    const totalSaida = data.reduce((sum, d) => sum + (d.outflow || 0), 0);
    const saldoLiquido = totalEntrada - totalSaida;
    
    return [
      { label: 'Total Entradas', value: `R$ ${totalEntrada.toLocaleString('pt-BR')}`, change: 5.2 },
      { label: 'Total Saídas', value: `R$ ${totalSaida.toLocaleString('pt-BR')}`, change: 3.1 },
      { label: 'Saldo Líquido', value: `R$ ${saldoLiquido.toLocaleString('pt-BR')}`, change: saldoLiquido > 0 ? 8.3 : -2.1 },
      { label: 'Períodos', value: data.length, change: 0 },
    ];
  }, [data]);

  const columns = [
    { key: 'period', label: 'Período' },
    { key: 'inflow', label: 'Entradas', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
    { key: 'outflow', label: 'Saídas', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
    { key: 'net_balance', label: 'Saldo Líquido', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <RelatoriLayout 
      title="Relatório Financeiro de Fluxo de Caixa"
      onRefresh={retry}
      loading={loading}
    >
      <div className="space-y-6">
        <RelatoriKpis kpis={kpis} />
        <RelatoriChart type="line" data={data} dataKey="net_balance" xAxisKey="period" />
        <RelatoriTable columns={columns} data={data} loading={loading} />
      </div>
    </RelatoriLayout>
  );
}