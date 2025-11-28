import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { TrendingUp, PieChart, Percent, DollarSign, Package, AlertTriangle, Crown } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import FilterBar from '@/components/FilterBar';
import MetricCard from '@/components/MetricCard';
import ChartCard from '@/components/ChartCard';
import InsightCard from '@/components/InsightCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const MARGIN_DISTRIBUTION_COLORS = {
  '0-20%': '#ef4444', // red-500
  '20-40%': '#f97316', // orange-500
  '40-60%': '#eab308', // yellow-500
  '60%+': '#22c55e', // green-500
};

const MarginAnalysisPage = () => {
  const { filters, isReady } = useFilters();

  const { data, loading, error } = useAnalyticalData(
    'get_margin_analysis',
    filters,
    {
      enabled: isReady,
      defaultValue: { kpis: {}, margin_distribution: [], products: [] }
    }
  );

  const { kpis, margin_distribution, products } = data || { kpis: {}, margin_distribution: [], products: [] };
  
  const top15Products = useMemo(() => products.slice(0, 15), [products]);
  
  const topProductsChartData = useMemo(() => {
    return top15Products.map(p => ({
      name: p.product_name.substring(0, 15) + '...',
      Margem: p.margin_value,
      Receita: p.total_revenue,
    })).reverse();
  }, [top15Products]);

  const marginDistributionChartData = useMemo(() => {
    return margin_distribution.map(d => ({
      name: d.margin_range,
      value: d.product_count,
    }));
  }, [margin_distribution]);

  const insights = useMemo(() => {
    if (!products || products.length === 0) return [];
    const mostProfitable = products[0];
    const leastProfitable = products[products.length - 1];
    
    let generatedInsights = [];
    if (mostProfitable) {
      generatedInsights.push(
        <>O produto <strong>{mostProfitable.product_name}</strong> é o mais lucrativo, gerando <strong>{formatCurrency(mostProfitable.margin_value)}</strong> de margem.</>
      );
    }
    if (leastProfitable && leastProfitable.margin_value < 0) {
      generatedInsights.push(
        <>Atenção ao produto <strong>{leastProfitable.product_name}</strong>, que apresentou uma margem negativa de <strong>{formatCurrency(leastProfitable.margin_value)}</strong>.</>
      );
    }
    const highMarginProducts = products.filter(p => p.margin_percentage >= 40).length;
    if (highMarginProducts > 0 && products.length > 0) {
      generatedInsights.push(
        <><strong>{formatPercentage((highMarginProducts / products.length) * 100)}</strong> dos produtos analisados possuem uma margem saudável (acima de 40%).</>
      );
    }
    return generatedInsights;
  }, [products]);

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Alert variant="destructive" className="mt-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro ao Carregar Análise</AlertTitle>
          <AlertDescription>
            Não foi possível carregar os dados da análise de margem. <br />
            <small>Detalhes: {error.message}</small>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      <Helmet>
        <title>Análise de Margem - Costa Lavos</title>
        <meta name="description" content="Análise da margem de lucro por produto, categoria e período." />
      </Helmet>

      <header className="bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md p-6">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <TrendingUp className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Análise de Margem</h1>
              <p className="text-rose-100 mt-1">Entenda a lucratividade real do seu portfólio de produtos.</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-6 space-y-6">
        <FilterBar />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)
          ) : (
            <>
              <MetricCard title="Margem Total" value={formatCurrency(kpis.total_margin)} icon={DollarSign} />
              <MetricCard title="Margem Média %" value={formatPercentage(kpis.average_margin_percentage)} icon={Percent} />
              <MetricCard title="Produtos Lucrativos" value={kpis.profitable_products} icon={Package} />
              <MetricCard title="Receita Bruta" value={formatCurrency(kpis.gross_revenue)} icon={DollarSign} />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
            <ChartCard title="Top 15 Produtos por Margem" height={400}>
              {loading ? <Skeleton className="h-full w-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProductsChartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                    <XAxis type="number" tickFormatter={(value) => `${formatCurrency(value / 1000)}k`} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} interval={0} />
                    <Tooltip formatter={(value, name) => [formatCurrency(value), name]} />
                    <Legend />
                    <Bar dataKey="Margem" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Receita" fill="#fb923c" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <ChartCard title="Distribuição de Margem" height={400}>
              {loading ? <Skeleton className="h-full w-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie data={marginDistributionChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} labelLine={false}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                          const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                          const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                          const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                          return <text x={x} y={y} fill="currentColor" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>{`${(percent * 100).toFixed(0)}%`}</text>;
                      }}>
                      {marginDistributionChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={MARGIN_DISTRIBUTION_COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} produtos`} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
            <h3 className="text-xl font-bold mb-4">Análise Detalhada por Produto</h3>
            <ScrollArea className="h-[500px] border rounded-lg">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                    <TableHead className="text-right">Custo Estimado</TableHead>
                    <TableHead className="text-right">Margem (Valor)</TableHead>
                    <TableHead className="text-right">Margem (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [...Array(10)].map((_, i) => (
                      <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                    ))
                  ) : products.length > 0 ? (
                    products.map(p => (
                      <TableRow key={p.product_name}>
                        <TableCell className="font-medium">{p.product_name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(p.total_revenue)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(p.total_cost)}</TableCell>
                        <TableCell className={`text-right font-bold ${p.margin_value > 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(p.margin_value)}</TableCell>
                        <TableCell className="text-right">{formatPercentage(p.margin_percentage)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum produto encontrado para os filtros selecionados.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
             <InsightCard title="Insights de Margem" insights={insights} loading={loading} />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default MarginAnalysisPage;