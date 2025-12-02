import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { formatCurrency, formatDateForAPI } from '@/lib/utils';

// Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState, ErrorState, EmptyState } from '@/components/common';
import FilterBar from '@/components/FilterBar';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

export default function AnaliticoVendedorPage() {
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
    'get_seller_summary_v2',
    params,
    {
      enabled: !!params.p_start_date && !!params.p_end_date,
      transformData: (rawData) => (rawData || []).map(item => ({
        ...item,
        value: item.sales
      }))
    }
  );

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-md text-sm z-50">
          <p className="font-bold text-slate-800 mb-1">{d.name}</p>
          <p className="text-sm text-slate-600">Hierarquia: {d.parent}</p>
          <div className="space-y-1 mt-2">
            <p className="text-slate-600 flex justify-between gap-4">
              <span>Vendas:</span>
              <span className="font-mono font-medium">{formatCurrency(d.value)}</span>
            </p>
            <p className="text-slate-600 flex justify-between gap-4">
              <span>Participação:</span>
              <span className="font-mono font-medium">{Number(d.percentage).toFixed(1)}%</span>
            </p>
            <p className="text-slate-600 flex justify-between gap-4">
              <span>Pedidos:</span>
              <span className="font-mono font-medium">{d.total_orders}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomizedContent = (props) => {
    const { x, y, width, height, name, value } = props;
    if (width < 80 || height < 50) return null;
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} style={{ fill: '#22c55e', stroke: '#fff', strokeWidth: 2, opacity: 0.9 }} />
        <text x={x + width / 2} y={y + height / 2 - 12} textAnchor="middle" fill="#fff" fontSize={14} fontWeight="bold" style={{ pointerEvents: 'none' }}>{name}</text>
        <text x={x + width / 2} y={y + height / 2 + 8} textAnchor="middle" fill="#fff" fontSize={12} style={{ pointerEvents: 'none' }}>{formatCurrency(value)}</text>
      </g>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Analítico por Vendedor | Costa Lavos</title>
      </Helmet>

      <FilterBar />

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analítico por Vendedor</h1>
          <p className="text-muted-foreground">Desempenho de vendas por vendedor e sua hierarquia.</p>
        </div>

        {loading ? (
          <LoadingState message="Calculando desempenho dos vendedores..." />
        ) : error ? (
          <ErrorState error={error} onRetry={retry} />
        ) : !data || data.length === 0 ? (
          <EmptyState description="Nenhuma venda encontrada para os vendedores no período selecionado." />
        ) : (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Faturamento por Vendedor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    data={data}
                    dataKey="value"
                    stroke="#fff"
                    fill="#22c55e"
                    content={<CustomizedContent />}
                    aspectRatio={4/3}
                  >
                    <Tooltip content={<CustomTooltip />} />
                  </Treemap>
                </ResponsiveContainer>
              </div>

              <div className="mt-10">
                <h3 className="text-lg font-semibold mb-4 text-slate-800">Detalhamento</h3>
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold">Vendedor</th>
                        <th className="px-6 py-3 text-left font-semibold">Supervisor</th>
                        <th className="px-6 py-3 text-right font-semibold">Vendas Totais</th>
                        <th className="px-6 py-3 text-right font-semibold">Representatividade</th>
                        <th className="px-6 py-3 text-right font-semibold">Pedidos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {data.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-3 font-medium text-slate-900">{item.name}</td>
                          <td className="px-6 py-3 text-slate-600">{item.parent}</td>
                          <td className="px-6 py-3 text-right font-mono text-slate-700">{formatCurrency(item.value)}</td>
                          <td className="px-6 py-3 text-right font-mono text-slate-600">{Number(item.percentage).toFixed(1)}%</td>
                          <td className="px-6 py-3 text-right font-mono text-slate-600">{item.total_orders}</td>
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