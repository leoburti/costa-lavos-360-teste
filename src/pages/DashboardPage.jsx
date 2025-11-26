
import React, { useEffect, useState, useCallback } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { getOverviewDataV2 } from '@/services/erpService';
import { Button } from '@/components/ui/button';
import { RefreshCcw, AlertTriangle, DollarSign, Users, ShoppingCart, CreditCard, Gift, Truck, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import LoadingSpinner from '@/components/LoadingSpinner';
import MetricCard from '@/components/MetricCard';
import SalesChart from '@/components/SalesChart';
import PerformanceRanking from '@/components/dashboard/PerformanceRanking';
import { cn, formatCurrency, formatNumber } from '@/lib/utils'; // Import formatNumber as well

const DashboardPage = () => {
    const { filters, refreshKey, refreshData } = useFilters();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        // Avoid fetching if dates are invalid
        if (!filters.startDate || !filters.endDate) return;

        setLoading(true);
        setError(null);
        
        try {
            const result = await getOverviewDataV2(
                filters.startDate,
                filters.endDate,
                filters.previousStartDate,
                filters.previousEndDate,
                filters.excludeEmployees,
                filters.supervisors,
                filters.sellers,
                filters.customerGroups,
                filters.regions,
                filters.clients,
                filters.searchTerm,
                filters.showDefinedGroupsOnly
            );

            if (!result) throw new Error("Dados vazios recebidos");
            
            setData(result);
            setLastUpdated(new Date());
        } catch (err) {
            console.error("Erro no dashboard:", err);
            if (err.message?.includes("timeout") || err.message?.includes("statement timeout")) {
                setError("O período selecionado tem muitos dados. Tente reduzir o intervalo de datas.");
            } else {
                setError(err.message || "Falha ao carregar dados.");
            }
        } finally {
            setLoading(false);
        }
    }, [
        filters.startDate, 
        filters.endDate,
        filters.excludeEmployees, 
        filters.showDefinedGroupsOnly,
        // Deep compare arrays by stringifying them for dependency array
        JSON.stringify(filters.supervisors),
        JSON.stringify(filters.sellers),
        JSON.stringify(filters.customerGroups),
        JSON.stringify(filters.regions),
        JSON.stringify(filters.clients),
        filters.searchTerm,
        filters.previousStartDate,
        refreshKey
    ]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const renderContent = () => {
        if (error) {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-lg border border-dashed border-red-200 h-[400px]">
                    <div className="p-3 bg-red-50 rounded-full mb-3">
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Erro ao carregar dados</h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-4">{error}</p>
                    <Button onClick={refreshData} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                        <RefreshCcw className="mr-2 h-4 w-4" /> Tentar Novamente
                    </Button>
                </div>
            );
        }

        if (loading && !data) {
            return (
                <div className="flex flex-col items-center justify-center h-[70vh]">
                    <LoadingSpinner message="Calculando indicadores..." />
                </div>
            );
        }

        if (!data) return null;

        const { kpi, dailySales, rankings } = data;

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                
                {/* 1. Metric Cards - 2 Rows of 4 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Row 1 */}
                    <MetricCard 
                        title="Receita Líquida" 
                        value={formatCurrency(kpi?.netSales)} 
                        icon={DollarSign}
                        color="emerald"
                        // trend={{ value: 0, isPositive: true }} // Example trend
                    />
                    <MetricCard 
                        title="Clientes Ativos" 
                        value={formatNumber(kpi?.activeClients)} 
                        icon={Users}
                        color="blue"
                    />
                    <MetricCard 
                        title="Vendas Realizadas" 
                        value={formatNumber(kpi?.salesCount)} 
                        icon={ShoppingCart}
                        color="orange"
                    />
                    <MetricCard 
                        title="Ticket Médio" 
                        value={formatCurrency(kpi?.averageTicket)} 
                        icon={CreditCard}
                        color="rose"
                    />

                    {/* Row 2 */}
                    <MetricCard 
                        title="Bonificação Total" 
                        value={formatCurrency(kpi?.totalBonification)} 
                        icon={Gift}
                        color="purple"
                    />
                    <MetricCard 
                        title="Equipamentos Entregues" 
                        value={formatCurrency(kpi?.totalEquipment)} 
                        icon={Truck}
                        color="slate"
                    />
                    <MetricCard 
                        title="Receita Mês Atual (MTD)" 
                        value={formatCurrency(kpi?.totalRevenueMonthToDate)} 
                        icon={Calendar}
                        color="indigo"
                    />
                    <MetricCard 
                        title="Receita Projetada" 
                        value={formatCurrency(kpi?.projectedRevenue)} 
                        icon={TrendingUp}
                        color="cyan"
                    />
                </div>

                {/* 2. Daily Sales Chart - Full Width */}
                <div className="w-full">
                    <SalesChart 
                        data={dailySales || []} 
                        title="Vendas Diárias"
                        height={400}
                        series={[
                            { key: 'total', name: 'Receita', color: '#10b981' }, // emerald-500
                            { key: 'bonification', name: 'Bonificação', color: '#8b5cf6' }, // violet-500
                            { key: 'equipment', name: 'Equipamentos', color: '#3b82f6' } // blue-500
                        ]}
                    />
                </div>

                {/* 3. Performance Rankings - Tabbed Interface */}
                <div className="w-full">
                    <PerformanceRanking rankings={rankings} />
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 p-6 pb-20 md:pb-8 bg-slate-50/50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Visão Geral</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-muted-foreground">
                            Acompanhamento de indicadores comerciais e performance.
                        </p>
                        {lastUpdated && (
                            <span className="text-xs text-gray-400 bg-white border px-2 py-0.5 rounded-full flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                Atualizado às {format(lastUpdated, 'HH:mm:ss')}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button 
                        onClick={refreshData} 
                        disabled={loading}
                        variant="outline"
                        size="sm"
                        className={cn("gap-2 bg-white hover:bg-gray-50 transition-all shadow-sm", loading && "opacity-70")}
                    >
                        <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
                        {loading ? 'Atualizando...' : 'Atualizar Dados'}
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            {renderContent()}
        </div>
    );
};

export default DashboardPage;
