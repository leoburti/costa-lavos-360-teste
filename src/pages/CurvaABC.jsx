
import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Gem, 
  Star, 
  Target,
  Layers
} from 'lucide-react';
import { 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell, 
  ResponsiveContainer 
} from 'recharts';

import AnalyticsTemplate from '@/components/analytics/AnalyticsTemplate';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateForAPI, formatCurrency } from '@/lib/utils';

const MotionCard = motion(Card);

export default function CurvaABC() {
  const { filters } = useFilters();
  const [viewMode, setViewMode] = useState('all');

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

  const { data, loading, refetch } = useAnalyticalData(
    'get_projected_abc_analysis',
    params,
    { enabled: !!params.p_start_date }
  );

  const processedData = useMemo(() => {
    if (!data) return [];
    const flattened = [];
    ['A+', 'A', 'B', 'C', 'D', 'E'].forEach(curve => {
      if (data[curve]) {
        data[curve].clients.forEach(client => {
          flattened.push({ ...client, curve: curve, revenue: Number(client.revenue) });
        });
      }
    });
    return flattened.sort((a, b) => b.revenue - a.revenue);
  }, [data]);

  const filteredData = useMemo(() => {
    if (viewMode === 'all') return processedData;
    return processedData.filter(d => d.curve.startsWith(viewMode));
  }, [processedData, viewMode]);

  const paretoData = useMemo(() => {
    let accum = 0;
    const totalRevenue = processedData.reduce((sum, i) => sum + i.revenue, 0);
    return processedData.slice(0, 40).map(item => {
      accum += item.revenue;
      return {
        name: item.name,
        revenue: item.revenue,
        curve: item.curve,
        cumulative: (accum / totalRevenue) * 100
      };
    });
  }, [processedData]);

  const getColor = (curve) => {
    if (curve.startsWith('A')) return '#10b981'; // Emerald-500
    if (curve === 'B') return '#3b82f6'; // Blue-500
    return '#94a3b8'; // Slate-400
  };

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
      title="Curva ABC (Pareto)"
      description="Classificação estratégica de clientes por volume de receita (Princípio 80/20)."
      onRefresh={refetch}
      loading={loading}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MotionCard variants={itemVariants} className="border-t-4 border-t-emerald-500 shadow-md hover:-translate-y-1 transition-transform duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-bold text-emerald-700">Classe A</CardTitle>
                <CardDescription className="text-emerald-600/80">Alta Relevância (80% Rec.)</CardDescription>
              </div>
              <div className="p-2 bg-emerald-100 rounded-full"><Gem className="h-6 w-6 text-emerald-600" /></div>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-12 w-3/4" /> : (
                <>
                  <div className="text-3xl font-bold text-slate-800 mb-1">{data?.['A']?.client_count || 0} <span className="text-base font-normal text-slate-500">clientes</span></div>
                  <p className="text-sm font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded">
                    Total: {formatCurrency(data?.['A']?.total_revenue)}
                  </p>
                </>
              )}
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="border-t-4 border-t-blue-500 shadow-md hover:-translate-y-1 transition-transform duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-bold text-blue-700">Classe B</CardTitle>
                <CardDescription className="text-blue-600/80">Média Relevância (15% Rec.)</CardDescription>
              </div>
              <div className="p-2 bg-blue-100 rounded-full"><Star className="h-6 w-6 text-blue-600" /></div>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-12 w-3/4" /> : (
                <>
                  <div className="text-3xl font-bold text-slate-800 mb-1">{data?.['B']?.client_count || 0} <span className="text-base font-normal text-slate-500">clientes</span></div>
                  <p className="text-sm font-medium text-blue-600 bg-blue-50 w-fit px-2 py-0.5 rounded">
                    Total: {formatCurrency(data?.['B']?.total_revenue)}
                  </p>
                </>
              )}
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="border-t-4 border-t-slate-400 shadow-md hover:-translate-y-1 transition-transform duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-bold text-slate-700">Classe C</CardTitle>
                <CardDescription className="text-slate-500">Baixa Relevância (5% Rec.)</CardDescription>
              </div>
              <div className="p-2 bg-slate-100 rounded-full"><Layers className="h-6 w-6 text-slate-600" /></div>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-12 w-3/4" /> : (
                <>
                  <div className="text-3xl font-bold text-slate-800 mb-1">{data?.['C']?.client_count || 0} <span className="text-base font-normal text-slate-500">clientes</span></div>
                  <p className="text-sm font-medium text-slate-600 bg-slate-100 w-fit px-2 py-0.5 rounded">
                    Total: {formatCurrency(data?.['C']?.total_revenue)}
                  </p>
                </>
              )}
            </CardContent>
          </MotionCard>
        </div>

        {/* Pareto Chart */}
        <MotionCard variants={itemVariants} className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-slate-500" />
              Gráfico de Pareto
            </CardTitle>
            <CardDescription>Top 40 Clientes e Acumulado</CardDescription>
          </CardHeader>
          <CardContent className="h-[450px]">
            {loading ? <Skeleton className="w-full h-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={paretoData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" scale="band" tick={false} label={{ value: 'Clientes (Top 40)', position: 'insideBottom', offset: -10 }} />
                  <YAxis yAxisId="left" tickFormatter={(val) => `R$${val/1000}k`} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(val) => `${val}%`} domain={[0, 100]} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: 'none' }}
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(value) : `${Number(value).toFixed(1)}%`, 
                      name === 'revenue' ? 'Receita' : 'Acumulado'
                    ]}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Bar yAxisId="left" dataKey="revenue" name="Receita" barSize={24} radius={[4, 4, 0, 0]}>
                    {paretoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColor(entry.curve)} />
                    ))}
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="cumulative" name="% Acumulado" stroke="#334155" strokeWidth={3} dot={{r: 3, fill: '#334155'}} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </MotionCard>

        {/* Data Table */}
        <MotionCard variants={itemVariants}>
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle>Detalhamento por Cliente</CardTitle>
              <CardDescription>Listagem completa classificada</CardDescription>
            </div>
            <div className="flex gap-2">
              {['all', 'A', 'B', 'C'].map(mode => (
                <Button 
                  key={mode}
                  variant={viewMode === mode ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className={viewMode === mode ? "bg-slate-900" : "text-slate-600 hover:bg-slate-100"}
                >
                  {mode === 'all' ? 'Todos' : `Classe ${mode}`}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-hidden rounded-b-xl">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow>
                    <TableHead className="w-[400px]">Cliente</TableHead>
                    <TableHead className="text-right">Receita Projetada</TableHead>
                    <TableHead className="text-center w-[150px]">Classe</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-12 mx-auto rounded-full" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredData.slice(0, 100).map((item, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-700">{item.name}</TableCell>
                      <TableCell className="text-right font-mono text-slate-600">{formatCurrency(item.revenue)}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={`
                          font-bold text-xs px-3
                          ${item.curve.startsWith('A') ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200' : 
                            item.curve === 'B' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200' : 
                            'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'}
                        `}>
                          {item.curve}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredData.length > 100 && (
                <div className="p-4 text-center text-xs font-medium text-muted-foreground bg-slate-50 border-t">
                  Exibindo os top 100 clientes de {filteredData.length} encontrados.
                </div>
              )}
            </div>
          </CardContent>
        </MotionCard>
      </motion.div>
    </AnalyticsTemplate>
  );
}
