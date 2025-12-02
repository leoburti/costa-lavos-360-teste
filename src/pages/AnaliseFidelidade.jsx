
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Target, 
  UserCheck, 
  UserX, 
  Award,
  TrendingUp
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

import AnalyticsTemplate from '@/components/analytics/AnalyticsTemplate';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber, formatPercentage } from '@/lib/utils';

const MotionCard = motion(Card);

export default function AnaliseFidelidade() {
  const { filters } = useFilters();

  const { data, loading, refetch } = useAnalyticalData(
    'get_loyalty_analysis',
    filters
  );

  const kpis = data?.kpis || {};
  const clients = data?.clients || [];

  // Prepare Chart Data
  const distributionData = [
    { name: 'Alta Fidelidade (>100%)', value: clients.filter(c => c.loyalty_score >= 100).length, color: '#22c55e' },
    { name: 'Média (70-99%)', value: clients.filter(c => c.loyalty_score >= 70 && c.loyalty_score < 100).length, color: '#3b82f6' },
    { name: 'Baixa (<70%)', value: clients.filter(c => c.loyalty_score < 70).length, color: '#ef4444' },
  ];

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
      title="Análise de Fidelidade (RFM)"
      description="Avaliação de aderência às metas de compra e engajamento da carteira."
      onRefresh={refetch}
      loading={loading}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        
        {/* KPI Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MotionCard variants={itemVariants} className="relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10"><ShieldCheck size={64} /></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Índice Médio de Fidelidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{formatPercentage(kpis.average_loyalty_score || 0)}</div>
              <Progress value={kpis.average_loyalty_score || 0} className="h-2 mt-3 bg-slate-100" indicatorClassName="bg-blue-600" />
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Clientes com Meta</CardTitle>
              <Target className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{formatNumber(kpis.total_clients_with_target || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">Definidos no sistema</p>
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="bg-green-50 border-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Acima da Meta</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">{formatNumber(kpis.clients_above_target || 0)}</div>
              <p className="text-xs text-green-600 mt-1 font-medium">Performance Excelente</p>
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="bg-red-50 border-red-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Abaixo da Meta</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700">{formatNumber(kpis.clients_below_target || 0)}</div>
              <p className="text-xs text-red-600 mt-1 font-medium">Requer Atenção</p>
            </CardContent>
          </MotionCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <MotionCard variants={itemVariants} className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-500" />
                Distribuição de Fidelidade
              </CardTitle>
              <CardDescription>Clientes por faixa de atingimento</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              {loading ? (
                <Skeleton className="w-full h-full rounded-lg" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData} layout="vertical" margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 11}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </MotionCard>

          {/* Table Section */}
          <MotionCard variants={itemVariants} className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Detalhamento por Cliente</CardTitle>
              <CardDescription>Acompanhamento individual de metas (KG/Dia)</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader className="bg-slate-50 sticky top-0 z-10">
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead className="text-right">Meta (KG)</TableHead>
                      <TableHead className="text-right">Realizado</TableHead>
                      <TableHead className="w-[200px]">Aderência</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        </TableRow>
                      ))
                    ) : clients.length > 0 ? (
                      clients.map((client, index) => (
                        <TableRow key={index} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell>
                            <div className="font-medium text-slate-800">{client.client_name}</div>
                            <div className="text-xs text-slate-500">ID: {client.client_code}</div>
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm">{client.seller_name}</TableCell>
                          <TableCell className="text-right font-mono text-slate-600">{formatNumber(client.target_kg_day)}</TableCell>
                          <TableCell className="text-right font-mono font-medium">{formatNumber(client.actual_kg_per_effective_day)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between text-xs mb-1">
                                <span className={client.loyalty_score >= 100 ? 'text-green-600 font-bold' : 'text-slate-600'}>
                                  {formatPercentage(client.loyalty_score)}
                                </span>
                              </div>
                              <Progress 
                                value={Math.min(client.loyalty_score, 100)} 
                                className="h-2" 
                                indicatorClassName={client.loyalty_score >= 100 ? 'bg-green-500' : client.loyalty_score < 70 ? 'bg-red-500' : 'bg-blue-500'}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                          Nenhum dado encontrado para os filtros aplicados.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </MotionCard>
        </div>
      </motion.div>
    </AnalyticsTemplate>
  );
}
