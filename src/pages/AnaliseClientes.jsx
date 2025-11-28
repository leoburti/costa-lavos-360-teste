import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Users, TrendingUp, TrendingDown, DollarSign, ShoppingCart, UserCheck, UserX } from 'lucide-react';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { formatCurrency, formatNumber } from '@/lib/utils';
import InsightCard from '@/components/InsightCard';

const ClientAnalysis = () => {
    const { filters } = useFilters();
    const { data, loading, error } = useAnalyticalData('get_client_analysis', filters);

    const { kpis, segment_distribution, top_clients } = data || {};

    const insights = [
        `O faturamento médio por cliente neste período é de ${formatCurrency(kpis?.avg_revenue_per_client)}.`,
        `Os clientes do segmento "Alto Valor" representam a maior parte do faturamento.`,
        `O ticket médio por pedido é de ${formatCurrency(kpis?.avg_ticket)}.`,
    ];

    if (error) {
        return <div className="text-red-500">Erro ao carregar dados: {error.message}</div>;
    }

    return (
        <div className="space-y-6">
            <Helmet>
                <title>Análise de Clientes | Costa Lavos</title>
            </Helmet>

            <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Análise de Clientes</h1>
                    <p className="text-muted-foreground">Visão geral do comportamento e segmentação de clientes.</p>
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
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatNumber(kpis?.total_clients)}</div>
                                <p className="text-xs text-muted-foreground">Clientes com compras no período</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Receita Média / Cliente</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(kpis?.avg_revenue_per_client)}</div>
                                <p className="text-xs text-muted-foreground">Faturamento médio por cliente</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(kpis?.avg_ticket)}</div>
                                <p className="text-xs text-muted-foreground">Valor médio por pedido</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Clientes Ganhos</CardTitle>
                                <UserCheck className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">--</div>
                                <p className="text-xs text-muted-foreground">Comparado ao período anterior</p>
                            </CardContent>
                        </Card>
                        
                    </>
                )}
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Top 10 Clientes por Faturamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-[400px]" /> : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead className="text-right">Faturamento</TableHead>
                                        <TableHead>Segmento</TableHead>
                                        <TableHead className="text-right">Nº de Pedidos</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {top_clients?.map(client => (
                                        <TableRow key={client.client_id}>
                                            <TableCell className="font-medium">{client.client_name}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(client.total_revenue)}</TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={
                                                        client.segment === 'Alto Valor' ? 'default' : 
                                                        client.segment === 'Médio Valor' ? 'secondary' : 'outline'
                                                    }
                                                    className={
                                                        client.segment === 'Alto Valor' ? 'bg-green-600 hover:bg-green-700' : ''
                                                    }
                                                >{client.segment}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">{formatNumber(client.total_orders)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Distribuição de Segmentos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? <Skeleton className="h-[200px]" /> : (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={segment_distribution} layout="vertical" margin={{ left: 20 }}>
                                        <XAxis type="number" hide />
                                        <YAxis type="category" dataKey="segment" width={80} tick={{ fontSize: 12 }} />
                                        <Tooltip cursor={{ fill: 'rgba(200, 200, 200, 0.1)' }} contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }} />
                                        <Bar dataKey="client_count" fill="#4ade80" name="Nº de Clientes" barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                    <InsightCard title="Insights de Clientes" insights={insights} loading={loading} />
                </div>
            </div>
        </div>
    );
};

export default ClientAnalysis;