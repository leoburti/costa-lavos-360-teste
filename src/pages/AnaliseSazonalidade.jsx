import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Zap, ChevronsUp, ChevronsDown, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatPercentage, formatDate } from '@/lib/utils';
import FilterBar from '@/components/FilterBar';
import MetricCard from '@/components/MetricCard';
import ChartCard from '@/components/ChartCard';
import InsightCard from '@/components/InsightCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ReferenceLine } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MonthName = ({ monthStr }) => {
  if (!monthStr) return null;
  const date = parse(monthStr, 'yyyy-MM', new Date());
  return <span className="capitalize">{format(date, 'MMMM yyyy', { locale: ptBR })}</span>;
};

const SazonalidadePage = () => {
    const { filters, isReady } = useFilters();

    const { data, loading, error } = useAnalyticalData(
        'get_seasonality_analysis',
        filters,
        { 
            enabled: isReady, 
            defaultValue: { kpis: {}, monthly_data: [] } 
        }
    );

    const { kpis, monthly_data } = data || { kpis: {}, monthly_data: [] };

    const chartData = useMemo(() => {
        return monthly_data.map(item => ({
            ...item,
            monthLabel: format(parse(item.month, 'yyyy-MM', new Date()), 'MMM/yy', { locale: ptBR }),
        }));
    }, [monthly_data]);
    
    const avgRevenue = useMemo(() => {
        if (monthly_data.length === 0) return 0;
        const total = monthly_data.reduce((acc, item) => acc + item.revenue, 0);
        return total / monthly_data.length;
    }, [monthly_data]);

    const insights = useMemo(() => {
        if (!kpis.peak_month || monthly_data.length < 3) return [];
        const topMonths = [...monthly_data].sort((a,b) => b.revenue - a.revenue).slice(0,3);
        const totalRevenue = monthly_data.reduce((sum, item) => sum + item.revenue, 0);
        const topMonthsRevenue = topMonths.reduce((sum, item) => sum + item.revenue, 0);
        const topMonthsPercentage = totalRevenue > 0 ? (topMonthsRevenue / totalRevenue) * 100 : 0;

        let generatedInsights = [];
        if(kpis.peak_month) {
            generatedInsights.push(<>O pico de vendas ocorreu em <MonthName monthStr={kpis.peak_month} />, atingindo <strong>{formatCurrency(kpis.peak_sales)}</strong>.</>);
        }
        if(topMonths.length >= 3 && topMonthsPercentage > 0) {
             generatedInsights.push(<>Os 3 melhores meses (<MonthName monthStr={topMonths[0].month} />, <MonthName monthStr={topMonths[1].month} />, <MonthName monthStr={topMonths[2].month} />) representam <strong>{formatPercentage(topMonthsPercentage)}</strong> do faturamento total do período.</>);
        }
        if(kpis.seasonality_percentage > 50) {
            generatedInsights.push(<>A sazonalidade é <strong>alta</strong> ({formatPercentage(kpis.seasonality_percentage)}), indicando uma grande variação nas vendas ao longo do ano.</>);
        } else if (kpis.seasonality_percentage > 20) {
            generatedInsights.push(<>A sazonalidade é <strong>moderada</strong> ({formatPercentage(kpis.seasonality_percentage)}), com flutuações notáveis nas vendas.</>);
        }

        return generatedInsights;

    }, [kpis, monthly_data]);

    if (error) {
        return (
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <Alert variant="destructive" className="mt-8">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Erro ao Carregar Análise</AlertTitle>
                    <AlertDescription>
                        Não foi possível carregar os dados da análise de sazonalidade. <br />
                        <small>Detalhes: {error.message}</small>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            <Helmet>
                <title>Análise de Sazonalidade - Costa Lavos</title>
                <meta name="description" content="Análise da tendência e sazonalidade das vendas ao longo do ano." />
            </Helmet>

            <header className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-md p-6">
                <div className="container mx-auto">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-lg">
                            <Calendar className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Análise de Sazonalidade</h1>
                            <p className="text-amber-800/80 mt-1">Identifique padrões e tendências de vendas ao longo do ano.</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow container mx-auto p-6 space-y-6">
                <FilterBar />

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_,i) => <Skeleton key={i} className="h-36" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricCard title="Pico de Vendas" value={formatCurrency(kpis.peak_sales)} icon={ChevronsUp} subtitle={<MonthName monthStr={kpis.peak_month} />} />
                        <MetricCard title="Vale de Vendas" value={formatCurrency(kpis.trough_sales)} icon={ChevronsDown} subtitle={<MonthName monthStr={kpis.trough_month} />} />
                        <MetricCard title="Índice de Sazonalidade" value={formatPercentage(kpis.seasonality_percentage)} icon={Zap} subtitle="Variação em torno da média" />
                        <MetricCard title="Média Mensal" value={formatCurrency(avgRevenue)} icon={TrendingUp} subtitle="Receita média por mês" />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        {loading ? (
                           <Skeleton className="h-[450px] w-full" />
                        ) : (
                            <ChartCard title="Tendência Sazonal de Vendas" height={450}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="monthLabel" />
                                        <YAxis tickFormatter={(value) => `${formatCurrency(value / 1000)}k`} />
                                        <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                                        <Area type="monotone" dataKey="revenue" name="Receita" stroke="#f59e0b" fillOpacity={1} fill="url(#colorRevenue)" />
                                        <ReferenceLine y={avgRevenue} label={{ value: "Média", position: 'insideTopLeft', fill: '#64748b' }} stroke="#94a3b8" strokeDasharray="3 3" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        )}
                    </div>
                    <div className="lg:col-span-1">
                        <InsightCard insights={insights} loading={loading} />
                    </div>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    {loading ? (
                        <Skeleton className="h-96 w-full" />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mês</TableHead>
                                    <TableHead className="text-right">Receita</TableHead>
                                    <TableHead className="text-right">% do Total</TableHead>
                                    <TableHead className="text-right">Índice Sazonal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {chartData.map(item => (
                                    <TableRow key={item.month}>
                                        <TableCell className="font-medium capitalize">{format(parse(item.month, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: ptBR })}</TableCell>
                                        <TableCell className="text-right font-semibold">{formatCurrency(item.revenue)}</TableCell>
                                        <TableCell className="text-right">{formatPercentage(item.percentage_of_total)}</TableCell>
                                        <TableCell className={`text-right font-bold ${item.seasonal_index > 1 ? 'text-green-600' : 'text-red-600'}`}>
                                            {item.seasonal_index.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </motion.div>
            </main>
        </div>
    );
};

export default SazonalidadePage;