
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { AnimatePresence } from 'framer-motion';
import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';

import DailySalesTimeline from '@/components/DailySales/DailySalesTimeline';
import DailySalesKPIs from '@/components/DailySales/DailySalesKPIs';
import DailySalesDayDetail from '@/components/DailySales/DailySalesDayDetail';

const AnaliticoVendasDiarias = () => {
  const { filters, loading: filtersLoading } = useFilters();
  const debouncedFilters = useDebounce(filters, 500);
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const { toast } = useToast();
  const [selectedDay, setSelectedDay] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));

  const fetchOverviewData = useCallback(async (filtersForFetch) => {
    setOverviewLoading(true);
    try {
      const selectedClients = filtersForFetch.clients ? filtersForFetch.clients.map(c => c.value) : null;
      const { data, error } = await supabase.rpc('get_overview_data_v2', {
        p_start_date: filtersForFetch.startDate,
        p_end_date: filtersForFetch.endDate,
        p_previous_start_date: filtersForFetch.previousStartDate,
        p_previous_end_date: filtersForFetch.previousEndDate,
        p_exclude_employees: filtersForFetch.excludeEmployees,
        p_supervisors: filtersForFetch.supervisors,
        p_sellers: filtersForFetch.sellers,
        p_customer_groups: filtersForFetch.customerGroups,
        p_regions: filtersForFetch.regions,
        p_clients: selectedClients,
        p_search_term: filtersForFetch.searchTerm,
        p_show_defined_groups_only: filtersForFetch.showDefinedGroupsOnly
      });

      if (error) throw error;
      
      // O RPC retorna 'totalRevenue' como sendo apenas Venda de Produtos (net_revenue)
      // Recuperamos os valores base do KPI para realizar os cálculos corretos
      const productSales = data.kpi.totalRevenue || 0;
      const bonification = data.kpi.totalBonification || 0;
      const equipment = data.kpi.totalEquipment || 0;

      // Cálculo de Vendas Totais (Brutas) = Produtos + Bonificação + Equipamentos
      const grossSales = productSales + bonification + equipment;
      
      // Cálculo de Vendas Líquidas = Vendas Totais - Bonificação - Equipamentos
      // (Matematicamente igual a productSales, mas explicitando a lógica)
      const netSales = grossSales - bonification - equipment;

      setOverviewData({
        ...data,
        kpi: {
          ...data.kpi,
          totalRevenue: grossSales, // Atualiza para refletir o valor Bruto/Total no KPI "Vendas Totais"
          netSales: netSales,       // Define explicitamente o valor Líquido para o KPI "Vendas Líquidas"
        }
      });
    } catch (error) {
      console.error("Error fetching overview data:", error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar dados gerais",
        description: `Não foi possível carregar os dados: ${error.message}`,
      });
      setOverviewData(null);
    } finally {
      setOverviewLoading(false);
    }
  }, [toast]);

  const fetchDailyDetails = useCallback(async (filtersForFetch, month) => {
    setLoading(true);
    const start = startOfMonth(month);
    const end = endOfMonth(month);

    try {
      const selectedClients = filtersForFetch.clients ? filtersForFetch.clients.map(c => c.value) : null;
      const { data, error } = await supabase.rpc('get_daily_sales_data_v2', {
        p_start_date: format(start, 'yyyy-MM-dd'),
        p_end_date: format(end, 'yyyy-MM-dd'),
        p_exclude_employees: filtersForFetch.excludeEmployees,
        p_supervisors: filtersForFetch.supervisors,
        p_sellers: filtersForFetch.sellers,
        p_customer_groups: filtersForFetch.customerGroups,
        p_regions: filtersForFetch.regions,
        p_clients: selectedClients,
        p_search_term: filtersForFetch.searchTerm,
      });

      if (error) throw error;
      
      setDailyData(data || []);
      setSelectedDay(null);
    } catch (error) {
      console.error("Error fetching daily sales data:", error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar detalhes diários",
        description: `Não foi possível carregar os detalhes das vendas diárias: ${error.message}`,
      });
      setDailyData([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Combined effect to fetch data when filters or month change
  useEffect(() => {
    if (!filtersLoading && debouncedFilters.startDate && debouncedFilters.endDate) {
      fetchOverviewData(debouncedFilters);
      fetchDailyDetails(debouncedFilters, currentMonth);
    }
  }, [debouncedFilters, currentMonth, filtersLoading, fetchOverviewData, fetchDailyDetails]);

  const handleMonthChange = (newMonth) => {
    setCurrentMonth(newMonth);
  };
  
  return (
    <>
      <Helmet>
        <title>Vendas Diárias - Costa Lavos</title>
        <meta name="description" content="Análise detalhada das vendas diárias." />
      </Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Analítico de Vendas Diárias</h1>
          <p className="text-muted-foreground mt-1">Explore a performance de vendas dia a dia.</p>
        </div>
        
        <DailySalesKPIs kpiData={overviewData?.kpi} />
        
        <DailySalesTimeline
          dailyData={dailyData}
          onDaySelect={setSelectedDay}
          selectedDay={selectedDay}
          currentMonth={currentMonth}
          onMonthChange={handleMonthChange}
          isLoading={loading || overviewLoading}
        />
        
        <AnimatePresence>
          {selectedDay && (
            <DailySalesDayDetail selectedDay={selectedDay} />
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default AnaliticoVendasDiarias;
