
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  UserMinus, 
  Users, 
  TrendingDown, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  CartesianGrid 
} from 'recharts';

import AnalyticsTemplate from '@/components/analytics/AnalyticsTemplate';
import ChartContainer from '@/components/analytics/ChartContainer';
import { AnalyticsTable } from '@/components/analytics/AnalyticsWidgets';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { useFilters } from '@/contexts/FilterContext';
import { formatDateForAPI, formatCurrency } from '@/lib/utils';

// --- Configuration ---
const RISK_COLORS = {
  'CRITICO': '#ef4444', // Red-500
  'ALTO': '#f97316',    // Orange-500
  'MEDIO': '#eab308',   // Yellow-500
  'BAIXO': '#22c55e',   // Green-500
};

const MotionCard = motion(Card);

export default function AnaliseChurn() {
  const { filters } = useFilters();
  
  const { data, isLoading, refetch } = useAnalyticsData(
    'get_churn_analysis_data_v3_optimized',
    {
      p_start_date: formatDateForAPI(filters.dateRange?.[0]),
      p_end_date: formatDateForAPI(filters.dateRange?.[1]),
      p_page: 1,
      p_page_size: 100
    },
    { fallbackOnError: true }
  );

  // --- Data Processing ---
  const churnStats = (data || []).reduce((acc, curr) => {
    const risk = curr.churn_risk || 'BAIXO';
    acc[risk] = (acc[risk] || 0) + 1;
    acc.total++;
    acc.totalLoss += Number(curr.total_spent || 0);
    return acc;
  }, { CRITICO: 0, ALTO: 0, MEDIO: 0, BAIXO: 0, total: 0, totalLoss: 0 });

  const chartData = [
    { name: 'Crítico (>90d)', value: churnStats.CRITICO, color: RISK_COLORS.CRITICO, label: 'Crítico' },
    { name: 'Alto (60-90d)', value: churnStats.ALTO, color: RISK_COLORS.ALTO, label: 'Alto' },
    { name: 'Médio (30-60d)', value: churnStats.MEDIO, color: RISK_COLORS.MEDIO, label: 'Médio' },
    { name: 'Baixo (<30d)', value: churnStats.BAIXO, color: RISK_COLORS.BAIXO, label: 'Baixo' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <AnalyticsTemplate
      title="Análise de Churn e Retenção"
      description="Identifique clientes em risco de evasão e monitore a saúde da carteira."
      onRefresh={refetch}
      loading={isLoading}
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* KPI Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MotionCard variants={itemVariants} className="border-l-4 border-l-red-500 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Risco Crítico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-red-600">{churnStats.CRITICO}</span>
                <span className="text-xs text-muted-foreground">clientes</span>
              </div>
              <div className="mt-3 flex items-center text-xs text-red-600 bg-red-50 w-fit px-2 py-1 rounded-full font-medium">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Ação Imediata
              </div>
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="border-l-4 border-l-orange-500 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Risco Alto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-orange-600">{churnStats.ALTO}</span>
                <span className="text-xs text-muted-foreground">clientes</span>
              </div>
              <div className="mt-3 flex items-center text-xs text-orange-600 bg-orange-50 w-fit px-2 py-1 rounded-full font-medium">
                <UserMinus className="h-3 w-3 mr-1" />
                Monitorar
              </div>
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="border-l-4 border-l-slate-400 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Clientes Analisados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-700">{churnStats.total}</span>
                <span className="text-xs text-muted-foreground">total</span>
              </div>
              <div className="mt-3 flex items-center text-xs text-slate-600 bg-slate-100 w-fit px-2 py-1 rounded-full font-medium">
                <Users className="h-3 w-3 mr-1" />
                Base Ativa
              </div>
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="border-l-4 border-l-indigo-500 shadow-sm bg-indigo-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-indigo-700">Receita em Risco (Estimada)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-indigo-700">{formatCurrency(churnStats.totalLoss)}</span>
              </div>
              <div className="mt-3 flex items-center text-xs text-indigo-600 bg-indigo-100 w-fit px-2 py-1 rounded-full font-medium">
                <TrendingDown className="h-3 w-3 mr-1" />
                Impacto Potencial
              </div>
            </CardContent>
          </MotionCard>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Risk Distribution Chart */}
          <MotionCard variants={itemVariants} className="lg:col-span-1 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-slate-500" />
                Distribuição de Risco
              </CardTitle>
              <CardDescription>Clientes por tempo de inatividade</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="label" 
                    type="category" 
                    width={60} 
                    tick={{fontSize: 12, fill: '#6b7280', fontWeight: 500}} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={32}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </MotionCard>

          {/* Details Table */}
          <MotionCard variants={itemVariants} className="lg:col-span-2 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Clientes em Risco</CardTitle>
                <CardDescription>Lista prioritária para ação de retenção</CardDescription>
              </div>
              <Badge variant="outline" className="px-3 py-1">Top 100</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <AnalyticsTable 
                loading={isLoading}
                data={data || []}
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
                    label: 'Inatividade', 
                    key: 'days_since_purchase', 
                    className: 'text-center',
                    render: (row) => (
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-slate-700">{row.days_since_purchase}</span>
                        <span className="text-[10px] text-slate-400">dias</span>
                      </div>
                    )
                  },
                  { 
                    label: 'Status', 
                    key: 'churn_risk', 
                    render: (row) => {
                      const riskColors = {
                        'CRITICO': 'bg-red-100 text-red-700 border-red-200',
                        'ALTO': 'bg-orange-100 text-orange-700 border-orange-200',
                        'MEDIO': 'bg-yellow-100 text-yellow-700 border-yellow-200',
                        'BAIXO': 'bg-green-100 text-green-700 border-green-200',
                      };
                      return (
                        <Badge variant="outline" className={`font-bold shadow-none ${riskColors[row.churn_risk] || ''}`}>
                          {row.churn_risk}
                        </Badge>
                      );
                    }
                  },
                  { 
                    label: 'Histórico', 
                    key: 'total_spent', 
                    className: 'text-right',
                    render: (r) => (
                      <div className="flex flex-col items-end">
                        <span className="font-medium text-slate-700">{formatCurrency(r.total_spent)}</span>
                        <div className="w-24 mt-1">
                           <Progress value={Math.min(100, (r.total_spent / 5000) * 100)} className="h-1" />
                        </div>
                      </div>
                    ) 
                  }
                ]}
              />
            </CardContent>
          </MotionCard>
        </div>

        {/* Recommendations Section */}
        <MotionCard variants={itemVariants} className="bg-gradient-to-r from-slate-50 to-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-slate-600" />
              Estratégias de Retenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-white rounded-lg border shadow-sm hover:border-red-200 transition-colors">
                <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  Risco Crítico
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Contate imediatamente via telefone. Ofereça condições especiais ou bonificações para reativação. Verifique se houve problemas operacionais.
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border shadow-sm hover:border-orange-200 transition-colors">
                <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  Risco Alto
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Agende uma visita presencial do vendedor. Analise o histórico de compras para identificar queda no mix de produtos.
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border shadow-sm hover:border-yellow-200 transition-colors">
                <h4 className="font-semibold text-yellow-700 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  Risco Médio
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Envie campanhas de email marketing e promoções personalizadas. Mantenha a marca presente para evitar o esquecimento.
                </p>
              </div>
            </div>
          </CardContent>
        </MotionCard>
      </motion.div>
    </AnalyticsTemplate>
  );
}
