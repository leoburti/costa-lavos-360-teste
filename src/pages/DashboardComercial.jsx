import React from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, Users, ShoppingCart, CreditCard, Gift, Truck, 
  Calendar, TrendingUp, RefreshCw, Download, Maximize2, AlertCircle
} from 'lucide-react';
import SalesChart from '@/components/SalesChart';
import DashboardLoading from '@/components/DashboardLoading';
import MetricCard from '@/components/MetricCard';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DashboardComercial = () => {
  const { data, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } = useDashboardData();

  if (isLoading) {
    return <DashboardLoading loading={true} />;
  }

  if (isError) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <Alert variant="destructive" className="max-w-lg mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar dados</AlertTitle>
          <AlertDescription>
            {error?.message || 'Não foi possível conectar ao servidor.'}
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" /> Tentar Novamente
        </Button>
      </div>
    );
  }

  const kpis = data?.kpi || {};
  // Ensure daily sales is an array and handle nulls
  const rawDailySales = data?.dailySales;
  const dailySales = Array.isArray(rawDailySales) ? rawDailySales : [];

  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-500 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Visão Comercial</h1>
            {isFetching && !isLoading && (
              <span className="text-xs text-muted-foreground animate-pulse flex items-center gap-1 bg-white px-2 py-1 rounded-full border shadow-sm">
                <RefreshCw className="h-3 w-3 animate-spin" /> Atualizando...
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground text-sm">
              Acompanhamento detalhado de vendas e evolução diária.
            </p>
            {dataUpdatedAt && !isFetching && (
              <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200 flex items-center gap-1 transition-all">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Atualizado às {format(new Date(dataUpdatedAt), 'HH:mm:ss')}
              </span>
            )}
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()} 
          disabled={isFetching} 
          className="bg-white shadow-sm hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Atualizando...' : 'Atualizar Dados'}
        </Button>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Receita Líquida"
          value={formatCurrency(kpis.netSales || 0)}
          icon={DollarSign}
          subtitle="Vendas confirmadas (s/ bonif.)"
          trend={kpis.yoyGrowth}
          loading={isFetching && !data}
        />
        <MetricCard
          title="Clientes Ativos"
          value={kpis.activeClients || 0}
          icon={Users}
          subtitle="Compraram no período"
          loading={isFetching && !data}
        />
        <MetricCard
          title="Vendas Realizadas"
          value={kpis.salesCount || 0}
          icon={ShoppingCart}
          subtitle="Pedidos faturados"
          loading={isFetching && !data}
        />
        <MetricCard
          title="Ticket Médio"
          value={formatCurrency(kpis.averageTicket || 0)}
          icon={CreditCard}
          subtitle="Receita / Pedidos"
          loading={isFetching && !data}
        />
      </div>

      {/* Chart Section */}
      <div className="grid gap-6 lg:grid-cols-1">
        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold text-slate-800">Vendas Diárias</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {dailySales && dailySales.length > 0 ? (
              <SalesChart 
                data={dailySales} 
                height={380}
                title=""
                series={[
                  { key: 'total', name: 'Receita', color: '#10b981' },
                  { key: 'bonification', name: 'Bonificação', color: '#8b5cf6' },
                  { key: 'equipment', name: 'Equipamentos', color: '#3b82f6' }
                ]}
              />
            ) : (
              <div className="h-[380px] flex flex-col items-center justify-center text-muted-foreground bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <AlertCircle className="h-8 w-8 mb-2 opacity-20" />
                <p>Sem dados de vendas para o período selecionado</p>
              </div>
            )}
            
            <div className="flex justify-center mt-4 gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#10b981]"></span>
                <span className="text-slate-600 font-medium">Receita</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#8b5cf6]"></span>
                <span className="text-slate-600 font-medium">Bonificação</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#3b82f6]"></span>
                <span className="text-slate-600 font-medium">Equipamentos</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardComercial;