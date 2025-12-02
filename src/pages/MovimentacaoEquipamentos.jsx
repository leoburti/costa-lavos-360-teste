import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Wrench, BarChart2 } from 'lucide-react';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import AIInsight from '@/components/AIInsight';
import MetricCard from '@/components/MetricCard';
import ChartCard from '@/components/ChartCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAIInsight } from '@/hooks/useAIInsight';
import { formatDateForAPI } from '@/lib/utils';
import PageSkeleton from '@/components/PageSkeleton';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    let dateLabel = label;
    try {
       if(typeof label === 'string') {
         dateLabel = parseISO(label);
       }
       const formattedLabel = format(dateLabel, 'd MMM yyyy', { locale: ptBR });
       
       return (
        <div className="p-3 bg-card/80 border rounded-lg shadow-lg backdrop-blur-sm">
          <p className="font-bold text-base">{formattedLabel}</p>
          <p className="text-sm text-primary">Instalações: {payload[0].value}</p>
        </div>
      );
    } catch (e) {
      return null;
    }
  }
  return null;
};

const MovimentacaoEquipamentos = () => {
  const { filters } = useFilters();

  const params = useMemo(() => ({
    p_start_date: formatDateForAPI(filters.dateRange?.from || filters.dateRange?.[0]),
    p_end_date: formatDateForAPI(filters.dateRange?.to || filters.dateRange?.[1]),
    p_exclude_employees: filters.excludeEmployees,
    p_supervisors: filters.supervisors?.map(String),
    p_sellers: filters.sellers?.map(String),
    p_customer_groups: filters.customerGroups?.map(String),
    p_regions: filters.regions?.map(String),
    p_clients: filters.clients?.map(String),
    p_search_term: filters.searchTerm,
  }), [filters]);

  const { data, isLoading, error } = useAnalyticalData(
    'get_equipment_movement',
    params,
    { enabled: !!params.p_start_date && !!params.p_end_date }
  );

  const aiData = useMemo(() => {
    if (!data) return null;
    return {
      kpis: data.kpis,
      historySummary: {
        totalDays: data.history?.length,
        totalInstallations: data.history?.reduce((sum, day) => sum + day.installations, 0),
      },
    };
  }, [data]);

  const { insight, loading: loadingAI, generateInsights } = useAIInsight('equipment_movement', aiData);

  if (isLoading) {
    return <PageSkeleton />;
  }

  const kpis = data?.kpis || {};
  const history = data?.history || [];
  const recentMovements = data?.recent_movements || [];

  return (
    <>
      <Helmet>
        <title>Movimentação de Equipamentos - Costa Lavos</title>
        <meta name="description" content="Análise da movimentação de equipamentos (instalações e retiradas)." />
      </Helmet>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 p-4 sm:p-6 lg:p-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tighter">Movimentação de Equipamentos</h1>
          <p className="text-muted-foreground mt-1">Análise de instalações e retiradas de equipamentos.</p>
        </div>

        {!error && <AIInsight insight={insight} loading={loadingAI} onRegenerate={generateInsights} />}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard 
            title="Instalações no Período" 
            value={String(kpis.installations || 0)} 
            icon={Wrench} 
            loading={isLoading}
          />
          <MetricCard 
            title="Total em Campo" 
            value={String(kpis.total_in_field || 0)} 
            icon={BarChart2} 
            subtitle="Equipamentos instalados"
            loading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard title="Histórico de Instalações" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={history}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="movement_date" 
                  tickFormatter={(date) => {
                    try { return format(parseISO(date), 'd MMM', { locale: ptBR }) } catch(e) { return date }
                  }} 
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="installations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Movimentações Recentes">
            <div className="p-4 space-y-3 h-[300px] overflow-y-auto">
              {recentMovements.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">Nenhuma movimentação recente.</div>
              ) : (
                recentMovements.map((item, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg text-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold truncate">{item.equipment_name}</p>
                        <p className="text-xs text-muted-foreground">{item.client_name}</p>
                      </div>
                      <div className="text-xs font-bold text-primary">{format(new Date(item.movement_date), 'dd/MM/yy')}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ChartCard>
        </div>

      </motion.div>
    </>
  );
};

export default MovimentacaoEquipamentos;