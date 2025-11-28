import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { format, startOfMonth, endOfMonth, isValid } from 'date-fns';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import DailySalesKPIs from '@/components/DailySales/DailySalesKPIs';
import DailySalesTimeline from '@/components/DailySales/DailySalesTimeline';
import DailySalesTabsExplorer from '@/components/DailySales/DailySalesTabsExplorer';
import AIInsight from '@/components/AIInsight';
import { useAIInsight } from '@/hooks/useAIInsight';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointerClick } from 'lucide-react';

const AnaliticoVendasDiarias = () => {
  const { filters } = useFilters();
  
  const [currentMonth, setCurrentMonth] = useState(() => {
      const fromDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date();
      return isValid(fromDate) ? startOfMonth(fromDate) : startOfMonth(new Date());
  });

  const [selectedDay, setSelectedDay] = useState(null);

  const viewRange = useMemo(() => {
      if (!isValid(currentMonth)) return { start: null, end: null };
      return {
          start: format(startOfMonth(currentMonth), 'yyyy-MM-dd'),
          end: format(endOfMonth(currentMonth), 'yyyy-MM-dd')
      };
  }, [currentMonth]);

  const params = useMemo(() => ({
    p_start_date: viewRange.start,
    p_end_date: viewRange.end,
    p_exclude_employees: filters.excludeEmployees ?? true,
    p_supervisors: filters.supervisors === 'all' ? null : filters.supervisors,
    p_sellers: filters.sellers === 'all' ? null : filters.sellers,
    p_customer_groups: filters.customerGroups === 'all' ? null : filters.customerGroups,
    p_regions: filters.regions === 'all' ? null : filters.regions,
    p_clients: Array.isArray(filters.clients) ? filters.clients.map(c => c.value) : null,
    p_search_term: filters.searchTerm || null
  }), [viewRange, filters]);

  const { data: dailyData, loading, refetch } = useAnalyticalData(
    'get_daily_sales_data',
    params,
    { 
        enabled: !!viewRange.start && !!viewRange.end,
        defaultValue: []
    }
  );

  useEffect(() => {
      if (selectedDay && dailyData) {
          const updatedDay = dailyData.find(d => d.date === selectedDay.date);
          if (updatedDay) {
              setSelectedDay(updatedDay);
          }
      }
  }, [dailyData, selectedDay]);

  const handleMonthChange = (newMonth) => {
      setCurrentMonth(newMonth);
      setSelectedDay(null);
  };

  const handleDaySelect = (day) => {
      if (selectedDay && selectedDay.date === day.date) {
          setSelectedDay(null);
      } else {
          setSelectedDay(day);
      }
  };

  const insightData = useMemo(() => {
      if (!dailyData || dailyData.length === 0) return null;
      return {
          total_days: dailyData.length,
          total_sales: dailyData.reduce((acc, d) => acc + (d.items?.reduce((sum, i) => sum + (i.totalValue || 0), 0) || 0), 0),
          best_day: [...dailyData].sort((a,b) => {
              const sumA = a.items?.reduce((sum, i) => sum + (i.totalValue || 0), 0) || 0;
              const sumB = b.items?.reduce((sum, i) => sum + (i.totalValue || 0), 0) || 0;
              return sumB - sumA;
          })[0]
      };
  }, [dailyData]);

  const { insight, loading: loadingAI, generateInsights } = useAIInsight('daily_sales_analysis', insightData);

  return (
    <>
      <Helmet>
        <title>Analítico Vendas Diárias - Costa Lavos</title>
        <meta name="description" content="Análise detalhada das vendas diárias com calendário interativo e explorador de vendas" />
      </Helmet>

      <div className="space-y-6 animate-in fade-in duration-500 pb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tighter">Vendas Diárias</h1>
                <p className="text-muted-foreground mt-1">Acompanhamento detalhado de vendas dia a dia com análise interativa.</p>
            </div>
        </div>

        <AIInsight insight={insight} loading={loadingAI} onRegenerate={generateInsights} />

        <DailySalesKPIs data={dailyData} />

        <div className="flex flex-col gap-8">
            <div className="w-full">
                <DailySalesTimeline 
                    dailyData={dailyData} 
                    currentMonth={currentMonth}
                    onMonthChange={handleMonthChange}
                    onDaySelect={handleDaySelect}
                    selectedDay={selectedDay}
                    isLoading={loading}
                />
            </div>
            
            <div className="w-full">
                <AnimatePresence mode="wait">
                    {selectedDay ? (
                        <DailySalesTabsExplorer key={selectedDay.date} day={selectedDay} />
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-[300px] flex flex-col items-center justify-center bg-muted/10 border-2 border-dashed border-muted rounded-xl p-6 text-center"
                        >
                            <div className="bg-muted p-4 rounded-full mb-4">
                                <MousePointerClick className="h-8 w-8 text-muted-foreground opacity-50" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">Nenhum dia selecionado</h3>
                            <p className="text-sm text-muted-foreground mt-2 max-w-md">
                                Clique em um dia no calendário acima para carregar o explorador detalhado com abas de produtos, clientes, supervisores e mais.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </div>
    </>
  );
};

export default AnaliticoVendasDiarias;