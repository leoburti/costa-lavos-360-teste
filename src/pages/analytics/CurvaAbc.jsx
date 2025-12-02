
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Gem, 
  Star, 
  Target,
  Layers,
  Info
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

export default function CurvaAbc() {
  const { filters } = useFilters();
  const [viewMode, setViewMode] = useState('all');

  const params = useMemo(() => ({
    // CORREÇÃO: Usar .from e .to em vez de array index para o dateRange do shadcn/ui
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
    'get_projected_abc_analysis',
    params,
    { enabled: !!params.p_start_date }
  );

  const processedData = useMemo(() => {
    if (!data) return [];
    const flattened = [];
    ['A+', 'A', 'B', 'C', 'D', 'E'].forEach(curve => {
      if (data[curve] && data[curve].clients) {
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
    if (processedData.length === 0) return [];
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
    if (curve === 'A+') return '#059669';
    if (curve === 'A') return '#10b981';
    if (curve === 'B') return '#f59e0b';
    if (curve === 'C') return '#f97316';
    return '#ef4444';
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
      title="Classificação Estratégica (Curva ABC)"
      description="Análise de Pareto da carteira: foque esforços nos clientes que geram 80% da receita."
      onRefresh={refetch}
      loading={loading}
      isMock={isMock}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <MotionCard variants={itemVariants} className="border-l-4 border-l-emerald-600 shadow-sm bg-emerald-50/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                <Gem className="h-4 w-4" />
                Classe A+ & A
              </CardTitle>
              <CardDescription>Alta Relevância ({'>'}R$25k)</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-24" /> : (
                <>
                  <div className="text-2xl font-bold text-slate-800">
                    {(data?.['A+']?.client_count || 0) + (data?.['A']?.client_count || 0)}
                    <span className="text-xs font-normal text-muted-foreground ml-1">clientes</span>
                  </div>
                  <div className="text-xs font-medium text-emerald-700 mt-1">
                    {formatCurrency((data?.['A+']?.total_revenue || 0) + (data?.['A']?.total_revenue || 0))}
                  </div>
                </>
              )}
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="border-l-4 border-l-amber-500 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-amber-800 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Classe B
              </CardTitle>
              <CardDescription>Média Relevância ({'>'}R$15k)</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-24" /> : (
                <>
                  <div className="text-2xl font-bold text-slate-800">
                    {data?.['B']?.client_count || 0}
                    <span className="text-xs font-normal text-muted-foreground ml-1">clientes</span>
                  </div>
                  <div className="text-xs font-medium text-amber-700 mt-1">
                    {formatCurrency(data?.['B']?.total_revenue || 0)}
                  </div>
                </>
              )}
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="border-l-4 border-l-orange-500 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-orange-800 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Classe C
              </CardTitle>
              <CardDescription>Em Crescimento ({'>'}R$8k)</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-24" /> : (
                <>
                  <div className="text-2xl font-bold text-slate-800">
                    {data?.['C']?.client_count || 0}
                    <span className="text-xs font-normal text-muted-foreground ml-1">clientes</span>
                  </div>
                  <div className="text-xs font-medium text-orange-700 mt-1">
                    {formatCurrency(data?.['C']?.total_revenue || 0)}
                  </div>
                </>
              )}
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="border-l-4 border-l-slate-400 shadow-sm bg-slate-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Cauda Longa (D/E)
              </CardTitle>
              <CardDescription>Baixo Volume</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-24" /> : (
                <>
                  <div className="text-2xl font-bold text-slate-800">
                    {(data?.['D']?.client_count || 0) + (data?.['E']?.client_count || 0)}
                    <span className="text-xs font-normal text-muted-foreground ml-1">clientes</span>
                  </div>
                  <div className="text-xs font-medium text-slate-600 mt-1">
                    {formatCurrency((data?.['D']?.total_revenue || 0) + (data?.['E']?.total_revenue || 0))}
                  </div>
                </>
              )}
            </CardContent>
          </MotionCard>
        </div>

        <MotionCard variants={itemVariants} className="shadow-md border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-slate-500" />
              Análise de Pareto (Top 40)
            </CardTitle>
            <CardDescription>Concentração de receita nos principais clientes</CardDescription>
          </CardHeader>
          <CardContent className="h-[450px]">
            {loading ? <Skeleton className="w-full h-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={paretoData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" scale="band" tick={false} label={{ value: 'Clientes (Top 40)', position: 'insideBottom', offset: -10, fill: '#94a3b8' }} />
                  <YAxis yAxisId="left" tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(val) => `${val.toFixed(0)}%`} domain={[0, 100]} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
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
                  <Line yAxisId="right" type="monotone" dataKey="cumulative" name="% Acumulado" stroke="#334155" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </MotionCard>

        <MotionCard variants={itemVariants}>
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4 space-y-0">
            <div>
              <CardTitle>Detalhamento por Cliente</CardTitle>
              <CardDescription>Gestão da carteira por relevância</CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              {['all', 'A', 'B', 'C'].map(mode => (
                <Button 
                  key={mode}
                  variant={viewMode === mode ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className={viewMode === mode ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}
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
                    <TableHead className="text-right">Ação Sugerida</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-12 mx-auto rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredData.slice(0, 100).map((item, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-700">{item.name}</TableCell>
                      <TableCell className="text-right font-mono text-slate-600">{formatCurrency(item.revenue)}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={`
                          font-bold text-xs px-3 border
                          ${item.curve.startsWith('A') ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                            item.curve === 'B' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                            item.curve === 'C' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'}
                        `}>
                          {item.curve}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {item.curve.startsWith('A') ? 'Blindagem & Relacionamento' : 
                         item.curve === 'B' ? 'Potencial de Upsell' : 
                         'Monitoramento Automatizado'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredData.length > 100 && (
                <div className="p-4 text-center text-xs font-medium text-muted-foreground bg-slate-50 border-t flex items-center justify-center gap-2">
                  <Info className="h-3 w-3" />
                  Exibindo os top 100 clientes de {filteredData.length} encontrados nesta categoria.
                </div>
              )}
            </div>
          </CardContent>
        </MotionCard>
      </motion.div>
    </AnalyticsTemplate>
  );
}
