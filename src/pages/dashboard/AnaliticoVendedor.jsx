import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useFilters } from '@/contexts/FilterContext';
import FilterBar from '@/components/FilterBar';
import SupervisorDashboard from '@/components/dashboard/SupervisorDashboard'; // We reuse this layout as requested
import DrilldownExplorer from '@/components/DrilldownExplorer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const AnaliticoVendedor = () => {
  const { filters } = useFilters();

  // For seller view, we can pass the specific seller ID via filters or scope
  // The SupervisorDashboard component is generic enough to handle seller context if params allow
  const scope = useMemo(() => ({
    teamId: null, // No supervisor ID
    filters: filters
  }), [filters]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Analítico Vendedor | Costa Lavos</title>
      </Helmet>
      
      <FilterBar />
      
      <Tabs defaultValue="dashboard" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="explorer">Explorador Detalhado</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 focus-visible:outline-none">
           {/* Reusing Supervisor Dashboard Layout as requested */}
           <SupervisorDashboard scope={scope} />
        </TabsContent>

        <TabsContent value="explorer" className="focus-visible:outline-none">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardContent className="p-0 sm:p-6">
              <DrilldownExplorer 
                analysisMode="seller" 
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

export default AnaliticoVendedor;