
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { Gift, TrendingUp, Award } from 'lucide-react';

import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import KPICard from '@/components/supervisor/KPICard';
import RankingTable from '@/components/RankingTable';

const AnaliticoBonificados = () => {
  const { filters } = useFilters();
  const startDate = filters.dateRange?.from ? format(filters.dateRange.from, 'yyyy-MM-dd') : null;
  const endDate = filters.dateRange?.to ? format(filters.dateRange.to, 'yyyy-MM-dd') : null;

  const params = {
    p_start_date: startDate,
    p_end_date: endDate,
    p_exclude_employees: filters.excludeEmployees,
    p_supervisors: filters.supervisors,
    p_sellers: filters.sellers,
    p_customer_groups: filters.customerGroups,
    p_regions: filters.regions,
    p_clients: filters.clients,
    p_search_term: filters.searchTerm,
    p_show_defined_groups_only: false // Added missing param
  };

  const { data, loading } = useAnalyticalData('get_bonification_analysis', params, { enabled: !!startDate && !!endDate });

  const kpis = data?.kpis || {};
  
  // Transform data for RankingTable
  const rankingData = {
    salesByProduct: data?.topProducts?.map(p => ({ name: p.product_name, value: p.total_bonified, quantity: 0 })) || [],
    salesBySupervisor: data?.distribution?.supervisor || [],
    salesBySeller: data?.distribution?.seller || [],
    salesByCustomerGroup: data?.distribution?.customer_group || [],
    salesByClient: data?.distribution?.client || [],
    regionalSales: [] // Not provided by this specific RPC structure perfectly, skipping or need adaptation
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Analítico de Bonificações | Costa Lavos</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analítico de Bonificações</h1>
        <p className="text-muted-foreground">Visão detalhada sobre investimentos em bonificação.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : (
          <>
            <KPICard 
              title="Produto Mais Bonificado" 
              value={kpis.mostBonifiedProduct || '-'} 
              icon={Gift} 
              color="purple" 
            />
            <KPICard 
              title="Top Supervisor (Bonif.)" 
              value={kpis.topSupervisor || '-'} 
              icon={Award} 
              color="amber" 
            />
            <KPICard 
              title="Menor Índice (Supervisor)" 
              value={kpis.bottomSupervisor || '-'} 
              icon={TrendingUp} 
              color="emerald" 
            />
          </>
        )}
      </div>

      {loading ? <Skeleton className="h-[500px]" /> : <RankingTable data={rankingData} />}
    </div>
  );
};

export default AnaliticoBonificados;
