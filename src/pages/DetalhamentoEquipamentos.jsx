import React from 'react';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { Package } from 'lucide-react';

import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

const DetalhamentoEquipamentos = () => {
  const { filters } = useFilters();
  const startDate = filters.dateRange?.from ? format(filters.dateRange.from, 'yyyy-MM-dd') : null;
  const endDate = filters.dateRange?.to ? format(filters.dateRange.to, 'yyyy-MM-dd') : null;

  const params = {
    p_start_date: startDate,
    p_end_date: endDate,
    p_exclude_employees: filters.excludeEmployees,
    p_supervisors: filters.supervisors,
    p_sellers: filters.sellers,
    p_customer_groups: filters.customerGroups,
    p_regions: filters.regions,
    p_clients: filters.clients,
    p_search_term: filters.searchTerm,
    p_show_defined_groups_only: false
  };

  const { data, loading } = useAnalyticalData('rpc:get_detailed_equipment_analysis', params, { enabled: !!startDate && !!endDate });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Detalhamento de Equipamentos | Costa Lavos</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Detalhamento de Equipamentos</h1>
        <p className="text-muted-foreground">Análise granular por tipo de equipamento movimentado.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Itens Movimentados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipamento</TableHead>
                    <TableHead className="text-right">Qtd.</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead className="text-right">Clientes Distintos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!data || data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">Nenhum registro encontrado.</TableCell>
                    </TableRow>
                  ) : (
                    data.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.equipment_name}</TableCell>
                        <TableCell className="text-right">{item.equipment_count}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.total_revenue)}</TableCell>
                        <TableCell className="text-right">{item.client_count}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DetalhamentoEquipamentos;