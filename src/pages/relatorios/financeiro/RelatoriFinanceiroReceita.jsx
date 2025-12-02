
import React, { useMemo } from 'react';
import AnalyticsTemplate from '@/components/analytics/AnalyticsTemplate';
import ChartContainer from '@/components/analytics/ChartContainer';
import { AnalyticsTable } from '@/components/analytics/AnalyticsWidgets'; 
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { useFilters } from '@/contexts/FilterContext';
import { formatDateForAPI, formatCurrency } from '@/lib/utils';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function RelatoriFinanceiroReceita() {
  const { filters } = useFilters();
  
  // Memoize options to avoid infinite loop in useAnalyticsData
  const options = useMemo(() => ({ fallbackOnError: true }), []);

  const { data, isLoading, refetch } = useAnalyticsData(
    'get_relatorio_financeiro_receita',
    {
      p_start_date: formatDateForAPI(filters.dateRange?.[0]),
      p_end_date: formatDateForAPI(filters.dateRange?.[1])
    },
    options
  );

  return (
    <AnalyticsTemplate
      title="Relatório Financeiro de Receita"
      description="Análise detalhada de entradas e projeções."
      onRefresh={refetch}
      breadcrumbs={[{label: 'Analytics', path: '/'}, {label: 'Financeiro'}]}
    >
      <ChartContainer title="Curva de Receita" loading={isLoading}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data || []}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="period" />
            <YAxis tickFormatter={(v) => `R$${v/1000}k`} />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Area type="monotone" dataKey="total_revenue" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>

      <AnalyticsTable 
        title="Detalhamento por Período"
        loading={isLoading}
        data={data || []}
        columns={[
          { label: 'Período', key: 'period' },
          { label: 'Receita Total', key: 'total_revenue', render: (row) => formatCurrency(row.total_revenue), className: 'text-right' },
          { label: 'Crescimento', key: 'revenue_growth', render: (row) => `${row.revenue_growth}%`, className: 'text-right' },
          { label: 'Projeção', key: 'revenue_forecast', render: (row) => formatCurrency(row.revenue_forecast), className: 'text-right text-muted-foreground' }
        ]}
      />
    </AnalyticsTemplate>
  );
}
