import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { Building2, DollarSign, Users, TrendingUp, TrendingDown, Minus, UserCheck, UserX } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';
import MetricCard from '@/components/MetricCard';
import { format } from 'date-fns';

const TrendIndicator = ({ trend }) => {
  if (trend === null || trend === undefined) return <Minus className="h-4 w-4 text-gray-500" />;
  if (trend > 0.1) return <TrendingUp className="h-4 w-4 text-emerald-500" />;
  if (trend < -0.1) return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-gray-500" />;
};

const RaioXSupervisor = () => {
  const { filters, isReady } = useFilters();
  const { data, loading, error } = useAnalyticalData(
    'get_supervisor_analytical_data',
    filters,
    { enabled: isReady }
  );

  const { kpis, seller_performance, churn_analysis, sales_trend } = data || {};

  if (error) {
    return <div className="text-red-500 p-4">Erro ao carregar dados: {error.message}</div>;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <Helmet>
        <title>Raio-X do Supervisor | Costa Lavos</title>
      </Helmet>

      <div className="flex items-center gap-3 px-1">
        <div className="bg-indigo-100 p-3 rounded-full">
          <Building2 className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Raio-X do Supervisor</h1>
          <p className="text-muted-foreground">Análise completa do desempenho da equipe do supervisor.</p>
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
            <CardTitle>Performance por Vendedor</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendedor</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                    <TableHead className="text-right">Clientes Ativos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}><TableCell colSpan={3}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                    ))
                  ) : (
                    seller_performance?.map((seller, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{seller.name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(seller.total_revenue)}</TableCell>
                        <TableCell className="text-right">{formatNumber(seller.active_clients)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Análise de Churn da Carteira</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            {loading ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie data={churn_analysis} dataKey="client_count" nameKey="phase" cx="50%" cy="50%" outerRadius={120} fill="#8884d8" label>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tendência de Vendas no Período</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          {loading ? <Skeleton className="h-full w-full" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={sales_trend}>
                <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'dd/MM')} />
                <YAxis tickFormatter={(value) => `${formatCurrency(value / 1000)}k`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="total" fill="#4f46e5" name="Receita" />
              </RechartsBarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RaioXSupervisor;