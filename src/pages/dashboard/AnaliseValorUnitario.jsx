import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { formatDateForAPI, formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FilterBar from '@/components/FilterBar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AnaliseValorUnitario() {
  const { filters } = useFilters();
  const params = useMemo(() => ({
    p_start_date: formatDateForAPI(filters.dateRange?.[0]),
    p_end_date: formatDateForAPI(filters.dateRange?.[1]),
    p_exclude_employees: filters.excludeEmployees,
    p_search_term: filters.searchTerm,
  }), [filters]);

  const { data, loading } = useAnalyticalData('get_price_analysis', params, { enabled: !!params.p_start_date });

  if (loading) return <div className="p-8 text-center">Calculando variações de preço...</div>;

  // data.priceVariationByEntity comes from the RPC
  const variations = data?.priceVariationByEntity || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <Helmet><title>Análise de Preço | Costa Lavos</title></Helmet>
      <FilterBar />

      <Card>
        <CardHeader><CardTitle>Variação de Preço por Supervisor/Vendedor</CardTitle></CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Supervisor</TableHead>
                        <TableHead>Vendedor</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Produto Exemplo</TableHead>
                        <TableHead className="text-right">Preço Médio</TableHead>
                        <TableHead className="text-right">Mínimo</TableHead>
                        <TableHead className="text-right">Máximo</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {variations.slice(0, 50).map((sup, i) => (
                        // Flattening logic for display
                        sup.sellers.map((sel, j) => (
                            sel.clients.map((cli, k) => (
                                // Showing 1st product per client for brevity in this overview
                                <TableRow key={`${i}-${j}-${k}`}>
                                    <TableCell>{sup.name}</TableCell>
                                    <TableCell>{sel.name}</TableCell>
                                    <TableCell>{cli.name}</TableCell>
                                    <TableCell>{cli.products[0]?.product}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(cli.products[0]?.avgPrice)}</TableCell>
                                    <TableCell className="text-right text-green-600">{formatCurrency(cli.products[0]?.minPrice)}</TableCell>
                                    <TableCell className="text-right text-red-600">{formatCurrency(cli.products[0]?.maxPrice)}</TableCell>
                                </TableRow>
                            ))
                        ))
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}