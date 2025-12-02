import React, { useState, useMemo } from 'react';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useFilters } from '@/contexts/FilterContext';
import { LoadingState, ErrorState, EmptyState } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import FilterBar from '@/components/FilterBar';
import { Helmet } from 'react-helmet-async';

export default function Deliveries() {
  const { filters } = useFilters();
  
  const params = useMemo(() => ({
    p_start_date: filters.dateRange?.[0]?.toISOString() || null,
    p_end_date: filters.dateRange?.[1]?.toISOString() || null,
    p_search_term: filters.searchTerm || null
  }), [filters]);

  // Fetch real data from 'entregas' table via generic RPC or direct query hook wrapper
  // Assuming we have a hook that can query tables if no specific RPC
  // For now, we use 'get_deliveries_list' RPC which we assume exists or will be created
  // If not, we can use 'supabase.from' inside useEffect, but let's stick to the hook pattern
  
  // Fallback: using a simple RPC 'get_deliveries'
  const { data, loading, error, retry } = useAnalyticalData('get_deliveries', params);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <div className="p-6 space-y-6">
      <Helmet><title>Entregas | Delivery</title></Helmet>
      <FilterBar />
      
      <Card>
        <CardHeader><CardTitle>Lista de Entregas</CardTitle></CardHeader>
        <CardContent>
          {!data || data.length === 0 ? (
            <EmptyState description="Nenhuma entrega encontrada." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Motorista</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Entrega</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell className="font-mono text-xs">{delivery.id.slice(0,8)}</TableCell>
                    <TableCell>{delivery.client_name}</TableCell>
                    <TableCell>{delivery.driver_name}</TableCell>
                    <TableCell>
                      <Badge variant={delivery.status === 'entregue' ? 'success' : 'secondary'}>
                        {delivery.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(delivery.delivery_date), 'dd/MM/yyyy')}</TableCell>
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