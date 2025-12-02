import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardGeral from './dashboard/DashboardGeral';
import DashboardComercial from './DashboardComercial';
import DashboardAnalytico from './dashboard/DashboardAnalytico';

const DashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'geral';

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-4 w-full md:w-auto grid grid-cols-3 md:inline-flex">
            <TabsTrigger value="geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="comercial">Visão Comercial</TabsTrigger>
            <TabsTrigger value="analitico">Visão Analítica</TabsTrigger>
          </TabsList>
          
          <TabsContent value="geral" className="mt-0">
            <DashboardGeral />
          </TabsContent>
          
          <TabsContent value="comercial" className="mt-0">
            <DashboardComercial />
          </TabsContent>
          
          <TabsContent value="analitico" className="mt-0">
            <DashboardAnalytico />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardPage;