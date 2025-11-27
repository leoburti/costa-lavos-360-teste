
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { 
  UserMinus, 
  TrendingDown, 
  AlertTriangle, 
  Users, 
  ArrowDownRight 
} from 'lucide-react';

import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import KPICard from '@/components/supervisor/KPICard';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

const AnaliseChurn = () => {
  const { filters } = useFilters();

  // This RPC calculates churn based on 'last sale date' relative to DB max date
  // It does NOT accept start/end date parameters.
  const params = {
    p_exclude_employees: filters.excludeEmployees,
    p_supervisors: filters.supervisors,
    p_sellers: filters.sellers,
    p_customer_groups: filters.customerGroups,
    p_regions: filters.regions,
    p_clients: filters.clients,
    p_search_term: filters.searchTerm
  };

  const { data, loading } = useAnalyticalData('get_churn_analysis_data_v3', params);

  const kpis = data?.kpis || {};
  const phase1 = data?.phase1 || [];
  const phase2 = data?.phase2 || [];
  const phase3 = data?.phase3 || [];
  const phase4 = data?.phase4 || [];

  const totalRiskRevenue = (kpis.phase1Loss || 0) + (kpis.phase2Loss || 0) + (kpis.phase3Loss || 0) + (kpis.phase4Loss || 0);
  const totalRiskClients = (kpis.phase1Count || 0) + (kpis.phase2Count || 0) + (kpis.phase3Count || 0) + (kpis.phase4Count || 0);

  const ClientList = ({ clients, title, color }) => (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className={`text-sm font-bold uppercase tracking-wider ${color}`}>{title}</CardTitle>
        <CardDescription>{clients.length} clientes</CardDescription>
      </CardHeader>
      <CardContent className="max-h-[300px] overflow-y-auto space-y-2">
        {clients.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhum cliente nesta fase.</p>
        ) : (
          clients.map((c, i) => (
            <div key={i} className="flex justify-between items-center p-2 bg-slate-50 rounded text-sm">
              <div className="truncate flex-1 pr-2">
                <p className="font-medium text-slate-700 truncate">{c.client_name}</p>
                <p className="text-[10px] text-slate-500">{c.days_since_last_purchase} dias sem compra</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-700">{formatCurrency(c.monthly_revenue_loss)}</p>
                <p className="text-[10px] text-slate-400">Perda Mensal Est.</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Análise de Churn | Costa Lavos</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Análise de Risco & Churn</h1>
        <p className="text-muted-foreground">Monitoramento de inatividade e risco de perda de carteira.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : (
          <>
            <KPICard 
              title="Receita em Risco (Total)" 
              value={formatCurrency(totalRiskRevenue)} 
              icon={TrendingDown} 
              color="rose"
              subValue="Soma da média mensal de todos clientes em risco"
            />
            <KPICard 
              title="Clientes em Risco" 
              value={totalRiskClients} 
              icon={UserMinus} 
              color="amber" 
            />
            <KPICard 
              title="Fase Crítica (>90 dias)" 
              value={kpis.phase4Count} 
              subValue={formatCurrency(kpis.phase4Loss)}
              icon={AlertTriangle} 
              color="red" 
            />
            <KPICard 
              title="Risco Inicial (30-60 dias)" 
              value={kpis.phase2Count} 
              subValue={formatCurrency(kpis.phase2Loss)}
              icon={ArrowDownRight} 
              color="blue" 
            />
          </>
        )}
      </div>

      {/* Phases */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
           [...Array(4)].map((_, i) => <Skeleton key={i} className="h-[350px]" />)
        ) : (
          <>
            <ClientList clients={phase1} title="Alerta (0-30 Dias)" color="text-blue-600" />
            <ClientList clients={phase2} title="Risco (31-60 Dias)" color="text-amber-600" />
            <ClientList clients={phase3} title="Alto Risco (61-90 Dias)" color="text-orange-600" />
            <ClientList clients={phase4} title="Crítico (>90 Dias)" color="text-red-600" />
          </>
        )}
      </div>
    </div>
  );
};

export default AnaliseChurn;
