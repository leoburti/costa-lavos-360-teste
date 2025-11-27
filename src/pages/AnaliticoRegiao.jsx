
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { Map } from 'lucide-react';

import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import RankingTable from '@/components/RankingTable';

const AnaliticoRegiao = () => {
  const { filters } = useFilters();
  const startDate = filters.dateRange?.from ? format(filters.dateRange.from, 'yyyy-MM-dd') : null;
  const endDate = filters.dateRange?.to ? format(filters.dateRange.to, 'yyyy-MM-dd') : null;

  // get_regional_summary_v2 does NOT support p_supervisors or p_sellers
  const params = {
    p_start_date: startDate,
    p_end_date: endDate,
    p_exclude_employees: filters.excludeEmployees,
    p_customer_groups: filters.customerGroups,
    p_regions: filters.regions,
    p_clients: filters.clients,
    p_search_term: filters.searchTerm,
    p_analysis_mode: 'region',
    p_show_defined_groups_only: false
  };

  const { data, loading } = useAnalyticalData('get_regional_summary_v2', params, { enabled: !!startDate && !!endDate });

  // Transform for ranking table
  const formattedData = {
    regionalSales: data || []
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Analítico por Região | Costa Lavos</title>
      </Helmet>

      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-3 rounded-full">
          <Map className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analítico por Região</h1>
          <p className="text-muted-foreground">Desempenho de vendas geográfico.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ranking Regional</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-[400px]" /> : <RankingTable data={formattedData} />}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnaliticoRegiao;
