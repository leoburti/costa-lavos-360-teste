import React from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import DashboardLoading from '@/components/DashboardLoading';
import MetricCard from '@/components/MetricCard';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { RefreshCw, DollarSign, Users, ShoppingCart, CreditCard, Gift, Truck, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

const DashboardGeral = () => {
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500 bg-slate-50/50 min-h-screen p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Visão Geral</h1>
            {isFetching && !isLoading && (
              <span className="text-xs text-muted-foreground animate-pulse flex items-center gap-1 bg-white px-2 py-1 rounded-full border shadow-sm">
                <RefreshCw className="h-3 w-3 animate-spin" /> Atualizando...
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground text-sm">
              Resumo executivo dos principais indicadores de performance.
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
        <MetricCard
          title="Bonificação Total"
          value={formatCurrency(kpis.totalBonification || 0)}
          icon={Gift}
          subtitle="Investimento em bonificação"
          loading={isFetching && !data}
        />
        <MetricCard
          title="Equipamentos"
          value={formatCurrency(kpis.totalEquipment || 0)}
          icon={Truck}
          subtitle="Valor em comodato"
          loading={isFetching && !data}
        />
        <MetricCard
          title="Receita Mês Atual (MTD)"
          value={formatCurrency(kpis.totalRevenueMonthToDate || 0)}
          icon={Calendar}
          subtitle="Acumulado do mês corrente"
          loading={isFetching && !data}
        />
        <MetricCard
          title="Receita Projetada"
          value={formatCurrency(kpis.projectedRevenue || 0)}
          icon={TrendingUp}
          subtitle="Estimativa fechamento mês"
          loading={isFetching && !data}
        />
      </div>
    </div>
  );
};

export default DashboardGeral;