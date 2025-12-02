
import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { formatDateForAPI, formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ErrorState, LoadingState, EmptyState } from '@/components/common';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tag } from 'lucide-react';

export default function AnaliseTicketMedio() {
  const { filters } = useFilters();

  const params = useMemo(() => ({
    p_start_date: formatDateForAPI(filters.dateRange.from),
    p_end_date: formatDateForAPI(filters.dateRange.to),
    p_exclude_employees: filters.excludeEmployees,
    p_supervisors: filters.supervisors?.length > 0 ? filters.supervisors : null,
    p_sellers: filters.sellers?.length > 0 ? filters.sellers : null,
    p_customer_groups: filters.customerGroups?.length > 0 ? filters.customerGroups : null,
    p_regions: filters.regions?.length > 0 ? filters.regions : null,
    p_clients: filters.clients?.length > 0 ? filters.clients : null,
    p_search_term: filters.searchTerm || null,
  }), [filters]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_unit_value_analysis_data',
    params,
    { enabled: !!params.p_start_date }
  );

  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <Helmet>
        <title>Análise de Valor Unitário | Costa Lavos</title>
      </Helmet>

      <div className="flex flex-col gap-2 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Tag className="h-8 w-8 text-primary" />
          Análise de Valor Unitário
        </h1>
        <p className="text-slate-500">
          Detalhamento do preço médio praticado por produto e variações.
        </p>
      </div>

      {loading ? (
        <LoadingState message="Calculando valores unitários..." />
      ) : !data || data.length === 0 ? (
        <EmptyState description="Nenhum dado encontrado para os filtros aplicados." />
      ) : (
        <Card>
            <CardHeader>
                <CardTitle>Detalhamento por Produto</CardTitle>
                <CardDescription>Comparativo de preço médio e crescimento</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Produto</TableHead>
                            <TableHead className="text-right">Qtd Vendida</TableHead>
                            <TableHead className="text-right">Receita Total</TableHead>
                            <TableHead className="text-right">Preço Médio</TableHead>
                            <TableHead className="text-right">Variação %</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item, idx) => (
                            <TableRow key={idx}>
                                <TableCell className="font-medium">{item.product_name}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                                <TableCell className="text-right font-bold">{formatCurrency(item.avg_price)}</TableCell>
                                <TableCell className={`text-right ${item.price_growth > 0 ? 'text-green-600' : item.price_growth < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                                    {item.price_growth > 0 ? '+' : ''}{Number(item.price_growth).toFixed(1)}%
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
