import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { formatCurrency, formatDateForAPI, formatNumber } from '@/lib/utils';

// Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ErrorState, EmptyState } from '@/components/common';
import ProductMixAnalysis from '@/components/ProductMixAnalysis';
import CestaDeProdutos from '@/components/CestaDeProdutos';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, LayoutGrid, ShoppingBasket } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageSkeleton from '@/components/PageSkeleton';

export default function AnaliticoProduto() {
  const { filters } = useFilters();

  const params = useMemo(() => ({
    p_start_date: formatDateForAPI(filters.dateRange?.from || filters.dateRange?.[0]),
    p_end_date: formatDateForAPI(filters.dateRange?.to || filters.dateRange?.[1]),
    p_exclude_employees: filters.excludeEmployees || false,
    p_supervisors: filters.supervisors?.map(String) || null,
    p_sellers: filters.sellers?.map(String) || null,
    p_customer_groups: filters.customerGroups?.map(String) || null,
    p_regions: filters.regions?.map(String) || null,
    p_clients: filters.clients?.map(String) || null,
    p_search_term: filters.searchTerm || null,
  }), [filters]);

  const { data, isLoading, error, refetch } = useAnalyticalData(
    'get_product_analysis_data',
    params,
    { enabled: !!params.p_start_date && !!params.p_end_date }
  );

  const CustomizedTreemapContent = (props) => {
    const { x, y, width, height, name, value, quantity } = props;
    if (width < 60 || height < 50) return null;
    
    const displayName = name || 'Produto sem nome';
    const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#10b981', '#f59e0b'];
    const colorIndex = (displayName.length + Math.floor(value)) % COLORS.length;
    const fillColor = COLORS[colorIndex];

    return (
      <g>
        <rect 
          x={x} 
          y={y} 
          width={width} 
          height={height} 
          style={{ 
            fill: fillColor,
            stroke: '#fff', 
            strokeWidth: 2,
            fillOpacity: 0.9,
            transition: 'all 0.3s ease'
          }} 
        />
        <foreignObject x={x + 2} y={y + 2} width={width - 4} height={height - 4}>
          <div className="flex flex-col items-center justify-center h-full w-full text-white overflow-hidden text-center leading-tight select-none pointer-events-none">
            <span className="font-bold text-xs sm:text-sm truncate w-full px-1 drop-shadow-md">
              {displayName}
            </span>
            {height > 60 && (
              <>
                <span className="text-[10px] sm:text-xs font-medium mt-1 drop-shadow-md opacity-90">
                  {formatCurrency(value)}
                </span>
                <span className="text-[10px] font-light opacity-80 drop-shadow-md">
                  {formatNumber(quantity)} kg
                </span>
              </>
            )}
          </div>
        </foreignObject>
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 border border-slate-200 shadow-xl rounded-lg text-sm z-50 max-w-xs">
          <p className="font-bold text-slate-800 mb-2 text-base border-b pb-1 border-slate-100">
            {d.name || 'Produto sem nome'}
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-6">
              <span className="text-slate-500">Vendas Totais:</span>
              <span className="font-mono font-bold text-blue-600 text-base">{formatCurrency(d.value)}</span>
            </div>
            <div className="flex justify-between items-center gap-6">
              <span className="text-slate-500">Quantidade:</span>
              <span className="font-mono font-medium text-slate-700">{formatNumber(d.quantity)} kg</span>
            </div>
            <div className="flex justify-between items-center gap-6 pt-1 border-t border-slate-100">
              <span className="text-slate-500">Margem Est.:</span>
              <span className="font-mono font-medium text-emerald-600">
                {formatCurrency(d.margin)} ({d.margin_percentage?.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Analítico de Produtos | Costa Lavos</title>
      </Helmet>

      <Tabs defaultValue="analise" className="space-y-4">
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Performance de Produtos</h2>
                <p className="text-sm text-muted-foreground">Visão detalhada por volume, receita e mix.</p>
            </div>
            <TabsList className="bg-white border border-slate-200">
                <TabsTrigger value="analise" className="gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    Visão Geral
                </TabsTrigger>
                <TabsTrigger value="cesta" className="gap-2">
                    <ShoppingBasket className="h-4 w-4" />
                    Análise de Cesta
                </TabsTrigger>
            </TabsList>
        </div>

        <TabsContent value="analise" className="space-y-6 focus-visible:outline-none">
            <div className="grid gap-6">
                {/* 1. Treemap Visualization */}
                <Card className="border-slate-200 shadow-sm bg-white">
                <CardHeader className="pb-2 border-b border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Mapa de Vendas por Produto
                        </CardTitle>
                        <CardDescription>
                        Área proporcional ao volume de vendas.
                        </CardDescription>
                    </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-6 h-[600px]">
                    {error ? (
                    <ErrorState error={error} onRetry={refetch} />
                    ) : !data || data.length === 0 ? (
                    <EmptyState description="Nenhuma venda encontrada para os produtos no período." />
                    ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <Treemap
                        data={data.slice(0, 40)}
                        dataKey="value"
                        aspectRatio={4/3}
                        stroke="#fff"
                        content={<CustomizedTreemapContent />}
                        animationDuration={800}
                        >
                        <Tooltip content={<CustomTooltip />} cursor={false} />
                        </Treemap>
                    </ResponsiveContainer>
                    )}
                </CardContent>
                </Card>

                {/* 2. Product Mix Analysis Table */}
                <Card className="border-slate-200 shadow-sm bg-white">
                <CardHeader className="pb-2 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                        Matriz de Força e Confiabilidade
                        </CardTitle>
                    </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                    <ProductMixAnalysis 
                    externalData={data} 
                    loading={isLoading} 
                    error={error} 
                    />
                </CardContent>
                </Card>
            </div>
        </TabsContent>

        <TabsContent value="cesta" className="focus-visible:outline-none">
            <CestaDeProdutos />
        </TabsContent>
      </Tabs>
    </div>
  );
}