
import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Percent, 
  Package, 
  TrendingUp, 
  BarChart2,
  PieChart as PieIcon,
  Calculator
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  CartesianGrid 
} from 'recharts';

import AnalyticsTemplate from '@/components/analytics/AnalyticsTemplate';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { formatCurrency, formatPercentage, formatDateForAPI } from '@/lib/utils';

const MotionCard = motion(Card);

const MARGIN_COLORS = {
  '0-20%': '#ef4444',
  '20-40%': '#f97316',
  '40-60%': '#eab308',
  '60%+': '#22c55e',
};

export default function AnaliseMargem() {
  const { filters } = useFilters();
  const [costFactor, setCostFactor] = useState(70); 

  const params = useMemo(() => ({
    // CORREÇÃO: Usar .from e .to em vez de array index
    p_start_date: formatDateForAPI(filters.dateRange?.from),
    p_end_date: formatDateForAPI(filters.dateRange?.to),
    p_exclude_employees: filters.excludeEmployees,
    p_supervisors: filters.supervisors?.map(String),
    p_sellers: filters.sellers?.map(String),
    p_customer_groups: filters.customerGroups?.map(String),
    p_regions: filters.regions?.map(String),
    p_clients: filters.clients?.map(String),
    p_search_term: filters.searchTerm,
  }), [filters]);

  const { data, loading, refetch, isMock } = useAnalyticalData(
    'get_margin_analysis',
    params,
    { defaultValue: { kpis: {}, margin_distribution: [], products: [] }, enabled: !!params.p_start_date }
  );

  const simulatedData = useMemo(() => {
    if (!data?.products) return { kpis: {}, products: [], margin_distribution: [] };

    const newProducts = data.products.map(p => {
        const revenue = Number(p.total_revenue);
        const cost = revenue * (costFactor / 100);
        const margin = revenue - cost;
        const pct = revenue > 0 ? (margin / revenue) * 100 : 0;
        return { ...p, total_cost: cost, margin_value: margin, margin_percentage: pct };
    });

    const totalRevenue = newProducts.reduce((acc, p) => acc + p.total_revenue, 0);
    const totalMargin = newProducts.reduce((acc, p) => acc + p.margin_value, 0);
    const profitable = newProducts.filter(p => p.margin_value > 0).length;

    const dist = { '0-20%': 0, '20-40%': 0, '40-60%': 0, '60%+': 0 };
    newProducts.forEach(p => {
        if (p.margin_percentage < 20) dist['0-20%']++;
        else if (p.margin_percentage < 40) dist['20-40%']++;
        else if (p.margin_percentage < 60) dist['40-60%']++;
        else dist['60%+']++;
    });

    return {
        kpis: {
            total_margin: totalMargin,
            average_margin_percentage: totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0,
            gross_revenue: totalRevenue,
            profitable_products: profitable
        },
        products: newProducts,
        margin_distribution: Object.keys(dist).map(k => ({ margin_range: k, product_count: dist[k] }))
    };
  }, [data, costFactor]);

  const topProductsData = useMemo(() => {
    return simulatedData.products.slice(0, 10).map(p => ({
      name: p.product_name.length > 20 ? p.product_name.substring(0, 20) + '...' : p.product_name,
      Margem: p.margin_value,
      Receita: p.total_revenue,
    }));
  }, [simulatedData]);

  const pieData = useMemo(() => {
    return simulatedData.margin_distribution.map(d => ({
      name: d.margin_range,
      value: d.product_count,
    }));
  }, [simulatedData]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <AnalyticsTemplate
      title="Rentabilidade e Margem"
      description="Visão detalhada da lucratividade com simulação de cenários de custo."
      onRefresh={refetch}
      loading={loading}
      isMock={isMock}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        <Card className="border-slate-200 bg-slate-50/50">
            <CardContent className="pt-6 pb-4 flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex items-center gap-3 min-w-[200px]">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                        <Calculator className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-slate-800">Simulador de Custo</h4>
                        <p className="text-xs text-slate-500">Ajuste o CMV estimado</p>
                    </div>
                </div>
                <div className="flex-1 w-full space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Margem Base (30%)</span>
                        <span className="font-bold text-slate-900">{100 - costFactor}% Margem Bruta</span>
                    </div>
                    <Slider 
                        defaultValue={[70]} 
                        max={95} 
                        min={30} 
                        step={1} 
                        value={[costFactor]} 
                        onValueChange={(val) => setCostFactor(val[0])}
                        className="py-2"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Custo Alto (5% Margem)</span>
                        <span>Custo Baixo (70% Margem)</span>
                    </div>
                </div>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MotionCard variants={itemVariants} className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">Margem Total (Simulada)</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-800">{formatCurrency(simulatedData.kpis.total_margin)}</div>
              <p className="text-xs text-emerald-600 mt-1 font-medium">
                {formatCurrency(simulatedData.kpis.total_margin / (simulatedData.products.length || 1))} méd/prod
              </p>
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Margem Média %</CardTitle>
              <Percent className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{formatPercentage(simulatedData.kpis.average_margin_percentage)}</div>
              <p className="text-xs text-muted-foreground mt-1">Média ponderada</p>
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Produtos Lucrativos</CardTitle>
              <Package className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{simulatedData.kpis.profitable_products || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">De {simulatedData.products.length} analisados</p>
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Receita Bruta</CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{formatCurrency(simulatedData.kpis.gross_revenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">Período selecionado</p>
            </CardContent>
          </MotionCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MotionCard variants={itemVariants} className="lg:col-span-2 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-slate-500" />
                Top 10 Produtos (Margem Absoluta)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              {loading ? <Skeleton className="w-full h-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProductsData} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" tickFormatter={(v) => `R$${v/1000}k`} tick={{fontSize: 11}} />
                    <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 11}} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar dataKey="Margem" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
                    <Bar dataKey="Receita" fill="#e2e8f0" radius={[0, 4, 4, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieIcon className="h-5 w-5 text-slate-500" />
                Distribuição de Margem
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] flex flex-col items-center justify-center">
              {loading ? <Skeleton className="w-full h-full rounded-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={MARGIN_COLORS[entry.name]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </MotionCard>
        </div>

        <MotionCard variants={itemVariants}>
          <CardHeader>
            <CardTitle>Detalhamento de Produtos</CardTitle>
            <CardDescription>Lista completa com indicadores de rentabilidade simulados</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader className="bg-slate-50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Receita Total</TableHead>
                    <TableHead className="text-right">Custo Est. ({costFactor}%)</TableHead>
                    <TableHead className="text-right">Margem R$</TableHead>
                    <TableHead className="text-right">Margem %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                    ))
                  ) : simulatedData.products.slice(0, 100).map((p, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-700">{p.product_name}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(p.total_revenue)}</TableCell>
                      <TableCell className="text-right font-mono text-slate-500">{formatCurrency(p.total_cost)}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold ${p.margin_value > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(p.margin_value)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={`${p.margin_percentage > 40 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-700'}`}>
                          {formatPercentage(p.margin_percentage)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </MotionCard>
      </motion.div>
    </AnalyticsTemplate>
  );
}
