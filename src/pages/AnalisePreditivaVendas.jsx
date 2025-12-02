import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { formatDateForAPI, formatCurrency, formatPercentage } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingState, ErrorState, EmptyState } from '@/components/common';
import FilterBar from '@/components/FilterBar';
import MetricCard from '@/components/MetricCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Target, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AnalisePreditivaVendas() {
  const { filters } = useFilters();

  const params = useMemo(() => ({
    p_start_date: formatDateForAPI(filters.dateRange[0]),
    p_end_date: formatDateForAPI(filters.dateRange[1]),
    p_exclude_employees: filters.excludeEmployees,
    p_supervisors: filters.supervisors?.map(String),
    p_sellers: filters.sellers?.map(String),
    p_customer_groups: filters.customerGroups?.map(String),
    p_regions: filters.regions?.map(String),
    p_clients: filters.clients?.map(String),
    p_search_term: filters.searchTerm,
  }), [filters]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_demand_prediction_data', // Using demand prediction RPC
    params,
    { enabled: !!params.p_start_date }
  );

  // Aggregation for Chart (Group all clients forecast)
  const summary = useMemo(() => {
    if (!data || !Array.isArray(data)) return { totalForecast: 0, count: 0, items: [] };
    
    const totalForecast = data.reduce((acc, item) => acc + (item.forecastedRevenue || 0), 0);
    
    return {
      totalForecast,
      count: data.length,
      items: data.sort((a, b) => b.forecastedRevenue - a.forecastedRevenue).slice(0, 50) // Top 50 for table
    };
  }, [data]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Previsão de Vendas | Costa Lavos</title>
      </Helmet>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-primary" />
          Análise Preditiva
        </h1>
        <p className="text-muted-foreground">
          Projeção de vendas baseada no histórico de consumo (Média Móvel).
        </p>
      </div>

      <FilterBar />

      {loading ? (
        <LoadingState message="Calculando projeções..." />
      ) : error ? (
        <ErrorState error={error} onRetry={retry} />
      ) : !data || data.length === 0 ? (
        <EmptyState description="Dados insuficientes para gerar previsão." />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard title="Previsão Total (30 Dias)" value={formatCurrency(summary.totalForecast)} icon={Target} />
            <MetricCard title="Clientes Analisados" value={summary.count} icon={TrendingUp} />
            <MetricCard title="Confiança do Modelo" value="Média" icon={AlertCircle} subtitle="Baseado em histórico linear" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Projeção de Demanda por Cliente (Top 20)</CardTitle>
              <CardDescription>Estimativa de compra para os próximos 30 dias.</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary.items.slice(0, 20)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="clientName" hide /> {/* Too many labels */}
                  <YAxis tickFormatter={(val) => `R$${val/1000}k`} />
                  <Tooltip 
                    formatter={(val, name) => [formatCurrency(val), name === 'forecastedRevenue' ? 'Previsão' : name]}
                    labelFormatter={(idx) => summary.items[idx]?.clientName}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="forecastedRevenue" name="Previsão (R$)" stroke="#8884d8" strokeWidth={2} dot={false} />
                  <ReferenceLine y={0} stroke="#000" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalhamento da Previsão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Segmento</TableHead>
                      <TableHead>Tendência</TableHead>
                      <TableHead className="text-right">Previsão (30d)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.clientName}</TableCell>
                        <TableCell>{item.segment}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.trend > 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {item.trend > 1 ? 'Crescimento' : 'Queda'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-primary font-bold">
                          {formatCurrency(item.forecastedRevenue)}
                        </TableCell>
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