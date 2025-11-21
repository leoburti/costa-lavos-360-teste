import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { geolocalizacaoService } from '@/services/geolocalizacaoService';
import { exportToPDF, exportToCSV } from '@/utils/geoExportUtils';
import { useToast } from '@/components/ui/use-toast';
import { format, subDays } from 'date-fns';

import GeoFilters from './relatorios/GeoFilters';
import GeoKPIs from './relatorios/GeoKPIs';
import DeslocamentoReport from './relatorios/DeslocamentoReport';
import ProdutividadeReport from './relatorios/ProdutividadeReport';
import GeofencingReport from './relatorios/GeofencingReport';
import EquipeReport from './relatorios/EquipeReport';

export default function RelatoriosPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('deslocamento');
  const [profissionais, setProfissionais] = useState([]);
  
  const [filters, setFilters] = useState({
    dataInicio: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    dataFim: format(new Date(), 'yyyy-MM-dd'),
    profissionalId: null
  });

  const [reportData, setReportData] = useState({
    deslocamento: [],
    produtividade: [],
    geofencing: [],
    equipe: []
  });

  const [kpis, setKpis] = useState({
    distanciaTotal: 0,
    tempoTotal: 0,
    chamadosConcluidos: 0,
    alertasTotal: 0
  });

  useEffect(() => {
    loadProfissionais();
  }, []);

  useEffect(() => {
    loadData();
  }, [activeTab]); // Reload when tab changes to ensure fresh data, or could load all at once

  const loadProfissionais = async () => {
    try {
      const data = await geolocalizacaoService.getProfissionais();
      setProfissionais(data || []);
    } catch (error) {
      console.error("Erro ao carregar profissionais", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      let data = [];
      
      // Load specific tab data
      if (activeTab === 'deslocamento') {
        data = await geolocalizacaoService.getRelatorioDeslocamento(filters.dataInicio, filters.dataFim, filters.profissionalId);
        setReportData(prev => ({ ...prev, deslocamento: data }));
      } else if (activeTab === 'produtividade') {
        data = await geolocalizacaoService.getRelatorioProdutividade(filters.dataInicio, filters.dataFim, filters.profissionalId);
        setReportData(prev => ({ ...prev, produtividade: data }));
      } else if (activeTab === 'geofencing') {
        data = await geolocalizacaoService.getRelatorioGeofencing(filters.dataInicio, filters.dataFim, filters.profissionalId);
        setReportData(prev => ({ ...prev, geofencing: data }));
      } else if (activeTab === 'equipe') {
        data = await geolocalizacaoService.getRelatorioEquipe(filters.dataInicio, filters.dataFim);
        setReportData(prev => ({ ...prev, equipe: data }));
      }

      // Update KPIs (simplified logic: fetch consolidated team report for KPIs if not already fetched)
      const equipeData = await geolocalizacaoService.getRelatorioEquipe(filters.dataInicio, filters.dataFim);
      const kpiData = equipeData.reduce((acc, curr) => ({
        distanciaTotal: acc.distanciaTotal + Number(curr.distancia_total_km),
        tempoTotal: acc.tempoTotal + 0, // Tempo total not in consolidated yet, would need adjustment
        chamadosConcluidos: acc.chamadosConcluidos + Number(curr.chamados_concluidos),
        alertasTotal: acc.alertasTotal + Number(curr.alertas_geofencing)
      }), { distanciaTotal: 0, tempoTotal: 0, chamadosConcluidos: 0, alertasTotal: 0 });
      
      setKpis(kpiData);

    } catch (error) {
      console.error("Erro ao carregar relatório", error);
      toast({ variant: "destructive", title: "Erro", description: "Falha ao carregar dados do relatório." });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadData();
  };

  const handleExportPDF = () => {
    const title = `Relatório de ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`;
    let columns = [];
    let data = [];

    if (activeTab === 'deslocamento') {
      columns = ['Data', 'Profissional', 'Distância (km)', 'Tempo (h)', 'Vel. Média'];
      data = reportData.deslocamento.map(r => [format(new Date(r.data), 'dd/MM/yyyy'), r.profissional_nome, Number(r.distancia_total_km).toFixed(2), Number(r.tempo_total_horas).toFixed(2), Number(r.velocidade_media_kmh).toFixed(1)]);
    } else if (activeTab === 'produtividade') {
      columns = ['Profissional', 'Total Chamados', 'Concluídos', 'Tempo Médio (min)'];
      data = reportData.produtividade.map(r => [r.profissional_nome, r.total_chamados, r.chamados_concluidos, Number(r.tempo_medio_atendimento_minutos).toFixed(0)]);
    } else if (activeTab === 'geofencing') {
      columns = ['Data/Hora', 'Profissional', 'Cliente', 'Tipo', 'Distância (m)', 'Endereço'];
      data = reportData.geofencing.map(r => [format(new Date(r.data_hora), 'dd/MM/yyyy HH:mm'), r.profissional_nome, r.cliente_nome, r.tipo, Number(r.distancia_metros).toFixed(0), r.endereco_registrado]);
    } else if (activeTab === 'equipe') {
      columns = ['Profissional', 'Total Chamados', 'Concluídos', 'Distância (km)', 'Alertas Geo'];
      data = reportData.equipe.map(r => [r.profissional_nome, r.total_chamados, r.chamados_concluidos, Number(r.distancia_total_km).toFixed(1), r.alertas_geofencing]);
    }

    exportToPDF(title, columns, data);
  };

  const handleExportCSV = () => {
    const title = `Relatório de ${activeTab}`;
    exportToCSV(title, reportData[activeTab]);
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Relatórios de Geolocalização - Apoio</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-bold">Relatórios de Geolocalização</h1>
        <p className="text-muted-foreground mt-1">Análise detalhada de deslocamento, produtividade e conformidade.</p>
      </div>

      <GeoFilters 
        filters={filters} 
        setFilters={setFilters} 
        profissionais={profissionais} 
        onSearch={handleSearch}
        onExportPDF={handleExportPDF}
        onExportCSV={handleExportCSV}
        loading={loading}
      />

      <GeoKPIs data={kpis} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="deslocamento">Deslocamento</TabsTrigger>
          <TabsTrigger value="produtividade">Produtividade</TabsTrigger>
          <TabsTrigger value="geofencing">Geofencing</TabsTrigger>
          <TabsTrigger value="equipe">Equipe</TabsTrigger>
        </TabsList>

        <TabsContent value="deslocamento">
          <DeslocamentoReport data={reportData.deslocamento} />
        </TabsContent>
        
        <TabsContent value="produtividade">
          <ProdutividadeReport data={reportData.produtividade} />
        </TabsContent>

        <TabsContent value="geofencing">
          <GeofencingReport data={reportData.geofencing} />
        </TabsContent>

        <TabsContent value="equipe">
          <EquipeReport data={reportData.equipe} />
        </TabsContent>
      </Tabs>
    </div>
  );
}