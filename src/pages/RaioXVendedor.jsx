import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { User, DollarSign, Users, TrendingUp, TrendingDown, Minus, UserCheck } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';
import MetricCard from '@/components/MetricCard';

const TrendIndicator = ({ trend }) => {
  if (trend === null || trend === undefined) return <Minus className="h-4 w-4 text-gray-500" />;
  if (trend > 0.1) return <TrendingUp className="h-4 w-4 text-emerald-500" />;
  if (trend < -0.1) return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-gray-500" />;
};

const getTrendBadgeVariant = (trend) => {
  if (trend === null || trend === undefined) return "secondary";
  if (trend > 0.1) return "success";
  if (trend < -0.1) return "destructive";
  return "secondary";
};

const RaioXVendedor = () => {
  const { filters, isReady } = useFilters();
  const { data, loading, error } = useAnalyticalData(
    'get_seller_analytical_data',
    filters,
    { enabled: isReady }
  );

  const { kpis, client_performance, churn_analysis, rfm_analysis } = data || {};

  if (error) {
    return <div className="text-red-500 p-4">Erro ao carregar dados: {error.message}</div>;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <Helmet>
        <title>Raio-X do Vendedor | Costa Lavos</title>
      </Helmet>

      <div className="flex items-center gap-3 px-1">
        <div className="bg-green-100 p-3 rounded-full">
          <User className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Raio-X do Vendedor</h1>
          <p className="text-muted-foreground">Análise completa do desempenho da carteira do vendedor.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <Skeleton className="h-[126px]" />
            <Skeleton className="h-[126px]" />
            <Skeleton className="h-[126px]" />
            <Skeleton className="h-[126px]" />
          </>
        ) : (
          <>
            <MetricCard title="Receita Total" value={formatCurrency(kpis?.total_revenue)} icon={DollarSign} />
            <MetricCard title="Clientes Ativos" value={formatNumber(kpis?.total_clients)} icon={Users} />
            <MetricCard title="Ticket Médio" value={formatCurrency(kpis?.average_ticket)} icon={TrendingUp} />
            <MetricCard title="Novos Clientes" value={formatNumber(kpis?.clients_gained)} icon={UserCheck} />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Análise de Churn da Carteira</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {loading ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie data={churn_analysis} dataKey="client_count" nameKey="phase" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                    {churn_analysis?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#22c55e', '#f97316', '#ef4444', '#eab308'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${formatNumber(value)} clientes`} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Segmentação RFM da Carteira</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {loading ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={rfm_analysis}>
                  <XAxis dataKey="segment" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip formatter={(value) => `${formatNumber(value)} clientes`} />
                  <Bar dataKey="client_count" fill="#8884d8" name="Clientes" />
                </RechartsBarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance dos Clientes da Carteira</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Receita Total</TableHead>
                  <TableHead className="text-right">Nº de Pedidos</TableHead>
                  <TableHead className="text-center">Tendência (vs Período Ant.)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(10)].map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                  ))
                ) : (
                  client_performance?.map((client, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(client.total_revenue)}</TableCell>
                      <TableCell className="text-right">{formatNumber(client.sales_count)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getTrendBadgeVariant(client.trend)}>
                          <TrendIndicator trend={client.trend} />
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default RaioXVendedor;