import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { formatDateForAPI } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FilterBar from '@/components/FilterBar';
import SupervisorDashboard from '@/components/dashboard/SupervisorDashboard';
import DrilldownExplorer from '@/components/DrilldownExplorer';

const AnaliticoSupervisor = () => {
  const { filters } = useFilters();

  // Explicitly defined scope for the dashboard component
  const scope = useMemo(() => ({
    teamId: filters.supervisors?.length === 1 ? filters.supervisors[0] : null,
    filters: filters
  }), [filters]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Analítico Supervisor | Costa Lavos</title>
      </Helmet>
      
      <FilterBar />
      
      <Tabs defaultValue="dashboard" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="explorer">Explorador Detalhado</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 focus-visible:outline-none">
           {/* SupervisorDashboard handles its own data fetching internally now with corrected params */}
           <SupervisorDashboard scope={scope} />
        </TabsContent>

        <TabsContent value="explorer" className="focus-visible:outline-none">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardContent className="p-0 sm:p-6">
              <DrilldownExplorer 
                analysisMode="supervisor" 
                rpcName="get_drilldown_data"
                initialFilters={filters}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnaliticoSupervisor;