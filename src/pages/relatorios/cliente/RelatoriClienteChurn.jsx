
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
import { AlertCircle } from 'lucide-react';

export default function RelatoriClienteChurn() {
  const { filters } = useFilters();
  const { toast } = useToast();

  const startDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date();
  const endDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date();

  const params = useMemo(() => ({
    p_start_date: startDate.toISOString().split('T')[0],
    p_end_date: endDate.toISOString().split('T')[0],
  }), [startDate, endDate]);

  const options = useMemo(() => ({
    onError: (err) => {
      toast({
        title: 'Erro ao carregar relatório',
        description: err.message,
        variant: 'destructive',
      });
    },
  }), [toast]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_relatorio_cliente_churn',
    params,
    options
  );

  const kpis = useMemo(() => {
    if (!data || data.length === 0) return [];
    const totalChurn = data.reduce((sum, d) => sum + (d.churn_count || 0), 0);
    const churnRate = data.length > 0 ? (totalChurn / data.length) * 100 : 0;
    const atRisk = data.filter(d => d.risk_level === 'high').length;
    
    return [
      { label: 'Taxa de Churn', value: `${churnRate.toFixed(1)}%`, change: -2.3 },
      { label: 'Clientes em Risco', value: atRisk, change: -1.5 },
      { label: 'Clientes Perdidos', value: totalChurn, change: -3.2 },
      { label: 'Período Analisado', value: data.length, change: 0 },
    ];
  }, [data]);

  const columns = [
    { key: 'client_name', label: 'Cliente' },
    { key: 'churn_probability', label: 'Probabilidade Churn', format: (v) => `${Number(v).toFixed(1)}%`, align: 'right' },
    { key: 'risk_level', label: 'Nível de Risco', align: 'center' },
    { key: 'last_purchase_days_ago', label: 'Dias sem Compra', align: 'right' },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <RelatoriLayout 
      title="Relatório de Churn de Clientes"
      onRefresh={retry}
      loading={loading}
    >
      <div className="space-y-6">
        <RelatoriKpis kpis={kpis} />
        
        {/* Alerta de Clientes em Risco */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 text-lg">
              <AlertCircle className="h-5 w-5" />
              Clientes em Risco Alto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">
              {data?.filter(d => d.risk_level === 'high').length} clientes têm alta probabilidade de churn.
              Recomenda-se ação imediata.
            </p>
          </CardContent>
        </Card>

        <RelatoriChart type="bar" data={data} dataKey="churn_probability" xAxisKey="client_name" />
        <RelatoriTable columns={columns} data={data} loading={loading} />
      </div>
    </RelatoriLayout>
  );
}
