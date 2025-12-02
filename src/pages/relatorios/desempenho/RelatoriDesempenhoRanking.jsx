import React, { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { LoadingState, ErrorState } from '@/components/common';
import { RelatoriLayout } from '../components/RelatoriLayout';
import { RelatoriTable } from '../components/RelatoriTable';
import { RelatoriChart } from '../components/RelatoriChart';
import { RelatoriKpis } from '../components/RelatoriKpis';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Medal } from 'lucide-react';
import { extractValue, safeNumber } from '@/utils/dataValidator';

export default function RelatoriDesempenhoRanking() {
  const { filters } = useFilters();
  const { toast } = useToast();

  const startDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date();
  const endDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date();

  const params = useMemo(() => ({
    p_start_date: startDate.toISOString().split('T')[0],
    p_end_date: endDate.toISOString().split('T')[0],
  }), [startDate, endDate]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_relatorio_desempenho_ranking',
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
    
    // Ensure we extract simple values for the KPIs to avoid object errors
    return [
      { label: '1º Lugar', value: extractValue(data[0]?.seller_name) || '-', change: 0 },
      { label: '2º Lugar', value: extractValue(data[1]?.seller_name) || '-', change: 0 },
      { label: '3º Lugar', value: extractValue(data[2]?.seller_name) || '-', change: 0 },
      { label: 'Total de Vendedores', value: data.length, change: 0 },
    ];
  }, [data]);

  const columns = [
    { key: 'ranking', label: 'Posição', align: 'center' },
    { key: 'seller_name', label: 'Vendedor' },
    { 
      key: 'total_sales', 
      label: 'Vendas', 
      format: (v) => `R$ ${safeNumber(v).toLocaleString('pt-BR')}`, 
      align: 'right' 
    },
    { 
      key: 'performance_score', 
      label: 'Desempenho', 
      format: (v) => `${safeNumber(v).toFixed(1)}%`, 
      align: 'right' 
    },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <RelatoriLayout 
      title="Relatório de Desempenho Ranking"
      onRefresh={retry}
      loading={loading}
    >
      <div className="space-y-6">
        <RelatoriKpis kpis={kpis} />
        
        {/* Top 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data?.slice(0, 3).map((item, idx) => (
            <Card key={idx} className={idx === 0 ? 'border-yellow-400 border-2' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">#{idx + 1}</p>
                    <p className="text-lg font-bold truncate max-w-[180px]" title={extractValue(item.seller_name)}>
                      {extractValue(item.seller_name)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      R$ {safeNumber(item.total_sales).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    {idx === 0 && <Trophy className="h-8 w-8 text-yellow-500" />}
                    {idx === 1 && <Medal className="h-8 w-8 text-slate-400" />}
                    {idx === 2 && <Medal className="h-8 w-8 text-orange-600" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <RelatoriChart type="bar" data={data} dataKey="total_sales" xAxisKey="seller_name" />
        <RelatoriTable columns={columns} data={data} loading={loading} />
      </div>
    </RelatoriLayout>
  );
}