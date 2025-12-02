import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { formatCurrency, formatDateForAPI } from '@/lib/utils';

// Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState, ErrorState, EmptyState } from '@/components/common';
import FilterBar from '@/components/FilterBar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AnaliticoProdutoPage() {
  const { filters } = useFilters();

  // ===== CONSTRUIR PARÂMETROS =====
  const params = useMemo(() => ({
    // CORREÇÃO: Usar formatDateForAPI para evitar problemas de UTC/Timezone
    p_start_date: formatDateForAPI(filters.dateRange[0]),
    p_end_date: formatDateForAPI(filters.dateRange[1]),
    p_exclude_employees: filters.excludeEmployees || false,
    p_supervisors: filters.supervisors?.map(id => String(id)) || null,
    p_sellers: filters.sellers?.map(id => String(id)) || null,
    p_customer_groups: filters.customerGroups?.map(id => String(id)) || null,
    p_regions: filters.regions?.map(id => String(id)) || null,
    p_clients: filters.clients?.map(id => String(id)) || null,
    p_search_term: filters.searchTerm || null,
  }), [filters]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_product_basket_analysis_v2',
    params,
    {
      enabled: !!params.p_start_date && !!params.p_end_date,
      transformData: (rawData) => (rawData || []).map(item => ({
        name: item.product_name,
        sales: Number(item.total_sales),
        quantity: Number(item.total_quantity),
        orders: Number(item.total_orders)
      }))
    }
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Analítico por Produto | Costa Lavos</title>
      </Helmet>

      <FilterBar />

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analítico por Produto</h1>
          <p className="text-muted-foreground">Desempenho de vendas por produto.</p>
        </div>

        {loading ? (
          <LoadingState message="Analisando dados dos produtos..." />
        ) : error ? (
          <ErrorState error={error} onRetry={retry} />
        ) : !data || data.length === 0 ? (
          <EmptyState description="Nenhuma venda encontrada para os produtos no período selecionado." />
        ) : (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Top 20 Produtos por Faturamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.slice(0, 20)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" tickFormatter={(val) => `R$${val/1000}k`} />
                    <YAxis dataKey="name" type="category" width={150} fontSize={12} />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'sales' ? formatCurrency(value) : value,
                        name === 'sales' ? 'Vendas' : 'Quantidade'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="sales" name="Vendas" fill="#8884d8" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-10">
                <h3 className="text-lg font-semibold mb-4 text-slate-800">Detalhamento por Produto</h3>
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold">Produto</th>
                        <th className="px-6 py-3 text-right font-semibold">Vendas Totais</th>
                        <th className="px-6 py-3 text-right font-semibold">Quantidade</th>
                        <th className="px-6 py-3 text-right font-semibold">Pedidos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {data.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-3 font-medium text-slate-900">{item.name}</td>
                          <td className="px-6 py-3 text-right font-mono text-slate-700">{formatCurrency(item.sales)}</td>
                          <td className="px-6 py-3 text-right font-mono text-slate-600">{item.quantity.toLocaleString()}</td>
                          <td className="px-6 py-3 text-right font-mono text-slate-600">{item.orders.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}