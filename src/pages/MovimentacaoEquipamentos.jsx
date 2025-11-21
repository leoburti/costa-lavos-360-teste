import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Loader2, Wrench, BarChart2, Calendar, Repeat } from 'lucide-react';
import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import AIInsight from '@/components/AIInsight';
import MetricCard from '@/components/MetricCard';
import ChartCard from '@/components/ChartCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAIInsight } from '@/hooks/useAIInsight';

const formatCurrency = (value) => {
  if (value === undefined || value === null) return 'R$ 0,00';
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const formattedLabel = format(parseISO(label), 'd MMM yyyy', { locale: ptBR });
    return (
      <div className="p-3 bg-card/80 border rounded-lg shadow-lg backdrop-blur-sm">
        <p className="font-bold text-base">{formattedLabel}</p>
        <p className="text-sm text-primary">Instalações: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const MovimentacaoEquipamentos = () => {
  const { filters } = useFilters();
  const [loading, setLoading] = useState(true);
  const [movementData, setMovementData] = useState(null);
  const { toast } = useToast();

  const aiData = useMemo(() => {
    if (!movementData) return null;
    return {
      kpis: movementData.kpis,
      historySummary: {
        totalDays: movementData.history?.length,
        totalInstallations: movementData.history?.reduce((sum, day) => sum + day.installations, 0),
      },
    };
  }, [movementData]);

  const { insight, loading: loadingAI, generateInsights } = useAIInsight('equipment_movement', aiData);

  useEffect(() => {
    const fetchData = async () => {
      if (!filters.startDate || !filters.endDate) return;
      setLoading(true);
      const selectedClients = Array.isArray(filters.clients) ? filters.clients.map(c => c.value) : null;
      const { data, error } = await supabase.rpc('get_equipment_movement', {
        p_start_date: filters.startDate,
        p_end_date: filters.endDate,
        p_exclude_employees: filters.excludeEmployees,
        p_supervisors: filters.supervisors,
        p_sellers: filters.sellers,
        p_customer_groups: filters.customerGroups,
        p_regions: filters.regions,
        p_clients: selectedClients,
        p_search_term: filters.searchTerm,
      });

      if (error) {
        toast({ variant: "destructive", title: "Erro na Análise", description: error.message });
        setMovementData(null);
      } else {
        setMovementData(data);
      }
      setLoading(false);
    };
    fetchData();
  }, [filters, toast]);

  useEffect(() => {
    if(aiData) {
      generateInsights();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiData]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const kpis = movementData?.kpis || {};
  const history = movementData?.history || [];
  const recentMovements = movementData?.recent_movements || [];

  return (
    <>
      <Helmet>
        <title>Movimentação de Equipamentos - Costa Lavos</title>
        <meta name="description" content="Análise da movimentação de equipamentos (instalações e retiradas)." />
      </Helmet>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tighter">Movimentação de Equipamentos</h1>
          <p className="text-muted-foreground mt-1">Análise de instalações e retiradas de equipamentos.</p>
        </div>

        <AIInsight insight={insight} loading={loadingAI} onRegenerate={generateInsights} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard title="Instalações no Período" value={String(kpis.installations || 0)} icon={Wrench} />
          <MetricCard 
            title="Total em Campo" 
            value={String(kpis.total_in_field || 0)} 
            icon={BarChart2} 
            subtitle="Equipamentos instalados"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard title="Histórico de Instalações" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={history}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="movement_date" tickFormatter={(date) => format(parseISO(date), 'd MMM', { locale: ptBR })} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="installations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Movimentações Recentes">
            <div className="p-4 space-y-3 h-[300px] overflow-y-auto">
              {recentMovements.map((item, index) => (
                <div key={index} className="p-3 bg-muted/50 rounded-lg text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold truncate">{item.equipment_name}</p>
                      <p className="text-xs text-muted-foreground">{item.client_name}</p>
                    </div>
                    <div className="text-xs font-bold text-primary">{format(new Date(item.movement_date), 'dd/MM/yy')}</div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

      </motion.div>
    </>
  );
};

export default MovimentacaoEquipamentos;