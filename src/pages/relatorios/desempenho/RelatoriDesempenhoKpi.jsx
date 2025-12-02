import React, { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { LoadingState, ErrorState } from '@/components/common';
import { RelatoriLayout } from '../components/RelatoriLayout';
import { RelatoriChart } from '../components/RelatoriChart';
import { RelatoriKpis } from '../components/RelatoriKpis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RelatoriDesempenhoKpi() {
  const { filters } = useFilters();
  const { toast } = useToast();

  const startDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date();
  const endDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date();

  const params = useMemo(() => ({
    p_start_date: startDate.toISOString().split('T')[0],
    p_end_date: endDate.toISOString().split('T')[0],
  }), [startDate, endDate]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_relatorio_desempenho_kpi',
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
    const row = data[0] || {};
    
    return [
      { label: 'Conversão', value: `${Number(row.conversion_rate || 0).toFixed(1)}%`, change: 2.5 },
      { label: 'Ticket Médio', value: `R$ ${Number(row.average_ticket || 0).toLocaleString('pt-BR')}`, change: 3.1 },
      { label: 'Retenção', value: `${Number(row.retention_rate || 0).toFixed(1)}%`, change: 1.8 },
      { label: 'Satisfação', value: `${Number(row.satisfaction_score || 0).toFixed(1)}/10`, change: 0.5 },
    ];
  }, [data]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <RelatoriLayout 
      title="Relatório de Desempenho KPI"
      onRefresh={retry}
      loading={loading}
    >
      <div className="space-y-6">
        <RelatoriKpis kpis={kpis} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Taxa de Conversão</CardTitle>
            </CardHeader>
            <CardContent>
               <RelatoriChart type="bar" data={data} dataKey="conversion_rate" xAxisKey="period" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Ticket Médio</CardTitle>
            </CardHeader>
            <CardContent>
               <RelatoriChart type="line" data={data} dataKey="average_ticket" xAxisKey="period" />
            </CardContent>
          </Card>
        </div>
      </div>
    </RelatoriLayout>
  );
}