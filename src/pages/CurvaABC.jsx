
import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useFilters } from '@/contexts/FilterContext';
import { PieChart, DollarSign, Users, Activity, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';

import MetricCard from '@/components/MetricCard';
import ChartCard from '@/components/ChartCard';

const COLORS = {
  'A+': '#10b981', // Emerald 500
  'A': '#34d399',  // Emerald 400
  'B': '#facc15',  // Yellow 400
  'C': '#fb923c',  // Orange 400
  'D': '#f87171',  // Red 400
  'E': '#94a3b8',  // Slate 400
};

const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

const ClientListItem = ({ client, totalRevenue, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted"
  >
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">{getInitials(client.name)}</AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium truncate" title={client.name}>{client.name}</span>
    </div>
    <div className="text-right">
      <p className="text-sm font-semibold">{formatCurrency(client.revenue)}</p>
      <p className="text-xs text-muted-foreground">{formatPercentage((client.revenue / totalRevenue) * 100)}</p>
    </div>
  </motion.div>
);

const CurveCard = ({ title, clients, totalRevenue, totalCategoryRevenue, color, icon: Icon }) => {
  if (!clients || clients.length === 0) return null;
  const percentageOfTotal = (totalCategoryRevenue / totalRevenue) * 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card rounded-xl border flex flex-col"
    >
      <div className="p-4 border-b flex items-center justify-between" style={{ borderLeft: `4px solid ${color}` }}>
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5" style={{ color }} />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="text-right">
          <p className="font-bold">{formatCurrency(totalCategoryRevenue)}</p>
          <p className="text-sm text-muted-foreground">{formatPercentage(percentageOfTotal)} da receita</p>
        </div>
      </div>
      <ScrollArea className="flex-grow h-72">
        <div className="p-4 space-y-1">
          {clients.map((client, index) => (
            <ClientListItem key={client.name} client={client} totalRevenue={totalRevenue} index={index} />
          ))}
        </div>
      </ScrollArea>
    </motion.div>
  );
};


const ABCAnalysisPage = () => {
  const { filters, isReady } = useFilters();
  const { data, loading, error } = useAnalyticalData('get_abc_analysis', filters, { enabled: isReady });

  const analysis = useMemo(() => {
    if (!data || Object.keys(data).length === 0) return {
      kpis: {},
      chartData: [],
      curves: [],
    };

    const grandTotal = Object.values(data).reduce((acc, curve) => acc + curve.total_revenue, 0);
    const totalClients = Object.values(data).reduce((acc, curve) => acc + curve.client_count, 0);

    const kpis = {
      totalRevenue: grandTotal,
      totalClients: totalClients,
      classA: Object.entries(data)
        .filter(([key]) => key.startsWith('A'))
        .reduce((acc, [, curve]) => acc + curve.percentage_of_total, 0),
      classB: data['B']?.percentage_of_total || 0,
      classC: data['C']?.percentage_of_total || 0,
    };

    const chartData = Object.entries(data)
      .map(([key, value]) => ({
        name: `Classe ${key}`,
        value: value.total_revenue,
        key: key,
      }))
      .sort((a,b) => b.value - a.value);

    const curves = ['A+', 'A', 'B', 'C', 'D', 'E'].map(key => ({
      key,
      title: `Classe ${key}`,
      data: data[key],
      color: COLORS[key],
    })).filter(c => c.data);

    return { kpis, chartData, curves, grandTotal };

  }, [data]);
  
  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Alert variant="destructive" className="mt-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro ao Carregar Análise</AlertTitle>
          <AlertDescription>
            Não foi possível carregar os dados da Curva ABC. Tente ajustar os filtros ou recarregar a página. <br/>
            <small>Detalhes: {error.message}</small>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      <Helmet>
        <title>Análise Curva ABC - Costa Lavos</title>
        <meta name="description" content="Análise da Curva ABC para classificação de clientes com base na receita." />
      </Helmet>

      <header className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md p-6">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <PieChart className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Curva ABC de Clientes</h1>
              <p className="text-blue-100 mt-1">Classificação de clientes por relevância de faturamento no período.</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-6 space-y-6">
        {/* FilterBar removed as per user request */}

        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <MetricCard title="Receita Total" value={formatCurrency(analysis.kpis.totalRevenue)} icon={DollarSign} />
            <MetricCard title="Total de Clientes" value={formatNumber(analysis.kpis.totalClients)} icon={Users} />
            <MetricCard title="% Receita Classe A" value={formatPercentage(analysis.kpis.classA)} icon={Activity} />
            <MetricCard title="% Receita Classe B" value={formatPercentage(analysis.kpis.classB)} icon={Activity} />
            <MetricCard title="% Receita Classe C" value={formatPercentage(analysis.kpis.classC)} icon={Activity} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1">
                {loading ? (
                    <Skeleton className="h-[400px] w-full"/>
                ) : (
                    <ChartCard title="Distribuição de Receita por Classe" height={400}>
                         <ResponsiveContainer width="100%" height="100%">
                            <RechartsPie>
                                <Pie 
                                  data={analysis.chartData} 
                                  dataKey="value" 
                                  nameKey="name" 
                                  cx="50%" 
                                  cy="50%" 
                                  innerRadius={80} 
                                  outerRadius={120} 
                                  paddingAngle={3}
                                  labelLine={false}
                                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                      const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                                      const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                                      return (
                                        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
                                          {`${(percent * 100).toFixed(0)}%`}
                                        </text>
                                      );
                                    }}
                                >
                                {analysis.chartData?.map((entry) => (
                                    <Cell key={entry.name} fill={COLORS[entry.key]} />
                                ))}
                                </Pie>
                                <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                                <Legend iconSize={10} />
                            </RechartsPie>
                        </ResponsiveContainer>
                    </ChartCard>
                )}
            </div>
            <div className="lg:col-span-2 space-y-4">
                {loading ? (
                    <>
                        <Skeleton className="h-80 w-full" />
                        <Skeleton className="h-80 w-full" />
                    </>
                ) : (
                    analysis.curves.map(curve => (
                      <CurveCard 
                        key={curve.key} 
                        title={curve.title} 
                        clients={curve.data.clients}
                        totalRevenue={analysis.grandTotal}
                        totalCategoryRevenue={curve.data.total_curve_revenue}
                        color={curve.color}
                        icon={Activity}
                      />
                    ))
                )}
                {!loading && analysis.curves.length === 0 && (
                    <div className="text-center py-10 bg-card rounded-lg border">
                        <p className="text-muted-foreground">Nenhum dado encontrado para os filtros selecionados.</p>
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
};

export default ABCAnalysisPage;
