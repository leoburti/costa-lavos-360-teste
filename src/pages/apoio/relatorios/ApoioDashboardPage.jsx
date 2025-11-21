import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { format, subDays } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { apoioRelatoriosService } from '@/services/apoioRelatoriosService';
import { exportToPDF, exportToCSV } from '@/utils/geoExportUtils';

import ApoioFilters from './components/ApoioFilters';
import ApoioKPIs from './components/ApoioKPIs';
import ChamadosTab from './tabs/ChamadosTab';
import TecnicosTab from './tabs/TecnicosTab';
import EquipamentosTab from './tabs/EquipamentosTab';
import PersonalizadoTab from './tabs/PersonalizadoTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ApoioDashboardPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('visao-geral');
  
  const [filters, setFilters] = useState({
    dataInicio: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    dataFim: format(new Date(), 'yyyy-MM-dd'),
  });

  const [dashboardData, setDashboardData] = useState({
    kpis: null,
    chamados: null,
    tecnicos: [],
    equipamentos: null
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [kpis, chamados, tecnicos, equipamentos] = await Promise.all([
        apoioRelatoriosService.getDashboardKPIs(filters.dataInicio, filters.dataFim),
        apoioRelatoriosService.getChamadosAnalitico(filters.dataInicio, filters.dataFim),
        apoioRelatoriosService.getTecnicosPerformance(filters.dataInicio, filters.dataFim),
        apoioRelatoriosService.getEquipamentosStats(filters.dataInicio, filters.dataFim)
      ]);

      setDashboardData({ kpis, chamados, tecnicos, equipamentos });
    } catch (error) {
      console.error("Erro ao carregar dashboard de apoio", error);
      toast({ variant: "destructive", title: "Erro", description: "Falha ao carregar dados do dashboard." });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (activeTab === 'tecnicos') {
      exportToCSV('Relatorio_Tecnicos_Apoio', dashboardData.tecnicos);
    } else if (activeTab === 'visao-geral') {
       toast({ title: "Exportação", description: "Exportando resumo de chamados..." });
    } else {
      toast({ title: "Exportação", description: "Exportação disponível na aba de Técnicos por enquanto." });
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <Helmet>
        <title>Dashboard Apoio - Costa Lavos</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Apoio</h1>
          <p className="text-gray-500 mt-1">Visão analítica exclusiva das operações de suporte técnico.</p>
        </div>
      </div>

      <ApoioFilters 
        filters={filters} 
        setFilters={setFilters} 
        onSearch={loadData} 
        onExport={handleExport}
        loading={loading} 
      />

      <ApoioKPIs data={dashboardData.kpis} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white p-1 rounded-lg border shadow-sm flex flex-wrap h-auto">
          <TabsTrigger value="visao-geral">Visão Geral (Chamados)</TabsTrigger>
          <TabsTrigger value="tecnicos">Produtividade Técnica</TabsTrigger>
          <TabsTrigger value="equipamentos">Equipamentos & Comodato</TabsTrigger>
          <TabsTrigger value="personalizado">Personalizado</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral">
          <ChamadosTab data={dashboardData.chamados} />
        </TabsContent>
        
        <TabsContent value="tecnicos">
          <TecnicosTab data={dashboardData.tecnicos} />
        </TabsContent>

        <TabsContent value="equipamentos">
          <EquipamentosTab data={dashboardData.equipamentos} />
        </TabsContent>

        <TabsContent value="personalizado">
          <PersonalizadoTab dashboardData={dashboardData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}