
import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { formatDateForAPI } from '@/lib/utils';
import { startOfMonth, format } from 'date-fns';
import DailySalesTimeline from '@/components/DailySales/DailySalesTimeline';
import DailySalesKPIs from '@/components/DailySales/DailySalesKPIs';
import DailySalesTabsExplorer from '@/components/DailySales/DailySalesTabsExplorer';
import { Card, CardContent } from '@/components/ui/card';
import { MousePointerClick, Loader2, AlertTriangle } from 'lucide-react';

export default function AnaliticoVendasDiarias() {
  const { filters, updateFilters } = useFilters();
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(filters.dateRange?.from || startOfMonth(new Date()));

  // Sync currentMonth with global filters if they change externally
  useEffect(() => {
    if (filters.dateRange?.from) {
      setCurrentMonth(filters.dateRange.from);
    }
  }, [filters.dateRange]);

  const commonParams = useMemo(() => ({
    p_exclude_employees: filters.excludeEmployees,
    p_supervisors: filters.supervisors?.map(String),
    p_sellers: filters.sellers?.map(String),
    p_customer_groups: filters.customerGroups?.map(String),
    p_regions: filters.regions?.map(String),
    p_clients: filters.clients?.map(String),
    p_search_term: filters.searchTerm,
  }), [filters]);

  // 1. Fetch Overview Data (KPIs + Calendar Totals)
  const dashboardParams = useMemo(() => ({
    ...commonParams,
    p_start_date: formatDateForAPI(filters.dateRange?.from),
    p_end_date: formatDateForAPI(filters.dateRange?.to),
    p_previous_start_date: null, 
    p_previous_end_date: null,
    p_show_defined_groups_only: filters.showDefinedGroupsOnly || false,
    p_products: null
  }), [commonParams, filters.dateRange, filters.showDefinedGroupsOnly]);

  const { data: dashboardData, loading: loadingDashboard, error: errorDashboard, retry: retryDashboard } = useAnalyticalData(
    'get_dashboard_and_daily_sales_kpis',
    dashboardParams,
    { enabled: !!dashboardParams.p_start_date }
  );

  // 2. Fetch Detailed Data for Selected Day
  const detailParams = useMemo(() => ({
    ...commonParams,
    p_date: selectedDate ? formatDateForAPI(selectedDate) : null
  }), [commonParams, selectedDate]);

  const { data: dayDetails, loading: loadingDetails, error: errorDetails, retry: retryDetails } = useAnalyticalData(
    'get_daily_sales_details_v3',
    detailParams,
    { enabled: !!selectedDate }
  );

  const handleMonthChange = (newMonth) => {
    setCurrentMonth(newMonth);
    // Update global filters to fetch data for the new month
    const start = startOfMonth(newMonth);
    const end = new Date(newMonth.getFullYear(), newMonth.getMonth() + 1, 0); // End of month
    updateFilters({ dateRange: { from: start, to: end } });
  };

  const handleDaySelect = (dayInfo) => {
    // dayInfo comes from the timeline, usually has { date: 'YYYY-MM-DD', ... }
    const dateStr = dayInfo.date;
    if (dateStr === selectedDate) {
        setSelectedDate(null); // Toggle off
    } else {
        setSelectedDate(dateStr);
    }
  };

  if (errorDashboard) {
      return (
          <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
              <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900">Erro ao carregar dados</h3>
              <p className="text-muted-foreground mb-4">{errorDashboard.message || "Ocorreu um erro inesperado."}</p>
              <button onClick={retryDashboard} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors">Tentar Novamente</button>
          </div>
      )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500 bg-slate-50/30 min-h-screen">
      <Helmet>
        <title>Vendas Diárias | Costa Lavos</title>
      </Helmet>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Vendas Diárias</h1>
        <p className="text-muted-foreground">Acompanhamento detalhado de vendas dia a dia com análise interativa.</p>
      </div>

      {/* KPI Cards */}
      <DailySalesKPIs 
        kpiData={dashboardData?.kpi} 
        dailySales={dashboardData?.dailySales}
        isLoading={loadingDashboard}
      />

      {/* Calendar Timeline */}
      <DailySalesTimeline 
        dailyData={dashboardData?.dailySales || []}
        currentMonth={currentMonth}
        onMonthChange={handleMonthChange}
        onDaySelect={handleDaySelect}
        selectedDate={selectedDate}
        isLoading={loadingDashboard}
      />

      {/* Details Section */}
      <div className="mt-8 min-h-[400px] animate-in slide-in-from-bottom-4 duration-500">
        {selectedDate ? (
            loadingDetails ? (
                <div className="flex flex-col items-center justify-center h-64 border rounded-xl bg-white shadow-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2"/>
                    <p className="text-muted-foreground">Carregando detalhes de {format(new Date(selectedDate + 'T12:00:00'), 'dd/MM/yyyy')}...</p>
                </div>
            ) : errorDetails ? (
                <div className="flex flex-col items-center justify-center h-64 border rounded-xl bg-red-50 border-red-100 text-red-600">
                    <AlertTriangle className="h-8 w-8 mb-2"/>
                    <p>Erro ao carregar detalhes.</p>
                    <button onClick={retryDetails} className="underline mt-2 text-sm">Tentar novamente</button>
                </div>
            ) : (
                <DailySalesTabsExplorer 
                    data={dayDetails} 
                    date={selectedDate} 
                />
            )
        ) : (
            <Card className="border-dashed border-2 bg-slate-50/50 shadow-none">
                <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground text-center">
                    <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                        <MousePointerClick className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">Nenhum dia selecionado</h3>
                    <p className="text-slate-500 max-w-sm mt-2">
                        Clique em um dia no calendário acima para carregar o explorador detalhado com abas de produtos, clientes, supervisores e mais.
                    </p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
