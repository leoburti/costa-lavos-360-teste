import React, { useMemo } from 'react';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useFilters } from '@/contexts/FilterContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingState, ErrorState, EmptyState } from '@/components/common';
import FilterBar from '@/components/FilterBar';
import { Helmet } from 'react-helmet-async';

export default function Inventario() {
  const { filters } = useFilters();
  const params = useMemo(() => ({
    p_search_term: filters.searchTerm,
    p_status: 'ativo' // Default filter
  }), [filters]);

  const { data, loading, error, retry } = useAnalyticalData('get_equipment_list', params);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <div className="p-6 space-y-6">
      <Helmet><title>Inventário | Equipamentos</title></Helmet>
      <FilterBar />
      <Card>
        <CardHeader><CardTitle>Inventário de Equipamentos</CardTitle></CardHeader>
        <CardContent>
          {!data || data.length === 0 ? (
            <EmptyState description="Nenhum equipamento encontrado." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Serial</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.equipment_id}>
                    <TableCell>{item.equipment_name}</TableCell>
                    <TableCell>{item.model}</TableCell>
                    <TableCell>{item.serial}</TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}