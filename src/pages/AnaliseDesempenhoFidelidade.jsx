import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { formatDateForAPI, formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ErrorState, EmptyState } from '@/components/common';
import FilterBar from '@/components/FilterBar';
import MetricCard from '@/components/MetricCard';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ShieldCheck, Users, Activity, AlertCircle } from 'lucide-react'; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import PageSkeleton from '@/components/PageSkeleton';

const SEGMENT_COLORS = {
  'Campeões': '#15803d', // green-700
  'Clientes Fiéis': '#22c55e', // green-500
  'Potenciais Fiéis': '#84cc16', // lime-500
  'Novos Clientes': '#3b82f6', // blue-500
  'Promissores': '#f59e0b', // amber-500
  'Precisam de Atenção': '#f97316', // orange-500
  'Em Risco': '#ef4444', // red-500
  'Hibernando': '#9ca3af', // gray-400
};

export default function AnaliseDesempenhoFidelidade() {
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
  }), [filters]);

  // Using React Query via improved hook
  const { data, isLoading, error, refetch } = useAnalyticalData(
    'get_rfm_analysis',
    params,
    { enabled: !!params.p_start_date, staleTime: 1000 * 60 * 10 }
  );

  const segmentsData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    const counts = data.reduce((acc, curr) => {
        acc[curr.segment] = (acc[curr.segment] || 0) + 1;
        return acc;
    }, {});
    const sortedSegmentNames = Object.keys(SEGMENT_COLORS).filter(segment => counts[segment]);
    return sortedSegmentNames.map(name => ({ name, value: counts[name] }));
  }, [data]);

  const riskClients = useMemo(() => {
    if (!data) return [];
    return data.filter(c => c.segment === 'Em Risco' || c.segment === 'Hibernando').sort((a,b) => b.monetary - a.monetary);
  }, [data]);

  // Loading state uses Skeleton now
  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Fidelidade e Churn | Costa Lavos</title>
      </Helmet>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-primary" />
          Análise de Fidelidade (RFM)
        </h1>
        <p className="text-muted-foreground">
          Segmentação de clientes por Recência, Frequência e Valor Monetário.
        </p>
      </div>

      <FilterBar />

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !data || data.length === 0 ? (
        <EmptyState description="Sem dados para análise de fidelidade." />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard title="Total de Clientes" value={data.length} icon={Users} />
            <MetricCard title="Clientes Fiéis" value={segmentsData.find(s => s.name === 'Clientes Fiéis')?.value || 0} icon={ShieldCheck} color="text-green-600" />
            <MetricCard title="Em Risco" value={segmentsData.find(s => s.name === 'Em Risco')?.value || 0} icon={AlertCircle} status="danger" />
            <MetricCard title="Potencial Upsell" value={formatCurrency(data.reduce((acc, c) => acc + (c.upsellPotential || 0), 0))} icon={Activity} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição da Carteira</CardTitle>
                <CardDescription>Segmentação baseada no comportamento de compra.</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={segmentsData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {segmentsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SEGMENT_COLORS[entry.name] || '#8884d8'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clientes em Risco (Prioridade)</CardTitle>
                <CardDescription>Alto valor monetário, mas inativos recentemente.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border h-[400px] overflow-auto">
                    <Table>
                        <TableHeader className="sticky top-0 bg-background">
                            <TableRow>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Supervisor</TableHead>
                                <TableHead className="text-right">Dias Inativo</TableHead>
                                <TableHead className="text-right">Valor Histórico</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {riskClients.slice(0, 20).map((client, idx) => (
                                <TableRow key={idx}>
                                    <TableCell className="font-medium">{client.clientName}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{client.supervisor}</TableCell>
                                    <TableCell className="text-right font-bold text-red-600">{client.recency}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(client.monetary)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
                <CardTitle>Matriz RFM Completa</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Segmento</TableHead>
                                <TableHead className="text-center">Score R</TableHead>
                                <TableHead className="text-center">Score F</TableHead>
                                <TableHead className="text-center">Score M</TableHead>
                                <TableHead className="text-right">Valor Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.slice(0, 50).map((client, idx) => (
                                <TableRow key={idx}>
                                    <TableCell className="font-medium">{client.clientName}</TableCell>
                                    <TableCell>
                                        <Badge style={{ backgroundColor: SEGMENT_COLORS[client.segment] || '#8884d8' }}>
                                            {client.segment}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">{client.rScore}</TableCell>
                                    <TableCell className="text-center">{client.fScore}</TableCell>
                                    <TableCell className="text-center">{client.mScore}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(client.monetary)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}