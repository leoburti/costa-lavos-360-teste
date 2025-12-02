import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Wrench, DollarSign, FileText } from 'lucide-react';

import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import KPICard from '@/components/supervisor/KPICard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDateForAPI } from '@/lib/utils';
import PageSkeleton from '@/components/PageSkeleton';
import { EmptyState, ErrorState } from '@/components/common';

const AnaliticoEquipamentosCliente = () => {
  const { filters } = useFilters();

  const params = useMemo(() => ({
    p_start_date: formatDateForAPI(filters.dateRange?.from || filters.dateRange?.[0]),
    p_end_date: formatDateForAPI(filters.dateRange?.to || filters.dateRange?.[1]),
    p_exclude_employees: filters.excludeEmployees,
    p_supervisors: filters.supervisors?.map(String),
    p_sellers: filters.sellers?.map(String),
    p_customer_groups: filters.customerGroups?.map(String),
    p_regions: filters.regions?.map(String),
    p_clients: filters.clients?.map(String),
    p_search_term: filters.searchTerm,
    p_show_defined_groups_only: false,
    p_grouping_level: 'client'
  }), [filters]);

  const { data, isLoading, error, refetch } = useAnalyticalData(
    'get_equipment_by_client', 
    params, 
    { enabled: !!params.p_start_date && !!params.p_end_date }
  );

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  const kpis = data?.kpis || {};
  const clients = data?.details || [];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      <Helmet>
        <title>Equipamentos por Cliente | Costa Lavos</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Análise de Equipamentos por Cliente</h1>
        <p className="text-muted-foreground">Relação entre investimento em equipamentos e retorno em vendas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Clientes c/ Equip." value={kpis.totalClientsWithEquipment || 0} icon={Wrench} color="blue" />
        <KPICard title="Valor Total Equip." value={formatCurrency(kpis.totalEquipmentValue)} icon={DollarSign} color="amber" />
        <KPICard title="Vendas Totais (Destes)" value={formatCurrency(kpis.totalSalesWithEquipment)} icon={DollarSign} color="emerald" />
        <KPICard title="ROI Médio" value={`${(kpis.average_roi || 0).toFixed(1)}%`} icon={FileText} color="purple" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhe por Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Valor Equipamentos</TableHead>
                  <TableHead className="text-right">Qtd. Itens</TableHead>
                  <TableHead className="text-right">Vendas Totais</TableHead>
                  <TableHead className="text-center">ROI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <EmptyState description="Nenhum registro encontrado." />
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((client, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(client.equipment_value)}</TableCell>
                      <TableCell className="text-right">{client.equipment_count}</TableCell>
                      <TableCell className="text-right">{formatCurrency(client.total_sales)}</TableCell>
                      <TableCell className="text-center font-bold">
                        <span className={client.roi >= 100 ? 'text-emerald-600' : 'text-red-600'}>
                          {client.roi ? Number(client.roi).toFixed(1) : 0}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnaliticoEquipamentosCliente;