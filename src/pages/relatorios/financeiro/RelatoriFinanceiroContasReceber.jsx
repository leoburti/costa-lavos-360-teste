import React, { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { LoadingState, ErrorState } from '@/components/common';
import { RelatoriLayout } from '../components/RelatoriLayout';
import { RelatoriTable } from '../components/RelatoriTable';
import { RelatoriChart } from '../components/RelatoriChart';
import { RelatoriKpis } from '../components/RelatoriKpis';

export default function RelatoriFinanceiroContasReceber() {
  const { filters } = useFilters();
  const { toast } = useToast();

  const startDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date();
  const endDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date();

  const params = useMemo(() => ({
    p_start_date: startDate.toISOString().split('T')[0],
    p_end_date: endDate.toISOString().split('T')[0],
  }), [startDate, endDate]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_relatorio_financeiro_contas_receber',
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
    const totalReceber = data.reduce((sum, d) => sum + (d.total_receivable || 0), 0);
    const totalRecebido = data.reduce((sum, d) => sum + (d.total_received || 0), 0);
    const totalAtrasado = data.reduce((sum, d) => sum + (d.overdue_amount || 0), 0);
    
    return [
      { label: 'Total a Receber', value: `R$ ${totalReceber.toLocaleString('pt-BR')}`, change: -2.1 },
      { label: 'Total Recebido', value: `R$ ${totalRecebido.toLocaleString('pt-BR')}`, change: 6.3 },
      { label: 'Total Atrasado', value: `R$ ${totalAtrasado.toLocaleString('pt-BR')}`, change: -1.5 },
      { label: 'Taxa de Recebimento', value: `${((totalRecebido / (totalReceber || 1)) * 100).toFixed(1)}%`, change: 3.2 },
    ];
  }, [data]);

  const columns = [
    { key: 'client_name', label: 'Cliente' },
    { key: 'total_receivable', label: 'A Receber', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
    { key: 'total_received', label: 'Recebido', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
    { key: 'overdue_amount', label: 'Atrasado', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <RelatoriLayout 
      title="Relatório Financeiro de Contas a Receber"
      onRefresh={retry}
      loading={loading}
    >
      <div className="space-y-6">
        <RelatoriKpis kpis={kpis} />
        <RelatoriChart type="bar" data={data} dataKey="total_receivable" xAxisKey="client_name" />
        <RelatoriTable columns={columns} data={data} loading={loading} />
      </div>
    </RelatoriLayout>
  );
}