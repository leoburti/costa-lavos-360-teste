import React, { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Gift, Award, TrendingUp } from 'lucide-react';
import KPICard from '@/components/supervisor/KPICard';
import RankingTable from '@/components/RankingTable';
import BonificationDrilldownExplorer from '@/components/BonificationDrilldownExplorer';

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const AnaliseBonificacaoPage = () => {
    const { filters } = useFilters();
    const dateRange = filters.dateRange || { from: startOfMonth(new Date()), to: endOfMonth(new Date()) };
    const startDateStr = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
    const endDateStr = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null;

    const baseParams = useMemo(() => {
        const selectedClients = filters.clients ? filters.clients.map(c => c.value) : null;
        return {
            p_start_date: startDateStr,
            p_end_date: endDateStr,
            p_exclude_employees: filters.excludeEmployees,
            p_supervisors: filters.supervisors,
            p_sellers: filters.sellers,
            p_customer_groups: filters.customerGroups,
            p_regions: filters.regions,
            p_clients: selectedClients,
            p_search_term: filters.searchTerm,
            p_show_defined_groups_only: false
        };
    }, [filters, startDateStr, endDateStr]);

    const { data: analysisData, loading: loadingAnalysis } = useAnalyticalData(
        'get_bonification_analysis', 
        baseParams, 
        { enabled: !!startDateStr && !!endDateStr, defaultValue: {} }
    );

    const { data: performanceData, loading: loadingPerformance } = useAnalyticalData(
        'get_bonification_performance', 
        {...baseParams, p_group_by: 'supervisor'}, 
        { enabled: !!startDateStr && !!endDateStr, defaultValue: {} }
    );
    
    const loading = loadingAnalysis || loadingPerformance;
    const analysisKpis = analysisData?.kpis || {};
    const performanceKpis = performanceData?.kpis || {};

    const rankingData = useMemo(() => ({
        salesByProduct: analysisData?.topProducts?.map(p => ({ name: p.product_name, value: p.total_bonified })) || [],
        salesBySupervisor: analysisData?.distribution?.supervisor || [],
        salesBySeller: analysisData?.distribution?.seller || [],
        salesByCustomerGroup: analysisData?.distribution?.customer_group || [],
        salesByClient: analysisData?.distribution?.client || [],
        regionalSales: []
    }), [analysisData]);
    
    const topPerformerValue = performanceKpis.topPerformer?.value || 0;

    return (
        <div className="space-y-6">
            <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="performance">Análise de Performance</TabsTrigger>
                    <TabsTrigger value="products">Produtos Bonificados</TabsTrigger>
                    <TabsTrigger value="distribution">Distribuição por Grupos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {loading ? (
                            [...Array(4)].map((_, i) => <Skeleton key={i} className="h-44" />)
                        ) : (
                            <>
                                <KPICard title="Média de Bonificação" value={`${(performanceKpis.averagePercentage || 0).toFixed(2)}%`} icon={Award} color="violet" subValue="Sobre receita líquida" />
                                <KPICard title="Produto Mais Bonificado" value={analysisKpis.mostBonifiedProduct || '-'} icon={Gift} color="rose" />
                                <KPICard title="Top Supervisor (Bonif.)" value={analysisKpis.topSupervisor || '-'} icon={Award} color="amber" />
                                <KPICard title="Top Supervisor (Perf.)" value={(performanceKpis.topPerformer?.name) || '-'} subValue={`${topPerformerValue.toFixed(2)}%`} icon={TrendingUp} color="emerald" />
                            </>
                        )}
                    </div>
                </TabsContent>
                
                <TabsContent value="performance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance de Bonificação</CardTitle>
                            <CardDescription>Explore o percentual de bonificação sobre a receita, do supervisor ao cliente.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                           {loading ? <Skeleton className="h-[600px]" /> : <BonificationDrilldownExplorer />}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="products">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ranking de Produtos Bonificados</CardTitle>
                            <CardDescription>Produtos com maior valor de bonificação no período.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? <Skeleton className="h-96" /> : (
                                <RankingTable data={{...rankingData, salesBySupervisor: [], salesBySeller: [], salesByCustomerGroup:[], salesByClient:[], regionalSales: []}} />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="distribution">
                    <Card>
                        <CardHeader>
                            <CardTitle>Distribuição de Bonificação</CardTitle>
                            <CardDescription>Veja como o valor total de bonificação é distribuído entre equipes e clientes.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             {loading ? <Skeleton className="h-96" /> : (
                                <RankingTable data={{...rankingData, salesByProduct: []}} />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AnaliseBonificacaoPage;