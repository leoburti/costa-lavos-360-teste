import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useFilters } from '@/contexts/FilterContext';
import { formatCurrency, formatDateForAPI } from '@/lib/utils';
import { 
  DollarSign, 
  Users, 
  Trophy, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from 'recharts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import FilterBar from '@/components/FilterBar';

const KPICard = ({ title, value, icon: Icon, subtext, color }) => (
  <Card className="border-slate-200 shadow-sm">
    <CardContent className="p-6">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {Icon && <Icon className={`h-4 w-4 ${color}`} />}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
    </CardContent>
  </Card>
);

const BonificacoesDashboard = () => {
  const { filters } = useFilters();

  const params = useMemo(() => ({
    p_start_date: formatDateForAPI(filters.dateRange?.[0]),
    p_end_date: formatDateForAPI(filters.dateRange?.[1]),
    p_exclude_employees: filters.excludeEmployees,
    p_supervisors: filters.supervisors?.map(String),
    p_sellers: filters.sellers?.map(String),
    p_regions: filters.regions?.map(String),
    p_search_term: filters.searchTerm,
  }), [filters]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_bonification_analysis',
    params,
    { 
        enabled: !!params.p_start_date,
        defaultValue: { kpis: {}, topProducts: [], distribution: {} }
    }
  );

  const { kpis, topProducts } = data || { kpis: {}, topProducts: [] };

  // Prepare Top Products for Chart
  const chartData = useMemo(() => {
      return (topProducts || []).slice(0, 10).map(p => ({
          name: p.product_name,
          value: p.total_bonified
      }));
  }, [topProducts]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
      return (
        <div className="p-6">
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro ao carregar dashboard</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
                <Button variant="outline" size="sm" onClick={retry} className="mt-4">Tentar Novamente</Button>
            </Alert>
        </div>
      );
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Dashboard de Bonificações | Costa Lavos</title>
      </Helmet>

      <PageHeader 
        title="Dashboard de Bonificações" 
        description="Visão geral de bonificações concedidas por período."
        breadcrumbs={[{ label: 'Bonificações', path: '/bonificacoes' }, { label: 'Dashboard' }]}
      />

      <FilterBar />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Bonificado" 
          value={formatCurrency(kpis.totalBonified || 0)} 
          icon={DollarSign} 
          color="text-emerald-600"
          subtext="No período selecionado"
        />
        <KPICard 
          title="Produto Destaque" 
          value={kpis.mostBonifiedProduct || '-'} 
          icon={Trophy} 
          color="text-amber-500"
          subtext="Maior volume bonificado"
        />
        <KPICard 
          title="Top Supervisor" 
          value={kpis.topSupervisor || '-'} 
          icon={Users} 
          color="text-blue-600"
        />
        <KPICard 
          title="Menor Supervisor" 
          value={kpis.bottomSupervisor || '-'} 
          icon={TrendingUp} 
          color="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Chart */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">Top 10 Produtos Bonificados (Valor)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" tickFormatter={(val) => `R$${val/1000}k`} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={150} 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    interval={0}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    formatter={(val) => formatCurrency(val)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index < 3 ? '#ec4899' : '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BonificacoesDashboard;