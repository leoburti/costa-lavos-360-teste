
import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  Tag, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search,
  DollarSign,
  ScatterChart as ScatterIcon
} from 'lucide-react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  CartesianGrid 
} from 'recharts';

import AnalyticsTemplate from '@/components/analytics/AnalyticsTemplate';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDateForAPI, formatCurrency, formatPercentage } from '@/lib/utils';

const MotionCard = motion(Card);

export default function AnaliseValorUnitario() {
  const { filters } = useFilters();
  const [localSearch, setLocalSearch] = useState('');

  const params = useMemo(() => ({
    p_start_date: formatDateForAPI(filters.dateRange?.[0]),
    p_end_date: formatDateForAPI(filters.dateRange?.[1]),
    p_exclude_employees: filters.excludeEmployees,
    p_supervisors: filters.supervisors?.map(String),
    p_sellers: filters.sellers?.map(String),
    p_customer_groups: filters.customerGroups?.map(String),
    p_regions: filters.regions?.map(String),
    p_clients: filters.clients?.map(String),
    p_search_term: filters.searchTerm,
  }), [filters]);

  const { data, loading, refetch } = useAnalyticalData(
    'get_price_analysis',
    params,
    { enabled: !!params.p_start_date }
  );

  const products = useMemo(() => {
    if (!data?.priceVariation) return [];
    let list = data.priceVariation;
    if (localSearch) {
        list = list.filter(p => p.product.toLowerCase().includes(localSearch.toLowerCase()));
    }
    return list;
  }, [data, localSearch]);

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
      title="Análise de Valor Unitário"
      description="Monitoramento de consistência de preços e detecção de anomalias."
      onRefresh={refetch}
      loading={loading}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MotionCard variants={itemVariants} className="bg-slate-50 border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Preço Médio Global</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-200 rounded-full"><DollarSign className="h-6 w-6 text-slate-600" /></div>
                <div>
                  <div className="text-3xl font-bold text-slate-800">{formatCurrency(data?.kpis?.averageUnitPrice || 0)}</div>
                  <p className="text-xs text-slate-500">Todos os produtos</p>
                </div>
              </div>
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="bg-red-50 border-red-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Maior Variação (+)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full"><ArrowUpRight className="h-6 w-6 text-red-600" /></div>
                <div>
                  <div className="text-3xl font-bold text-red-700">{data?.kpis?.highestVariationPercent?.toFixed(1)}%</div>
                  <p className="text-xs text-red-600 truncate max-w-[150px]" title={data?.kpis?.productWithHighestVariation}>
                    {data?.kpis?.productWithHighestVariation || '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="bg-amber-50 border-amber-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-600">Maior Desconto (-)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-full"><ArrowDownRight className="h-6 w-6 text-amber-600" /></div>
                <div>
                  <div className="text-3xl font-bold text-amber-700">{formatCurrency(data?.kpis?.highestDiscountValue || 0)}</div>
                  <p className="text-xs text-amber-600 truncate max-w-[150px]" title={data?.kpis?.clientWithHighestDiscount}>
                    {data?.kpis?.clientWithHighestDiscount || '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </MotionCard>
        </div>

        {/* Chart Section */}
        <MotionCard variants={itemVariants} className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScatterIcon className="h-5 w-5 text-slate-500" />
              Dispersão de Preços
            </CardTitle>
            <CardDescription>Relação entre Variação de Preço e Volume de Receita</CardDescription>
          </CardHeader>
          <CardContent className="h-[450px]">
            {loading ? <Skeleton className="w-full h-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="category" dataKey="product" name="Produto" tick={false} label={{value: 'Produtos', position: 'insideBottom', offset: -10}} />
                  <YAxis type="number" dataKey="variationPercent" name="Variação %" unit="%" label={{value: 'Variação %', angle: -90, position: 'insideLeft'}} />
                  <ZAxis type="number" dataKey="totalRevenue" range={[60, 500]} name="Receita" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} 
                      content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                              const d = payload[0].payload;
                              return (
                                  <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm">
                                      <p className="font-bold text-slate-800 mb-1">{d.product}</p>
                                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                        <span className="text-slate-500">Variação:</span>
                                        <span className="font-semibold text-red-600">{d.variationPercent.toFixed(1)}%</span>
                                        <span className="text-slate-500">Mínimo:</span>
                                        <span className="font-mono">{formatCurrency(d.minPrice)}</span>
                                        <span className="text-slate-500">Máximo:</span>
                                        <span className="font-mono">{formatCurrency(d.maxPrice)}</span>
                                        <span className="text-slate-500">Receita:</span>
                                        <span className="font-mono text-slate-700">{formatCurrency(d.totalRevenue)}</span>
                                      </div>
                                  </div>
                              );
                          }
                          return null;
                      }}
                  />
                  <Scatter name="Produtos" data={products.slice(0, 50)} fill="#6366f1" fillOpacity={0.6} stroke="#4f46e5" />
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </MotionCard>

        {/* Data Table */}
        <MotionCard variants={itemVariants}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Detalhamento de Preços</CardTitle>
              <CardDescription>Análise granular por SKU</CardDescription>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                  placeholder="Buscar produto..." 
                  className="pl-9 bg-slate-50 border-slate-200" 
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader className="bg-slate-50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-[300px]">Produto</TableHead>
                    <TableHead className="text-right">Mínimo</TableHead>
                    <TableHead className="text-right">Médio</TableHead>
                    <TableHead className="text-right">Máximo</TableHead>
                    <TableHead className="text-right">Variação</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                    ))
                  ) : products.slice(0, 100).map((product, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-700">{product.product}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-green-600 bg-green-50 rounded px-2 py-1 w-fit inline-block ml-auto">
                        {formatCurrency(product.minPrice)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-slate-600">
                        {formatCurrency(product.avgPrice)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-red-600 bg-red-50 rounded px-2 py-1 w-fit inline-block ml-auto">
                        {formatCurrency(product.maxPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={product.variationPercent > 20 ? 'destructive' : 'secondary'} className="font-mono">
                          {product.variationPercent.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-slate-500 text-sm">
                        {formatCurrency(product.totalRevenue)}
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
