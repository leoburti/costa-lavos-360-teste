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
import { MessageSquare } from 'lucide-react';

export default function RelatoriOperacionalReclamacoes() {
  const { filters } = useFilters();
  const { toast } = useToast();

  const startDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date();
  const endDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date();

  const params = useMemo(() => ({
    p_start_date: startDate.toISOString().split('T')[0],
    p_end_date: endDate.toISOString().split('T')[0],
  }), [startDate, endDate]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_relatorio_operacional_reclamacoes',
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
    const totalReclamacoes = data.reduce((sum, d) => sum + (d.complaint_count || 0), 0);
    const resolvidas = data.filter(d => d.status === 'Resolvida').length;
    const pendentes = data.filter(d => d.status === 'Pendente').length;
    const taxaResolucao = totalReclamacoes > 0 ? (resolvidas / (totalReclamacoes || 1)) * 100 : 0;
    
    return [
      { label: 'Total de Reclamações', value: totalReclamacoes, change: -2.3 },
      { label: 'Resolvidas', value: resolvidas, change: 5.1 },
      { label: 'Pendentes', value: pendentes, change: -1.2 },
      { label: 'Taxa de Resolução', value: `${taxaResolucao.toFixed(1)}%`, change: 3.5 },
    ];
  }, [data]);

  const columns = [
    { key: 'complaint_id', label: 'Reclamação' },
    { key: 'client_name', label: 'Cliente' },
    { key: 'complaint_type', label: 'Tipo' },
    { key: 'status', label: 'Status', align: 'center' },
    { key: 'complaint_date', label: 'Data', align: 'right' },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <RelatoriLayout 
      title="Relatório Operacional de Reclamações"
      onRefresh={retry}
      loading={loading}
    >
      <div className="space-y-6">
        <RelatoriKpis kpis={kpis} />
        
        {/* Resumo de Reclamações */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Qualidade', 'Entrega', 'Atendimento'].map((tipo) => (
            <Card key={tipo}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <MessageSquare className="h-4 w-4" />
                  {tipo}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {data?.filter(d => d.complaint_type === tipo).length || 0}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <RelatoriChart type="bar" data={data} dataKey="complaint_count" xAxisKey="complaint_type" />
        <RelatoriTable columns={columns} data={data} loading={loading} />
      </div>
    </RelatoriLayout>
  );
}