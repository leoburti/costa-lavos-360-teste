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

export default function RelatoriOperacionalSla() {
  const { filters } = useFilters();
  const { toast } = useToast();

  const startDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date();
  const endDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date();

  const params = useMemo(() => ({
    p_start_date: startDate.toISOString().split('T')[0],
    p_end_date: endDate.toISOString().split('T')[0],
  }), [startDate, endDate]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_relatorio_operacional_sla',
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
    const avgSLA = data.reduce((sum, d) => sum + (d.sla_compliance || 0), 0) / data.length;
    const cumpridas = data.filter(d => d.sla_compliance >= 95).length;
    
    return [
      { label: 'Cumprimento Médio SLA', value: `${avgSLA.toFixed(1)}%`, change: avgSLA > 95 ? 2.1 : -1.5 },
      { label: 'SLAs Cumpridas', value: cumpridas, change: 3.2 },
      { label: 'SLAs Não Cumpridas', value: data.length - cumpridas, change: -0.8 },
      { label: 'Serviços Monitorados', value: data.length, change: 0 },
    ];
  }, [data]);

  const columns = [
    { key: 'service_name', label: 'Serviço' },
    { key: 'sla_target', label: 'Meta SLA', format: (v) => `${Number(v).toFixed(0)}%`, align: 'right' },
    { key: 'sla_compliance', label: 'Cumprimento', format: (v) => `${Number(v).toFixed(1)}%`, align: 'right' },
    { key: 'status', label: 'Status', align: 'center' },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <RelatoriLayout 
      title="Relatório Operacional de SLA"
      onRefresh={retry}
      loading={loading}
    >
      <div className="space-y-6">
        <RelatoriKpis kpis={kpis} />
        
        {/* SLA Progress */}
        <div className="space-y-4">
          {data?.slice(0, 5).map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-sm">{item.service_name}</span>
                <span className="text-sm font-bold">{Number(item.sla_compliance).toFixed(1)}%</span>
              </div>
              <Progress value={Number(item.sla_compliance)} />
            </div>
          ))}
        </div>

        <RelatoriChart type="bar" data={data} dataKey="sla_compliance" xAxisKey="service_name" />
        <RelatoriTable columns={columns} data={data} loading={loading} />
      </div>
    </RelatoriLayout>
  );
}