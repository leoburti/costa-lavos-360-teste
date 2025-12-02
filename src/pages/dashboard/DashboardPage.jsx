/**
 * PÁGINA: DASHBOARD
 * Versão corrigida com persistência de estado de abas e formatação de data (C01)
 */

import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState, ErrorState, EmptyState } from '@/components/common';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, BarChart3 } from 'lucide-react';
import { formatCurrency, formatDateForAPI } from '@/lib/utils'; // C01 & C03: Importação da correção de timezone e formatCurrency

import PerformanceRanking from '@/components/dashboard/PerformanceRanking'; // Importando o novo componente de ranking

/**
 * DashboardPage Component
 */
export function DashboardPage() {
  const { filters } = useFilters();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // ===== OBTER ESTADO DA ABA DA URL =====
  const activeTab = searchParams.get('tab') || 'kpis';

  // ===== HANDLER PARA MUDAR ABA =====
  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  // ===== CONSTRUIR PARÂMETROS =====
  const params = useMemo(() => ({
    // C01: Usando formatDateForAPI para garantir timezone local
    p_start_date: formatDateForAPI(filters.dateRange[0]),
    p_end_date: formatDateForAPI(filters.dateRange[1]),
    p_exclude_employees: filters.excludeEmployees || false,
    p_supervisors: filters.supervisors?.map(id => String(id)) || null,
    p_sellers: filters.sellers?.map(id => String(id)) || null,
    p_customer_groups: filters.customerGroups?.map(id => String(id)) || null,
    p_regions: filters.regions?.map(id => String(id)) || null,
    p_clients: filters.clients?.map(id => String(id)) || null,
    p_search_term: filters.searchTerm || null,
  }), [filters]);

  // ===== CHAMAR RPC =====
  const { data: rawData, loading, error, retry } = useAnalyticalData(
    'get_dashboard_and_daily_sales_kpis',
    params,
    {
      onError: (err) => {
        toast({
          title: 'Erro ao carregar dashboard',
          description: err.message,
          variant: 'destructive',
        });
      },
    }
  );

  // ===== PROCESSAR DADOS =====
  const { kpis, dailySales } = useMemo(() => {
    if (!rawData) {
      return { kpis: {}, dailySales: [] };
    }

    // Adaptação dependendo do formato de retorno da RPC
    // A nova RPC retorna { kpi: {}, dailySales: [], rankings: ... }
    return {
        kpis: rawData.kpi || {},
        dailySales: rawData.dailySales || []
    };
  }, [rawData]);

  // ===== RENDERIZAR: Loading =====
  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingState message="Carregando indicadores do dashboard..." />
      </div>
    );
  }

  // ===== RENDERIZAR: Erro =====
  if (error) {
    return (
      <div className="space-y-6">
        <ErrorState error={error} onRetry={retry} />
      </div>
    );
  }

  // ===== RENDERIZAR: Dashboard com Abas =====
  return (
    <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Comercial</h1>
          <p className="text-muted-foreground">Visão geral de performance e indicadores chave.</p>
        </div>

      {/* ===== KPI CARDS (SEMPRE VISÍVEIS NO TOPO) ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(kpis.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                {kpis.salesCount || 0} pedidos no período
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(kpis.averageTicket)}</div>
              <p className="text-xs text-muted-foreground">
                Por pedido realizado
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.activeClients || 0}</div>
              <p className="text-xs text-muted-foreground">
                Clientes com compra no período
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bonificações</CardTitle>
              <div className="h-4 w-4 text-purple-500 font-bold">%</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(kpis.totalBonification)}</div>
              <p className="text-xs text-muted-foreground">
                Volume de bonificação
              </p>
            </CardContent>
          </Card>
        </div>

      {/* ===== GRÁFICO DE VENDAS ===== */}
      <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle>Evolução Diária de Vendas</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {dailySales.length === 0 ? (
              <EmptyState message="Nenhum dado de vendas diárias para exibir no gráfico" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    tick={{fontSize: 12}}
                  />
                  <YAxis tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`} tick={{fontSize: 12}} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), 'Vendas']}
                    labelFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#2563eb" 
                    name="Vendas"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                   <Line 
                    type="monotone" 
                    dataKey="bonification" 
                    stroke="#8b5cf6" 
                    name="Bonificação"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

      {/* ===== RANKING DE PERFORMANCE ===== */}
      <div className="h-[500px]">
         <PerformanceRanking totalRevenue={kpis.totalRevenue} />
      </div>
    </div>
  );
}

export default DashboardPage;