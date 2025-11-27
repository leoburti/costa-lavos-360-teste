import React, { useState } from 'react';
import { useFilter } from '@/contexts/FilterContext';
import FilterBar from '@/components/FilterBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardComercial from './DashboardComercial';
import DashboardAnalytico from './DashboardAnalytico';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('comercial');

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-slate-50/50">
      <div className="flex-none p-6 pb-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {activeTab === 'comercial' ? 'Dashboard Comercial' : 'Análise de Vendas'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {activeTab === 'comercial' 
                ? 'Visão geral de performance e resultados' 
                : 'Detalhamento temporal e tendências'}
            </p>
          </div>
          <FilterBar />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
          <TabsList>
            <TabsTrigger value="comercial">Visão Comercial</TabsTrigger>
            <TabsTrigger value="analitico">Visão Analítica</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 pt-0">
        {activeTab === 'comercial' ? <DashboardComercial /> : <DashboardAnalytico />}
      </div>
    </div>
  );
};

export default DashboardPage;