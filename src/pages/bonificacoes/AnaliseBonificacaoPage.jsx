import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { useFilters } from '@/contexts/FilterContext';
import PageSkeleton from '@/components/PageSkeleton';
import BonificationDistributionExplorer from '@/components/bonificacoes/BonificationDistributionExplorer';
import BonificationPerformanceExplorer from '@/components/bonificacoes/BonificationPerformanceExplorer';
import BonifiedProductsExplorer from '@/components/bonificacoes/BonifiedProductsExplorer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, BarChartHorizontal, Users, Gift, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import FilterBar from '@/components/FilterBar';
import { formatCurrency } from '@/lib/utils';

const fetchAnalysisData = async ({ queryKey }) => {
  const [_key, filters] = queryKey;
  const { dateRange, ...restFilters } = filters;

  if (!dateRange?.from || !dateRange?.to) {
    return null;
  }

  const params = {
    p_start_date: dateRange.from.toISOString(),
    p_end_date: dateRange.to.toISOString(),
    p_exclude_employees: restFilters.excludeEmployees,
    p_supervisors: restFilters.supervisors,
    p_sellers: restFilters.sellers,
    p_customer_groups: restFilters.customerGroups,
    p_regions: restFilters.regions,
    p_clients: restFilters.clients,
    p_search_term: restFilters.searchTerm,
    p_show_defined_groups_only: restFilters.showDefinedGroupsOnly,
  };

  const { data, error } = await supabase.rpc('get_bonification_analysis', params);

  if (error) {
    throw new Error(`Erro ao buscar dados de análise: ${error.message}`);
  }
  return data;
};


const AnaliseBonificacaoPage = () => {
  const { filters } = useFilters();
  
  const queryKey = useMemo(() => ['bonificationAnalysis', filters], [filters]);

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: fetchAnalysisData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!(filters.dateRange?.from && filters.dateRange?.to),
  });

  if (isLoading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar análise</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { kpis, topProducts, distribution } = data || {};

  return (
    <div className="space-y-6">
      <FilterBar />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bonificado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis?.totalBonified)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produto Mais Bonificado</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate" title={kpis?.mostBonifiedProduct}>{kpis?.mostBonifiedProduct || 'N/A'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Supervisor (Bonif.)</CardTitle>
             <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate" title={kpis?.topSupervisor}>{kpis?.topSupervisor || 'N/A'}</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menor Supervisor (Bonif.)</CardTitle>
             <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate" title={kpis?.bottomSupervisor}>{kpis?.bottomSupervisor || 'N/A'}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="produtos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="produtos"><Gift className="mr-2 h-4 w-4"/> Produtos</TabsTrigger>
          <TabsTrigger value="distribuicao"><BarChartHorizontal className="mr-2 h-4 w-4"/> Distribuição</TabsTrigger>
          <TabsTrigger value="performance"><Users className="mr-2 h-4 w-4"/>Performance</TabsTrigger>
        </TabsList>
        <TabsContent value="produtos">
            <Card>
                <CardHeader>
                    <CardTitle>Top Produtos Bonificados</CardTitle>
                </CardHeader>
                <CardContent>
                    <BonifiedProductsExplorer products={topProducts} />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="distribuicao">
            <Card>
                <CardHeader>
                    <CardTitle>Distribuição das Bonificações</CardTitle>
                </CardHeader>
                <CardContent>
                    <BonificationDistributionExplorer filters={filters} />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="performance">
          <Card>
                <CardHeader>
                    <CardTitle>Performance de Bonificação vs. Venda</CardTitle>
                </CardHeader>
                <CardContent>
                    <BonificationPerformanceExplorer />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnaliseBonificacaoPage;