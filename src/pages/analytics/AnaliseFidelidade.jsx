
import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Heart, 
  AlertCircle, 
  UserPlus
} from 'lucide-react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

import AnalyticsTemplate from '@/components/analytics/AnalyticsTemplate';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { formatCurrency, formatDateForAPI } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const MotionCard = motion(Card);

const SEGMENT_COLORS = {
  'Campeões': '#8b5cf6',
  'Clientes Fiéis': '#22c55e',
  'Potenciais Fiéis': '#3b82f6',
  'Novos Clientes': '#06b6d4',
  'Promissores': '#eab308',
  'Precisam de Atenção': '#f97316',
  'Em Risco': '#ef4444',
  'Hibernando': '#64748b'
};

export default function AnaliseFidelidade() {
  const { filters } = useFilters();

  const params = useMemo(() => ({
    p_start_date: formatDateForAPI(filters.dateRange?.from),
    p_end_date: formatDateForAPI(filters.dateRange?.to),
    p_exclude_employees: filters.excludeEmployees,
    p_supervisors: filters.supervisors?.length > 0 ? filters.supervisors : null,
    p_sellers: filters.sellers?.length > 0 ? filters.sellers : null,
    p_customer_groups: filters.customerGroups?.length > 0 ? filters.customerGroups : null,
    p_regions: filters.regions?.length > 0 ? filters.regions : null,
    p_clients: filters.clients?.length > 0 ? filters.clients : null,
    p_search_term: filters.searchTerm || null,
  }), [filters]);

  const { data, loading, refetch, isMock } = useAnalyticalData(
    'get_rfm_analysis',
    params,
    { enabled: !!params.p_start_date }
  );

  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data.map(d => ({
      ...d,
      fill: SEGMENT_COLORS[d.segment] || '#cbd5e1',
      recency: Number(d.recency),
      frequency: Number(d.frequency),
      monetary: Number(d.monetary)
    }));
  }, [data]);

  const segmentsSummary = useMemo(() => {
    const summary = {};
    processedData.forEach(d => {
      if (!summary[d.segment]) {
        summary[d.segment] = { count: 0, revenue: 0, clients: [] };
      }
      summary[d.segment].count += 1;
      summary[d.segment].revenue += d.monetary;
      summary[d.segment].clients.push(d);
    });
    return summary;
  }, [processedData]);

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
      title="Matriz de Fidelidade (RFM)"
      description="Segmentação estratégica baseada em Recência, Frequência e Valor Monetário."
      onRefresh={refetch}
      loading={loading}
      isMock={isMock}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MotionCard variants={itemVariants} className="bg-violet-50 border-violet-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-violet-700 flex justify-between items-center">
                Clientes Ouro (Campeões)
                <Crown className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-violet-900">
                {segmentsSummary['Campeões']?.count || 0}
              </div>
              <p className="text-xs text-violet-600 mt-1">
                {formatCurrency(segmentsSummary['Campeões']?.revenue || 0)} em receita
              </p>
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="bg-green-50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700 flex justify-between items-center">
                Leais & Fiéis
                <Heart className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {(segmentsSummary['Clientes Fiéis']?.count || 0) + (segmentsSummary['Potenciais Fiéis']?.count || 0)}
              </div>
              <p className="text-xs text-green-600 mt-1">Alta frequência de compra</p>
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 flex justify-between items-center">
                Novos & Promissores
                <UserPlus className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                {(segmentsSummary['Novos Clientes']?.count || 0) + (segmentsSummary['Promissores']?.count || 0)}
              </div>
              <p className="text-xs text-blue-600 mt-1">Potencial de crescimento</p>
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="bg-red-50 border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-700 flex justify-between items-center">
                Em Risco
                <AlertCircle className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900">
                {(segmentsSummary['Em Risco']?.count || 0) + (segmentsSummary['Hibernando']?.count || 0)}
              </div>
              <p className="text-xs text-red-600 mt-1">Requerem reativação</p>
            </CardContent>
          </MotionCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MotionCard variants={itemVariants} className="lg:col-span-2 shadow-md border-slate-200">
            <CardHeader>
              <CardTitle>Matriz RFM Interativa</CardTitle>
              <CardDescription>Distribuição de clientes: Recência (Dias) vs Frequência (Pedidos)</CardDescription>
            </CardHeader>
            <CardContent className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="recency" 
                    name="Recência" 
                    unit=" dias" 
                    label={{ value: 'Dias desde a última compra', position: 'bottom', offset: 0 }}
                    reversed 
                  />
                  <YAxis 
                    type="number" 
                    dataKey="frequency" 
                    name="Frequência" 
                    unit=" pedidos" 
                    label={{ value: 'Quantidade de Pedidos', angle: -90, position: 'insideLeft' }}
                  />
                  <ZAxis type="number" dataKey="monetary" range={[50, 600]} name="Valor Total" unit=" R$" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm">
                            <p className="font-bold text-slate-800 mb-1">{d.clientName}</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
                              <span>Segmento:</span> <span className="font-semibold" style={{color: d.fill}}>{d.segment}</span>
                              <span>Recência:</span> <span>{d.recency} dias</span>
                              <span>Frequência:</span> <span>{d.frequency} pedidos</span>
                              <span>Valor:</span> <span className="font-mono text-slate-800">{formatCurrency(d.monetary)}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  {Object.keys(SEGMENT_COLORS).map(segment => (
                    <Scatter 
                      key={segment} 
                      name={segment} 
                      data={processedData.filter(d => d.segment === segment)} 
                      fill={SEGMENT_COLORS[segment]} 
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="lg:col-span-1 shadow-md border-slate-200">
            <CardHeader>
              <CardTitle>Detalhes por Segmento</CardTitle>
              <CardDescription>Lista de clientes e ações sugeridas</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="champions" className="w-full">
                <div className="px-4 mb-2">
                  <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="champions">Ouro</TabsTrigger>
                    <TabsTrigger value="promising">Prata</TabsTrigger>
                    <TabsTrigger value="risk">Risco</TabsTrigger>
                  </TabsList>
                </div>
                
                <ScrollArea className="h-[350px]">
                  <TabsContent value="champions" className="mt-0">
                    <div className="p-4 pt-0 space-y-3">
                      <div className="bg-violet-50 p-3 rounded-md text-xs text-violet-700 mb-2">
                        <strong>Ação:</strong> Ofereça acesso antecipado a novos produtos e programa de fidelidade VIP.
                      </div>
                      {segmentsSummary['Campeões']?.clients.sort((a,b) => b.monetary - a.monetary).map((client, idx) => (
                        <div key={idx} className="flex items-center justify-between border-b pb-2 last:border-0">
                          <div>
                            <p className="font-medium text-sm text-slate-800">{client.clientName}</p>
                            <p className="text-xs text-slate-500">{client.frequency} compras • {client.recency}d atrás</p>
                          </div>
                          <span className="font-bold text-sm text-violet-600">{formatCurrency(client.monetary)}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="promising" className="mt-0">
                    <div className="p-4 pt-0 space-y-3">
                      <div className="bg-blue-50 p-3 rounded-md text-xs text-blue-700 mb-2">
                        <strong>Ação:</strong> Sugira upsell baseado no histórico e ofereça descontos progressivos.
                      </div>
                      {[...(segmentsSummary['Promissores']?.clients || []), ...(segmentsSummary['Novos Clientes']?.clients || [])].slice(0, 20).map((client, idx) => (
                        <div key={idx} className="flex items-center justify-between border-b pb-2 last:border-0">
                          <div>
                            <p className="font-medium text-sm text-slate-800">{client.clientName}</p>
                            <p className="text-xs text-slate-500">{client.frequency} compras • {client.recency}d atrás</p>
                          </div>
                          <span className="font-bold text-sm text-blue-600">{formatCurrency(client.monetary)}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="risk" className="mt-0">
                    <div className="p-4 pt-0 space-y-3">
                      <div className="bg-red-50 p-3 rounded-md text-xs text-red-700 mb-2">
                        <strong>Ação:</strong> Entre em contato para entender motivos da inatividade. Oferta de reconquista.
                      </div>
                      {[...(segmentsSummary['Em Risco']?.clients || []), ...(segmentsSummary['Hibernando']?.clients || [])].slice(0, 20).map((client, idx) => (
                        <div key={idx} className="flex items-center justify-between border-b pb-2 last:border-0">
                          <div>
                            <p className="font-medium text-sm text-slate-800">{client.clientName}</p>
                            <p className="text-xs text-slate-500">{client.frequency} compras • {client.recency}d atrás</p>
                          </div>
                          <span className="font-bold text-sm text-red-600">{formatCurrency(client.monetary)}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </CardContent>
          </MotionCard>
        </div>
      </motion.div>
    </AnalyticsTemplate>
  );
}
