import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, ShoppingCart, Users, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import SalesChart from '@/components/SalesChart';
import RankingList from '@/components/RankingList';
import MetricCard from '@/components/MetricCard';
import DashboardLoading from '@/components/DashboardLoading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    revenue: null,
    salesCount: null,
    avgTicket: null,
    activeClients: null
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout

    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      const startDateIso = thirtyDaysAgo.toISOString();

      const { data: rawData, error: supabaseError } = await supabase
        .from('bd-cl')
        .select('Total, "DT Emissao", Pedido, Cliente, "Nome Supervisor", "Nome Vendedor", "Desc.Regiao", Cfo')
        .gte('DT Emissao', startDateIso)
        .order('DT Emissao', { ascending: false })
        .limit(2000)
        .abortSignal(controller.signal);

      if (supabaseError) throw supabaseError;

      if (rawData && rawData.length > 0) {
        setData(rawData);
        processMetrics(rawData);
      } else {
        setData([]);
        setMetrics({ revenue: 0, salesCount: 0, avgTicket: 0, activeClients: 0 });
      }

    } catch (err) {
      console.error("Dashboard Load Error:", err);
      if (err.name === 'AbortError') {
        setError("Timeout");
      } else {
        setError("Erro ao carregar dados.");
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const processMetrics = (items) => {
    const salesItems = items.filter(item => {
      const cfo = String(item.Cfo);
      return !['5910', '6910', '5908', '6551', '6908', '5551'].includes(cfo);
    });

    const totalRevenue = salesItems.reduce((acc, curr) => acc + (curr.Total || 0), 0);
    const uniqueOrders = new Set(salesItems.map(i => i.Pedido)).size;
    const uniqueClients = new Set(salesItems.map(i => i.Cliente)).size;
    const avgTicket = uniqueOrders > 0 ? totalRevenue / uniqueOrders : 0;

    setMetrics({
      revenue: totalRevenue,
      salesCount: uniqueOrders,
      activeClients: uniqueClients,
      avgTicket: avgTicket
    });
  };

  const derivedData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const dailySalesMap = {};
    const supervisorMap = {};
    const sellerMap = {};
    const regionMap = {};

    data.forEach(item => {
      const cfo = String(item.Cfo);
      const isSale = !['5910', '6910', '5908', '6551', '6908', '5551'].includes(cfo);
      const isBonification = ['5910', '6910'].includes(cfo);
      const isEquipment = ['5908', '6551', '6908', '5551'].includes(cfo);

      const date = item['DT Emissao'] ? item['DT Emissao'].split('T')[0] : null;
      
      if (date) {
        if (!dailySalesMap[date]) dailySalesMap[date] = { total: 0, bonification: 0, equipment: 0 };
        if (isSale) dailySalesMap[date].total += item.Total;
        if (isBonification) dailySalesMap[date].bonification += item.Total;
        if (isEquipment) dailySalesMap[date].equipment += item.Total;
      }

      if (isSale) {
        const sup = item['Nome Supervisor'] || 'N/D';
        supervisorMap[sup] = (supervisorMap[sup] || 0) + item.Total;

        const sell = item['Nome Vendedor'] || 'N/D';
        sellerMap[sell] = (sellerMap[sell] || 0) + item.Total;

        const reg = item['Desc.Regiao'] || 'N/D';
        regionMap[reg] = (regionMap[reg] || 0) + item.Total;
      }
    });

    const dailySales = Object.entries(dailySalesMap).map(([date, values]) => ({
      date,
      ...values
    })).sort((a, b) => a.date.localeCompare(b.date));

    const toRanking = (map) => Object.entries(map)
      .map(([name, total]) => ({ name, total_revenue: total }))
      .sort((a, b) => b.total_revenue - a.total_revenue);

    return {
      dailySales,
      rankings: {
        supervisors: toRanking(supervisorMap),
        sellers: toRanking(sellerMap),
        regions: toRanking(regionMap)
      }
    };
  }, [data]);

  // Show Loading or Full Error State if no data is present
  if (loading || (error && (!data || data.length === 0))) {
    return <DashboardLoading loading={loading} error={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Geral</h1>
          <p className="text-muted-foreground mt-1">
            Visão consolidada dos últimos 30 dias.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
           <RefreshCw className="mr-2 h-4 w-4" /> Atualizar Agora
        </Button>
      </div>

      {/* Soft Error Alert if data exists but refresh failed */}
      {error && data.length > 0 && (
        <Alert variant="warning" className="bg-yellow-50 border-yellow-200 text-yellow-800">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle>Atenção</AlertTitle>
          <AlertDescription>Não foi possível atualizar os dados mais recentes. Exibindo dados em cache.</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Receita (30d)"
          value={formatCurrency(metrics.revenue || 0)}
          icon={DollarSign}
          changeType="neutral"
          subtitle="Baseado nos últimos registros"
        />
        <MetricCard
          title="Pedidos"
          value={metrics.salesCount || 0}
          icon={ShoppingCart}
          subtitle="Vendas Únicas"
        />
        <MetricCard
          title="Ticket Médio"
          value={formatCurrency(metrics.avgTicket || 0)}
          icon={TrendingUp}
          subtitle="Receita / Pedidos"
        />
        <MetricCard
          title="Clientes Ativos"
          value={metrics.activeClients || 0}
          icon={Users}
          subtitle="Compraram no período"
        />
      </div>

      {derivedData && (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Vendas por Dia</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <SalesChart data={derivedData.dailySales} height={350} />
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Rankings de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="supervisors" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="supervisors">Supervisores</TabsTrigger>
                  <TabsTrigger value="sellers">Vendedores</TabsTrigger>
                  <TabsTrigger value="regions">Regiões</TabsTrigger>
                </TabsList>
                <TabsContent value="supervisors">
                  <RankingList data={derivedData.rankings.supervisors} icon={Users} />
                </TabsContent>
                <TabsContent value="sellers">
                  <RankingList data={derivedData.rankings.sellers} icon={Users} />
                </TabsContent>
                <TabsContent value="regions">
                  <RankingList data={derivedData.rankings.regions} icon={Users} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;