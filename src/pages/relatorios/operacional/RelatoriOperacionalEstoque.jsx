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
import { AlertTriangle } from 'lucide-react';

export default function RelatoriOperacionalEstoque() {
  const { filters } = useFilters();
  const { toast } = useToast();

  const startDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date();
  const endDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date();

  const params = useMemo(() => ({
    p_start_date: startDate.toISOString().split('T')[0],
    p_end_date: endDate.toISOString().split('T')[0],
  }), [startDate, endDate]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_relatorio_operacional_estoque',
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
    const totalItens = data.reduce((sum, d) => sum + (d.quantity || 0), 0);
    const totalValor = data.reduce((sum, d) => sum + (d.stock_value || 0), 0);
    const baixoEstoque = data.filter(d => d.quantity < d.min_quantity).length;
    
    return [
      { label: 'Total de Itens', value: totalItens, change: 2.1 },
      { label: 'Valor Total', value: `R$ ${totalValor.toLocaleString('pt-BR')}`, change: 4.3 },
      { label: 'Produtos Baixo Estoque', value: baixoEstoque, change: -1.5 },
      { label: 'SKUs Monitorados', value: data.length, change: 0 },
    ];
  }, [data]);

  const columns = [
    { key: 'product_name', label: 'Produto' },
    { key: 'quantity', label: 'Quantidade', align: 'right' },
    { key: 'min_quantity', label: 'Mínimo', align: 'right' },
    { key: 'stock_value', label: 'Valor', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
    { key: 'status', label: 'Status', align: 'center' },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <RelatoriLayout 
      title="Relatório Operacional de Estoque"
      onRefresh={retry}
      loading={loading}
    >
      <div className="space-y-6">
        <RelatoriKpis kpis={kpis} />
        
        {/* Alerta de Estoque Baixo */}
        {data?.filter(d => d.quantity < d.min_quantity).length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-yellow-700 text-lg">
                <AlertTriangle className="h-5 w-5" />
                Produtos com Estoque Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-yellow-600">
                {data?.filter(d => d.quantity < d.min_quantity).length} produtos estão abaixo do nível mínimo.
                Recomenda-se reposição imediata.
              </p>
            </CardContent>
          </Card>
        )}

        <RelatoriChart type="bar" data={data} dataKey="quantity" xAxisKey="product_name" />
        <RelatoriTable columns={columns} data={data} loading={loading} />
      </div>
    </RelatoriLayout>
  );
}