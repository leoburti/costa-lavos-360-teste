import React, { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { LoadingState, ErrorState } from '@/components/common';
import { RelatoriLayout } from '../components/RelatoriLayout';
import { RelatoriTable } from '../components/RelatoriTable';
import { RelatoriChart } from '../components/RelatoriChart';
import { RelatoriKpis } from '../components/RelatoriKpis';
import { Progress } from '@/components/ui/progress';

export default function RelatoriDesempenhoMeta() {
  const { filters } = useFilters();
  const { toast } = useToast();

  const startDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date();
  const endDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date();

  const params = useMemo(() => ({
    p_start_date: startDate.toISOString().split('T')[0],
    p_end_date: endDate.toISOString().split('T')[0],
  }), [startDate, endDate]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_relatorio_desempenho_meta',
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
    const totalMeta = data.reduce((sum, d) => sum + (d.target || 0), 0);
    const totalAchieved = data.reduce((sum, d) => sum + (d.achieved || 0), 0);
    const achievementRate = totalMeta > 0 ? (totalAchieved / totalMeta) * 100 : 0;
    
    return [
      { label: 'Meta Total', value: `R$ ${totalMeta.toLocaleString('pt-BR')}`, change: 0 },
      { label: 'Realizado', value: `R$ ${totalAchieved.toLocaleString('pt-BR')}`, change: 8.5 },
      { label: 'Taxa de Realização', value: `${achievementRate.toFixed(1)}%`, change: achievementRate > 100 ? 5 : -5 },
      { label: 'Faltando', value: `R$ ${Math.max(0, totalMeta - totalAchieved).toLocaleString('pt-BR')}`, change: -3.2 },
    ];
  }, [data]);

  const columns = [
    { key: 'seller_name', label: 'Vendedor' },
    { key: 'target', label: 'Meta', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
    { key: 'achieved', label: 'Realizado', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
    { key: 'achievement_rate', label: 'Taxa', format: (v) => `${Number(v).toFixed(1)}%`, align: 'right' },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <RelatoriLayout 
      title="Relatório de Desempenho de Meta"
      onRefresh={retry}
      loading={loading}
    >
      <div className="space-y-6">
        <RelatoriKpis kpis={kpis} />
        <RelatoriChart type="bar" data={data} dataKey="achievement_rate" xAxisKey="seller_name" />
        <div className="grid grid-cols-1 gap-4">
          {data?.map((item, idx) => (
            <div key={idx} className="space-y-2 p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">{item.seller_name}</span>
                <span className="text-sm font-bold text-slate-600">{Number(item.achievement_rate).toFixed(1)}%</span>
              </div>
              <Progress value={Math.min(item.achievement_rate, 100)} className="h-2" />
              <div className="flex justify-between text-xs text-slate-500">
                <span>Realizado: R$ {Number(item.achieved).toLocaleString('pt-BR')}</span>
                <span>Meta: R$ {Number(item.target).toLocaleString('pt-BR')}</span>
              </div>
            </div>
          ))}
        </div>
        <RelatoriTable columns={columns} data={data} loading={loading} />
      </div>
    </RelatoriLayout>
  );
}