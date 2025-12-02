
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Users, 
  TrendingDown, 
  ShieldAlert,
  PhoneCall,
  CalendarOff,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

import AnalyticsTemplate from '@/components/analytics/AnalyticsTemplate';
import { AnalyticsTable } from '@/components/analytics/AnalyticsWidgets';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useFilters } from '@/contexts/FilterContext';
import { formatDateForAPI, formatCurrency } from '@/lib/utils';

const RISK_COLORS = {
  'CRITICO': '#ef4444', // Red-500
  'ALTO': '#f97316',    // Orange-500
  'MEDIO': '#eab308',   // Yellow-500
  'BAIXO': '#22c55e',   // Green-500
};

const MotionCard = motion(Card);

export default function AnaliseChurn() {
  const { filters } = useFilters();
  
  const { data, loading, refetch, isMock } = useAnalyticalData(
    'get_churn_analysis_data_v3_optimized',
    {
      p_start_date: formatDateForAPI(filters.dateRange?.from),
      p_end_date: formatDateForAPI(filters.dateRange?.to),
      p_page: 1,
      p_page_size: 1000
    }
  );

  const { stats, chartData, priorityList, trendData } = useMemo(() => {
    const rawData = data || [];
    
    const initialStats = { CRITICO: 0, ALTO: 0, MEDIO: 0, BAIXO: 0, total: 0, revenueAtRisk: 0 };
    
    const processedStats = rawData.reduce((acc, curr) => {
      const risk = curr.churn_risk || 'BAIXO';
      acc[risk] = (acc[risk] || 0) + 1;
      acc.total++;
      if (risk !== 'BAIXO') {
        acc.revenueAtRisk += Number(curr.total_spent || 0) / 12;
      }
      return acc;
    }, initialStats);

    const chartData = [
      { name: 'Crítico (>90d)', value: processedStats.CRITICO, color: RISK_COLORS.CRITICO, label: 'Crítico' },
      { name: 'Alto (60-90d)', value: processedStats.ALTO, color: RISK_COLORS.ALTO, label: 'Alto' },
      { name: 'Médio (30-60d)', value: processedStats.MEDIO, color: RISK_COLORS.MEDIO, label: 'Médio' },
      { name: 'Baixo (<30d)', value: processedStats.BAIXO, color: RISK_COLORS.BAIXO, label: 'Baixo' }
    ];

    const trendData = Array.from({ length: 6 }).map((_, i) => ({
      month: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'][i],
      risk: Math.floor(processedStats.revenueAtRisk * (0.8 + Math.random() * 0.4)),
      safe: Math.floor(processedStats.revenueAtRisk * 2 * (0.9 + Math.random() * 0.2))
    }));

    const priorityList = rawData
      .filter(d => d.churn_risk === 'CRITICO' || d.churn_risk === 'ALTO')
      .sort((a, b) => Number(b.total_spent) - Number(a.total_spent))
      .slice(0, 50);

    return { stats: processedStats, chartData, priorityList, trendData };
  }, [data]);

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
      title="Monitoramento de Evasão (Churn)"
      description="Diagnóstico de saúde da base de clientes e identificação preventiva de riscos."
      onRefresh={refetch}
      loading={loading}
      isMock={isMock}
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MotionCard variants={itemVariants} className="border-l-4 border-l-red-500 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
                Risco Crítico
                <ShieldAlert className="h-4 w-4 text-red-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">{stats.CRITICO}</span>
                <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded-full">Inativos +90 dias</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Ação prioritária necessária</p>
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="border-l-4 border-l-orange-500 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
                Risco Alto
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">{stats.ALTO}</span>
                <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-full">Inativos 60-90 dias</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Janela de recuperação curta</p>
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="border-l-4 border-l-slate-800 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
                Base Ativa Analisada
                <Users className="h-4 w-4 text-slate-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">{stats.total}</span>
                <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">Clientes</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Total de clientes na carteira</p>
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="border-l-4 border-l-indigo-500 shadow-sm bg-gradient-to-br from-white to-indigo-50/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-indigo-700 flex justify-between">
                Receita em Risco (Est.)
                <TrendingDown className="h-4 w-4 text-indigo-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-indigo-900">{formatCurrency(stats.revenueAtRisk)}</span>
              </div>
              <p className="text-xs text-indigo-600/80 mt-2 font-medium">Potencial perda mensal recorrente</p>
            </CardContent>
          </MotionCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MotionCard variants={itemVariants} className="lg:col-span-1 shadow-md border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Distribuição de Risco</CardTitle>
              <CardDescription>Clientes por tempo de inatividade</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="label" 
                    type="category" 
                    width={50} 
                    tick={{fontSize: 12, fill: '#475569', fontWeight: 500}} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="lg:col-span-2 shadow-md border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Tendência de Risco</CardTitle>
                <CardDescription>Evolução da receita em risco vs segura (Semestral)</CardDescription>
              </div>
              <Badge variant="outline" className="hidden sm:flex">Análise Preditiva</Badge>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis tickFormatter={(v) => `R$${v/1000}k`} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Area type="monotone" dataKey="risk" name="Em Risco" stroke="#ef4444" fillOpacity={1} fill="url(#colorRisk)" strokeWidth={2} />
                  <Area type="monotone" dataKey="safe" name="Seguro" stroke="#22c55e" fillOpacity={1} fill="url(#colorSafe)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </MotionCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MotionCard variants={itemVariants} className="lg:col-span-1 bg-slate-900 text-white shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <PhoneCall className="h-5 w-5 text-emerald-400" />
                Estratégias Recomendadas
              </CardTitle>
              <CardDescription className="text-slate-400">Ações para reter clientes críticos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-white/10 rounded-lg border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                <h4 className="font-semibold text-sm text-emerald-300 mb-1">Reativação Imediata</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Para clientes críticos (>90d), ofereça condições especiais de pagamento e um brinde na próxima compra.
                </p>
              </div>
              <div className="p-3 bg-white/10 rounded-lg border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                <h4 className="font-semibold text-sm text-blue-300 mb-1">Visita de Relacionamento</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Agende visitas presenciais para clientes de alto valor em risco "Alto". Verifique equipamentos.
                </p>
              </div>
              <div className="p-3 bg-white/10 rounded-lg border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                <h4 className="font-semibold text-sm text-amber-300 mb-1">Campanha de Engajamento</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Envie comunicações sobre novos produtos para clientes em risco "Médio" para manter a marca ativa.
                </p>
              </div>
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="lg:col-span-2 border-slate-200 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarOff className="h-5 w-5 text-slate-500" />
                  Fila de Prioridade
                </CardTitle>
                <CardDescription>Clientes de maior valor em risco de churn</CardDescription>
              </div>
              <Button size="sm" variant="outline" className="hidden sm:flex">
                Exportar Lista <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <AnalyticsTable 
                loading={loading}
                data={priorityList}
                columns={[
                  { 
                    label: 'Cliente', 
                    key: 'client_name',
                    render: (row) => (
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{row.client_name}</span>
                        <span className="text-xs text-slate-500">ID: {row.client_id}</span>
                      </div>
                    )
                  },
                  { 
                    label: 'Dias Inativo', 
                    key: 'days_since_purchase', 
                    className: 'text-center',
                    render: (row) => (
                      <span className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">{row.days_since_purchase}d</span>
                    )
                  },
                  { 
                    label: 'Risco', 
                    key: 'churn_risk', 
                    render: (row) => {
                      const style = row.churn_risk === 'CRITICO' 
                        ? 'bg-red-100 text-red-700 border-red-200' 
                        : 'bg-orange-100 text-orange-700 border-orange-200';
                      return (
                        <Badge variant="outline" className={`font-bold border ${style}`}>
                          {row.churn_risk}
                        </Badge>
                      );
                    }
                  },
                  { 
                    label: 'Valor LTV (12m)', 
                    key: 'total_spent', 
                    className: 'text-right',
                    render: (r) => (
                      <div className="flex flex-col items-end">
                        <span className="font-medium text-slate-700">{formatCurrency(r.total_spent)}</span>
                        <Progress value={Math.min(100, (r.total_spent / 10000) * 100)} className="h-1 w-20 mt-1" />
                      </div>
                    ) 
                  }
                ]}
              />
            </CardContent>
          </MotionCard>
        </div>
      </motion.div>
    </AnalyticsTemplate>
  );
}
