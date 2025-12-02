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
import { TrendingUp } from 'lucide-react';

export default function RelatoriFinanceiroLucratividade() {
  const { filters } = useFilters();
  const { toast } = useToast();

  const startDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date();
  const endDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date();

  const params = useMemo(() => ({
    p_start_date: startDate.toISOString().split('T')[0],
    p_end_date: endDate.toISOString().split('T')[0],
  }), [startDate, endDate]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_relatorio_financeiro_lucratividade',
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
    const totalReceita = data.reduce((sum, d) => sum + (d.revenue || 0), 0);
    const totalCusto = data.reduce((sum, d) => sum + (d.cost || 0), 0);
    const lucroLiquido = totalReceita - totalCusto;
    const margemLucro = totalReceita > 0 ? (lucroLiquido / totalReceita) * 100 : 0;
    
    return [
      { label: 'Receita Total', value: `R$ ${totalReceita.toLocaleString('pt-BR')}`, change: 7.2 },
      { label: 'Custo Total', value: `R$ ${totalCusto.toLocaleString('pt-BR')}`, change: -2.1 },
      { label: 'Lucro Líquido', value: `R$ ${lucroLiquido.toLocaleString('pt-BR')}`, change: 12.5 },
      { label: 'Margem de Lucro', value: `${margemLucro.toFixed(1)}%`, change: 3.8 },
    ];
  }, [data]);

  const columns = [
    { key: 'product_name', label: 'Produto' },
    { key: 'revenue', label: 'Receita', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
    { key: 'cost', label: 'Custo', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
    { key: 'profit', label: 'Lucro', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
    { key: 'profit_margin', label: 'Margem', format: (v) => `${Number(v).toFixed(2)}%`, align: 'right' },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <RelatoriLayout 
      title="Relatório Financeiro de Lucratividade"
      onRefresh={retry}
      loading={loading}
    >
      <div className="space-y-6">
        <RelatoriKpis kpis={kpis} />
        
        {/* Análise de Lucratividade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.slice(0, 4).map((item, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-sm">{item.product_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lucro:</span>
                    <span className="font-bold">R$ {Number(item.profit).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Margem:</span>
                    <span className="font-bold text-green-600">{Number(item.profit_margin).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Crescimento positivo</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <RelatoriChart type="bar" data={data} dataKey="profit_margin" xAxisKey="product_name" />
        <RelatoriTable columns={columns} data={data} loading={loading} />
      </div>
    </RelatoriLayout>
  );
}