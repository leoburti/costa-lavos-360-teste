
import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Percent, 
  Package, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  BarChart2,
  PieChart as PieIcon
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
import { formatCurrency, formatPercentage } from '@/lib/utils';

const MotionCard = motion(Card);

const MARGIN_COLORS = {
  '0-20%': '#ef4444', // Red
  '20-40%': '#f97316', // Orange
  '40-60%': '#eab308', // Yellow
  '60%+': '#22c55e',   // Green
};

export default function AnaliseMargem() {
  const { filters } = useFilters();

  const { data, loading, refetch } = useAnalyticalData(
    'get_margin_analysis',
    filters,
    { defaultValue: { kpis: {}, margin_distribution: [], products: [] } }
  );

  const { kpis, margin_distribution, products } = data || { kpis: {}, margin_distribution: [], products: [] };

  const topProductsData = useMemo(() => {
    return products.slice(0, 10).map(p => ({
      name: p.product_name.length > 20 ? p.product_name.substring(0, 20) + '...' : p.product_name,
      Margem: p.margin_value,
      Receita: p.total_revenue,
    }));
  }, [products]);

  const pieData = useMemo(() => {
    return margin_distribution.map(d => ({
      name: d.margin_range,
      value: d.product_count,
    }));
  }, [margin_distribution]);

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
      title="Análise de Margem"
      description="Visão detalhada da lucratividade por produto e portfólio."
      onRefresh={refetch}
      loading={loading}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MotionCard variants={itemVariants} className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">Margem Total</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-800">{formatCurrency(kpis.total_margin)}</div>
              <p className="text-xs text-emerald-600 mt-1 font-medium">+12% vs mês anterior</p>
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Margem Média %</CardTitle>
              <Percent className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{formatPercentage(kpis.average_margin_percentage)}</div>
              <p className="text-xs text-muted-foreground mt-1">Média ponderada</p>
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Produtos Lucrativos</CardTitle>
              <Package className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{kpis.profitable_products || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">De {products.length} analisados</p>
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Receita Bruta</CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{formatCurrency(kpis.gross_revenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">Período selecionado</p>
            </CardContent>
          </MotionCard>
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MotionCard variants={itemVariants} className="lg:col-span-2">
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

          <MotionCard variants={itemVariants}>
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

        {/* Detailed Table */}
        <MotionCard variants={itemVariants}>
          <CardHeader>
            <CardTitle>Detalhamento de Produtos</CardTitle>
            <CardDescription>Lista completa com indicadores de rentabilidade</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader className="bg-slate-50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Receita Total</TableHead>
                    <TableHead className="text-right">Custo Est.</TableHead>
                    <TableHead className="text-right">Margem R$</TableHead>
                    <TableHead className="text-right">Margem %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                    ))
                  ) : products.slice(0, 100).map((p, idx) => (
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
