import React, { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { LoadingState, ErrorState } from '@/components/common';
import { RelatoriLayout } from '../components/RelatoriLayout';
import { RelatoriTable } from '../components/RelatoriTable';
import { RelatoriChart } from '../components/RelatoriChart';
import { RelatoriKpis } from '../components/RelatoriKpis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

export default function RelatoriClienteSatisfacao() {
  const { filters } = useFilters();
  const { toast } = useToast();

  const startDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date();
  const endDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date();

  const params = useMemo(() => ({
    p_start_date: startDate.toISOString().split('T')[0],
    p_end_date: endDate.toISOString().split('T')[0],
  }), [startDate, endDate]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_relatorio_cliente_satisfacao',
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
    const avgSatisfacao = data.reduce((sum, d) => sum + (d.satisfaction_score || 0), 0) / data.length;
    const npsScore = data.reduce((sum, d) => sum + (d.nps_score || 0), 0) / data.length;
    const satisfeitos = data.filter(d => d.satisfaction_score >= 4).length;
    
    return [
      { label: 'Satisfação Média', value: `${avgSatisfacao.toFixed(1)}/5`, change: 1.2 },
      { label: 'NPS Score', value: `${npsScore.toFixed(0)}`, change: 2.5 },
      { label: 'Clientes Satisfeitos', value: satisfeitos, change: 3.1 },
      { label: 'Respostas', value: data.length, change: 0 },
    ];
  }, [data]);

  const columns = [
    { key: 'client_name', label: 'Cliente' },
    { key: 'satisfaction_score', label: 'Satisfação', format: (v) => `${Number(v).toFixed(1)}/5`, align: 'center' },
    { key: 'nps_score', label: 'NPS', align: 'center' },
    { key: 'feedback', label: 'Feedback' },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <RelatoriLayout 
      title="Relatório de Satisfação de Clientes"
      onRefresh={retry}
      loading={loading}
    >
      <div className="space-y-6">
        <RelatoriKpis kpis={kpis} />
        
        {/* Distribuição de Satisfação */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[5, 4, 3, 2, 1].map((score) => {
            const count = data?.filter(d => Math.round(d.satisfaction_score) === score).length || 0;
            return (
              <Card key={score}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {score}
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">clientes</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <RelatoriChart type="bar" data={data} dataKey="satisfaction_score" xAxisKey="client_name" />
        <RelatoriTable columns={columns} data={data} loading={loading} />
      </div>
    </RelatoriLayout>
  );
}