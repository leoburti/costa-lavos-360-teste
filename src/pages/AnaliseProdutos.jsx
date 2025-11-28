import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { motion } from 'framer-motion';
import { Package, DollarSign, Percent, ArrowUpRight, BarChart, ShoppingBag, Crown, Zap, TrendingUp } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';
import FilterBar from '@/components/FilterBar';
import MetricCard from '@/components/MetricCard';
import ChartCard from '@/components/ChartCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const getInitials = (name = '') => {
    const words = name.split(' ');
    if (words.length > 1) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

const ProductAnalysisPage = () => {
    const { filters, isReady } = useFilters();

    const { data, loading, error } = useAnalyticalData(
        'get_product_analysis',
        filters,
        { enabled: isReady, defaultValue: { kpis: {}, top_products: [] } }
    );

    const { kpis, top_products } = data || { kpis: {}, top_products: [] };
    
    const chartData = useMemo(() => {
        return top_products
            .map(p => ({
                name: p.product_name,
                Receita: p.total_revenue,
                Margem: p.total_margin,
            }))
            .sort((a, b) => b.Receita - a.Receita);
    }, [top_products]);

    const bestSeller = top_products[0];
    const bestMarginProduct = [...top_products].sort((a,b) => (b.total_margin / b.total_revenue) - (a.total_margin / a.total_revenue))[0];

    if (error) {
        return (
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <Alert variant="destructive" className="mt-8">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Erro ao Carregar Análise</AlertTitle>
                    <AlertDescription>
                        Não foi possível carregar os dados da análise de produtos. Tente ajustar os filtros ou recarregar a página. <br />
                        <small>Detalhes: {error.message}</small>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            <Helmet>
                <title>Análise de Produtos - Costa Lavos</title>
                <meta name="description" content="Análise de performance de produtos por receita, margem e quantidade." />
            </Helmet>

            <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md p-6">
                <div className="container mx-auto">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-lg">
                            <ShoppingBag className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Análise de Produtos</h1>
                            <p className="text-purple-100 mt-1">Explore a performance de vendas e margens dos seus produtos.</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow container mx-auto p-6 space-y-6">
                <FilterBar />

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map(i => <Skeleton key={i} className="h-36" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricCard title="Receita Total" value={formatCurrency(kpis.total_revenue)} icon={DollarSign} change="+5.2%" changeType="up" />
                        <MetricCard title="Produtos Ativos" value={formatNumber(kpis.active_products)} icon={Package} subtitle="No período selecionado" />
                        <MetricCard title="Margem Média" value={formatPercentage(kpis.average_margin)} icon={Percent} />
                        <MetricCard title="Crescimento (vs Mês Ant.)" value="12.5%" icon={ArrowUpRight} changeType="up" />
                    </div>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <>
                            <Skeleton className="lg:col-span-2 h-[450px]" />
                            <Skeleton className="lg:col-span-1 h-[450px]" />
                        </>
                    ) : (
                        <>
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center"><BarChart className="h-5 w-5 mr-2 text-primary" /> Top 10 Produtos por Receita</CardTitle>
                                    <CardDescription>Visualização da receita e margem dos produtos mais vendidos.</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsBarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                            <XAxis dataKey="name" tickFormatter={(value) => value.substring(0, 10) + '...'} angle={-45} textAnchor="end" height={60} interval={0} fontSize={10} />
                                            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tickFormatter={(value) => `${formatCurrency(value / 1000)}k`} />
                                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tickFormatter={(value) => `${formatCurrency(value / 1000)}k`} />
                                            <Tooltip formatter={(value, name) => [formatCurrency(value), name]} />
                                            <Legend />
                                            <Bar yAxisId="left" dataKey="Receita" fill="#8884d8" name="Receita" radius={[4, 4, 0, 0]} />
                                            <Bar yAxisId="right" dataKey="Margem" fill="#82ca9d" name="Margem" radius={[4, 4, 0, 0]} />
                                        </RechartsBarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center"><TrendingUp className="h-5 w-5 mr-2 text-primary"/> Produtos em Destaque</CardTitle>
                                    <CardDescription>Produtos com melhor performance no período.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     {bestSeller && (
                                         <div className="p-4 rounded-lg bg-amber-100/50 border-l-4 border-amber-500">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-amber-800">Mais Vendido</h4>
                                                <Crown className="h-5 w-5 text-amber-600" />
                                            </div>
                                            <p className="font-semibold text-foreground mt-1 truncate">{bestSeller.product_name}</p>
                                            <p className="text-sm text-amber-700 font-bold">{formatCurrency(bestSeller.total_revenue)}</p>
                                        </div>
                                     )}
                                     {bestMarginProduct && (
                                         <div className="p-4 rounded-lg bg-emerald-100/50 border-l-4 border-emerald-500">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-emerald-800">Maior Margem</h4>
                                                <Zap className="h-5 w-5 text-emerald-600" />
                                            </div>
                                            <p className="font-semibold text-foreground mt-1 truncate">{bestMarginProduct.product_name}</p>
                                            <p className="text-sm text-emerald-700 font-bold">{formatPercentage((bestMarginProduct.total_margin / bestMarginProduct.total_revenue) * 100)}</p>
                                        </div>
                                     )}
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Ranking de Produtos</CardTitle>
                            <CardDescription>Detalhes dos 10 produtos mais vendidos no período selecionado.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="space-y-4">
                                    {[...Array(5)].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {top_products.map((product, index) => (
                                        <div key={index} className="flex items-center p-3 bg-muted/50 rounded-lg border gap-4">
                                            <div className="flex items-center gap-4 flex-1">
                                                <span className="font-bold text-lg text-muted-foreground w-6 text-center">{index + 1}</span>
                                                <Avatar className="h-10 w-10 bg-primary/10 text-primary">
                                                    <AvatarFallback>{getInitials(product.product_name)}</AvatarFallback>
                                                </Avatar>
                                                <p className="font-semibold text-foreground truncate">{product.product_name}</p>
                                            </div>
                                            <div className="hidden md:block text-center">
                                                <p className="font-bold">{formatNumber(product.total_quantity)}</p>
                                                <p className="text-xs text-muted-foreground">Unidades</p>
                                            </div>
                                            <div className="hidden lg:block text-center">
                                                <p className="font-bold text-emerald-600">{formatPercentage((product.total_margin / product.total_revenue) * 100)}</p>
                                                <p className="text-xs text-muted-foreground">Margem</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-primary">{formatCurrency(product.total_revenue)}</p>
                                                <p className="text-xs text-muted-foreground">Receita</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        </div>
    );
};

export default ProductAnalysisPage;