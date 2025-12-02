
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
import { Calendar, DollarSign, ShoppingCart } from 'lucide-react';

export default function RelatoriClienteHistorico() {
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
    'get_relatorio_cliente_historico',
    params,
    options
  );

  const kpis = useMemo(() => {
    if (!data || data.length === 0) return [];
    const totalVendas = data.reduce((sum, d) => sum + (d.total_sales || 0), 0);
    const totalPedidos = data.reduce((sum, d) => sum + (d.total_orders || 0), 0);
    const avgVendas = totalVendas / (data.length || 1);
    
    return [
      { label: 'Total de Vendas', value: `R$ ${totalVendas.toLocaleString('pt-BR')}`, change: 6.3 },
      { label: 'Total de Pedidos', value: totalPedidos, change: 4.1 },
      { label: 'Venda Média', value: `R$ ${avgVendas.toLocaleString('pt-BR')}`, change: 2.2 },
      { label: 'Períodos', value: data.length, change: 0 },
    ];
  }, [data]);

  const columns = [
    { key: 'period', label: 'Período' },
    { key: 'total_sales', label: 'Vendas', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
    { key: 'total_orders', label: 'Pedidos', align: 'right' },
    { key: 'average_order_value', label: 'Ticket Médio', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`, align: 'right' },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <RelatoriLayout 
      title="Relatório de Histórico de Clientes"
      onRefresh={retry}
      loading={loading}
    >
      <div className="space-y-6">
        <RelatoriKpis kpis={kpis} />
        
        {/* Timeline de Atividades */}
        <div className="space-y-4">
          {data?.slice(0, 5).map((item, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {idx === 0 && <ShoppingCart className="h-6 w-6 text-blue-500" />}
                    {idx === 1 && <DollarSign className="h-6 w-6 text-green-500" />}
                    {idx === 2 && <Calendar className="h-6 w-6 text-purple-500" />}
                    {idx > 2 && <Calendar className="h-6 w-6 text-slate-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.period}</p>
                    <p className="text-sm text-gray-600">
                      {item.total_orders} pedidos • R$ {Number(item.total_sales).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <RelatoriChart type="line" data={data} dataKey="total_sales" xAxisKey="period" />
        <RelatoriTable columns={columns} data={data} loading={loading} />
      </div>
    </RelatoriLayout>
  );
}
