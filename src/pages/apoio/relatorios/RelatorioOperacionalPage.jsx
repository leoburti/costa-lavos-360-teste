import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet-async';
import CardResumo from '@/components/CardResumo';
import GraficoBarra from '@/components/GraficoBarra';
import TabelaRelatorio from '@/components/TabelaRelatorio';
import FiltrosRelatorio from '@/components/FiltrosRelatorio';
import ExportarRelatorioModal from './ExportarRelatorioModal';
import { FileDown } from 'lucide-react';

const dummyData = {
  resumo: { tma: '55 min', chamados: 120, km: 850, aderencia: '95%' },
  graficos: {
    produtividade: [{ name: 'Zé', value: 30 }, { name: 'Maria', value: 45 }],
    tempoAtendimento: [{ name: 'Zé', value: 50 }, { name: 'Maria', value: 60 }],
    kmRodado: [{ name: 'Zé', value: 400 }, { name: 'Maria', value: 450 }],
    aderencia: [{ name: 'Zé', value: 98 }, { name: 'Maria', value: 92 }],
  },
  tabela: [
    { profissional: 'Zé', chamados: 30, tma: 50, km: 400, aderencia: 98 },
    { profissional: 'Maria', chamados: 45, tma: 60, km: 450, aderencia: 92 },
  ],
};
const colunasTabela = [
  { header: 'Profissional', accessor: 'profissional' },
  { header: 'Chamados Exec.', accessor: 'chamados' },
  { header: 'TMA (min)', accessor: 'tma' },
  { header: 'KM Rodado', accessor: 'km' },
  { header: 'Aderência (%)', accessor: 'aderencia' },
];

const RelatorioOperacionalPage = () => {
  const { toast } = useToast();
  const [modalExportarOpen, setModalExportarOpen] = useState(false);

  return (
    <>
      <Helmet><title>Relatório Operacional - APoio</title></Helmet>
      <div className="space-y-6">
        <FiltrosRelatorio onAplicar={() => toast({ title: 'Filtros aplicados (simulação).' })}>
          <div><Label>Data Início</Label><Input type="date" /></div>
          <div><Label>Data Fim</Label><Input type="date" /></div>
          <div><Label>Profissional</Label><Select><SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent></Select></div>
          <div><Label>Tipo de Chamado</Label><Select><SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent></Select></div>
          <Button variant="outline" onClick={() => setModalExportarOpen(true)}>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </FiltrosRelatorio>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <CardResumo titulo="TMA" valor={dummyData.resumo.tma} />
          <CardResumo titulo="Chamados Executados" valor={dummyData.resumo.chamados} />
          <CardResumo titulo="KM Rodado" valor={dummyData.resumo.km} />
          <CardResumo titulo="Taxa de Aderência" valor={dummyData.resumo.aderencia} />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card><CardContent className="pt-6"><GraficoBarra dados={dummyData.graficos.produtividade} titulo="Produtividade por Profissional" eixoX="name" eixoY="value" /></CardContent></Card>
          <Card><CardContent className="pt-6"><GraficoBarra dados={dummyData.graficos.aderencia} titulo="Aderência (%) por Profissional" eixoX="name" eixoY="value" /></CardContent></Card>
        </div>
        
        <Card>
          <CardHeader><CardTitle>Detalhes por Profissional</CardTitle></CardHeader>
          <CardContent>
            <TabelaRelatorio dados={dummyData.tabela} colunas={colunasTabela} />
          </CardContent>
        </Card>
      </div>
      <ExportarRelatorioModal open={modalExportarOpen} onOpenChange={setModalExportarOpen} />
    </>
  );
};

export default RelatorioOperacionalPage;