import React, { useMemo } from 'react';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useFilters } from '@/contexts/FilterContext';
import { formatDateForAPI, formatCurrency } from '@/lib/utils';
import KPIGrid from '@/components/dashboard/KPIGrid';
import PerformanceRanking from '@/components/dashboard/PerformanceRanking';
import CostaLavosCard from '@/components/dashboard/CostaLavosCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';

const SupervisorDashboard = ({ scope = {} }) => {
  const { filters } = useFilters();
  
  // CORRECTED PARAMS: Removed excess parameters causing RPC errors
  const params = useMemo(() => ({
    p_start_date: formatDateForAPI(filters.dateRange?.[0]),
    p_end_date: formatDateForAPI(filters.dateRange?.[1]),
    p_supervisor_name: scope?.teamId ? String(scope.teamId) : null,
    p_exclude_employees: filters.excludeEmployees || false,
    p_sellers: filters.sellers?.map(String),
    p_customer_groups: filters.customerGroups?.map(String),
    p_regions: filters.regions?.map(String),
    p_clients: filters.clients?.map(String),
    p_search_term: filters.searchTerm
  }), [filters, scope]);

  const { data, loading, error } = useAnalyticalData(
    'get_supervisor_analytical_data',
    params,
    { enabled: !!params.p_start_date }
  );

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-32 w-full" /><Skeleton className="h-96 w-full" /></div>;
  }

  if (error) {
      return <div className="p-6 bg-red-50 text-red-700 rounded-lg">Erro ao carregar dados: {error.message}</div>;
  }

  const { kpis, seller_performance, client_performance, churn_analysis } = data || {};

  // Adapt data for components
  const dashboardKpis = {
      totalRevenue: kpis?.total_revenue || 0,
      activeClients: kpis?.total_clients || 0,
      averageTicket: kpis?.average_ticket || 0,
      salesCount: kpis?.sales_count || 0,
      totalBonification: kpis?.total_bonification || 0, 
      totalEquipment: 0 
  };

  return (
    <div className="space-y-6">
      <section>
          <KPIGrid kpis={dashboardKpis} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col h-full min-h-[500px]">
             {/* Using RankingPerformance but passing explicit data via props would require refactoring RankingPerformance to accept external data. 
                 For now, we will use a dedicated internal component or adapt PerformanceRanking. 
                 Ideally PerformanceRanking fetches its own data, but here we have specific seller data from the supervisor RPC.
                 Let's map it to a simple table here to ensure it works immediately. 
             */}
             <Card className="h-full">
                <CardHeader><CardTitle>Performance da Equipe</CardTitle></CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={seller_performance || []} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12}} />
                            <Tooltip formatter={(val) => formatCurrency(val)} />
                            <Bar dataKey="total_revenue" fill="#4f46e5" radius={[0,4,4,0]} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
             </Card>
        </div>

        <div className="lg:col-span-1 flex flex-col h-full min-h-[500px]">
             <CostaLavosCard data={dashboardKpis} />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card className="h-[400px]">
            <CardHeader><CardTitle>Saúde da Carteira (Risco)</CardTitle></CardHeader>
            <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={churn_analysis || []}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="client_count"
                            nameKey="phase"
                        >
                            {(churn_analysis || []).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#22c55e', '#f97316', '#ef4444', '#eab308'][index % 4]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="middle" align="right" layout="vertical" />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
         </Card>
         
         <Card className="h-[400px]">
            <CardHeader><CardTitle>Top Clientes da Equipe</CardTitle></CardHeader>
            <CardContent className="h-[320px] overflow-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                        <tr><th className="px-4 py-2">Cliente</th><th className="px-4 py-2 text-right">Vendas</th></tr>
                    </thead>
                    <tbody>
                        {(client_performance || []).slice(0, 8).map((client, idx) => (
                            <tr key={idx} className="border-b">
                                <td className="px-4 py-2 truncate max-w-[200px]">{client.name}</td>
                                <td className="px-4 py-2 text-right font-medium">{formatCurrency(client.total_revenue)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </CardContent>
         </Card>
      </section>
    </div>
  );
};

export default SupervisorDashboard;