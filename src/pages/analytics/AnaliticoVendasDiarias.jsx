
import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { formatDateForAPI } from '@/lib/utils';
import { startOfMonth, format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DailySalesTimeline from '@/components/DailySales/DailySalesTimeline';
import DailySalesKPIs from '@/components/DailySales/DailySalesKPIs';
import DailySalesTabsExplorer from '@/components/DailySales/DailySalesTabsExplorer';
import { Card, CardContent } from '@/components/ui/card';
import { MousePointerClick, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AnaliticoVendasDiarias() {
  const { filters, updateFilters } = useFilters();
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Garantir que currentMonth é válido
  const initialMonth = useMemo(() => {
      const from = filters.dateRange?.from || (Array.isArray(filters.dateRange) ? filters.dateRange[0] : null);
      return from && isValid(new Date(from)) ? new Date(from) : startOfMonth(new Date());
  }, [filters.dateRange]);

  const [currentMonth, setCurrentMonth] = useState(initialMonth);

  // Sincronizar currentMonth quando filtros globais mudam
  useEffect(() => {
    const from = filters.dateRange?.from || (Array.isArray(filters.dateRange) ? filters.dateRange[0] : null);
    if (from && isValid(new Date(from))) {
      setCurrentMonth(new Date(from));
    }
  }, [filters.dateRange]);

  // Parâmetros comuns para reutilização
  const commonParams = useMemo(() => ({
    p_exclude_employees: filters.excludeEmployees ?? true,
    p_supervisors: filters.supervisors?.length ? filters.supervisors : null,
    p_sellers: filters.sellers?.length ? filters.sellers : null,
    p_customer_groups: filters.customerGroups?.length ? filters.customerGroups : null,
    p_regions: filters.regions?.length ? filters.regions : null,
    p_clients: filters.clients?.length ? filters.clients : null,
    p_search_term: filters.searchTerm || null,
  }), [filters]);

  // 1. Parâmetros para Dados do Dashboard (KPIs e Calendário)
  const dashboardParams = useMemo(() => {
    const startDate = filters.dateRange?.from || (Array.isArray(filters.dateRange) ? filters.dateRange[0] : null);
    const endDate = filters.dateRange?.to || (Array.isArray(filters.dateRange) ? filters.dateRange[1] : null);

    return {
      ...commonParams,
      p_start_date: formatDateForAPI(startDate),
      p_end_date: formatDateForAPI(endDate),
      p_previous_start_date: null, 
      p_previous_end_date: null,
      p_show_defined_groups_only: filters.showDefinedGroupsOnly || false,
      p_products: null
    };
  }, [commonParams, filters.dateRange, filters.showDefinedGroupsOnly]);

  const { 
    data: dashboardData, 
    loading: loadingDashboard, 
    error: errorDashboard, 
    retry: retryDashboard 
  } = useAnalyticalData(
    'get_dashboard_and_daily_sales_kpis',
    dashboardParams,
    { 
      enabled: !!dashboardParams.p_start_date,
      defaultValue: { kpi: {}, dailySales: [] },
      keepPreviousData: true
    }
  );

  // 2. Parâmetros para Detalhes do Dia
  const detailParams = useMemo(() => ({
    ...commonParams,
    p_date: selectedDate
  }), [commonParams, selectedDate]);

  const { 
    data: dayDetails, 
    loading: loadingDetails, 
    error: errorDetails, 
    retry: retryDetails 
  } = useAnalyticalData(
    'get_daily_sales_details_v3',
    detailParams,
    { 
      enabled: !!selectedDate,
      defaultValue: []
    }
  );

  const handleMonthChange = (newMonth) => {
    if (!isValid(newMonth)) return;
    setCurrentMonth(newMonth);
    // Atualiza filtro global para carregar dados do novo mês
    const start = startOfMonth(newMonth);
    const end = new Date(newMonth.getFullYear(), newMonth.getMonth() + 1, 0);
    updateFilters({ dateRange: { from: start, to: end } });
  };

  const handleDaySelect = (dayInfo) => {
    const dateStr = dayInfo.date;
    if (dateStr === selectedDate) {
        setSelectedDate(null); // Toggle off
    } else {
        setSelectedDate(dateStr);
    }
  };

  if (errorDashboard) {
      return (
          <div className="p-8 flex flex-col items-center justify-center min-h-[400px] bg-slate-50 rounded-xl border border-dashed border-slate-200 m-4">
              <div className="bg-red-100 p-4 rounded-full mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Erro ao carregar dados</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                {errorDashboard.message || "Ocorreu um erro inesperado ao conectar com o servidor."}
              </p>
              <Button onClick={retryDashboard} variant="default" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Tentar Novamente
              </Button>
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
                    <p className="text-muted-foreground">
                        Carregando detalhes de {isValid(new Date(selectedDate + 'T12:00:00')) ? format(new Date(selectedDate + 'T12:00:00'), "dd 'de' MMMM", { locale: ptBR }) : selectedDate}...
                    </p>
                </div>
            ) : errorDetails ? (
                <div className="flex flex-col items-center justify-center h-64 border rounded-xl bg-red-50 border-red-100 text-red-600">
                    <AlertTriangle className="h-8 w-8 mb-2"/>
                    <p>Erro ao carregar detalhes.</p>
                    <button onClick={retryDetails} className="underline mt-2 text-sm font-medium">Tentar novamente</button>
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
