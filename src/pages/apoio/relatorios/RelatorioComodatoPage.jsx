import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet-async';
import CardResumo from '@/components/CardResumo';
import GraficoPizza from '@/components/GraficoPizza';
import GraficoBarra from '@/components/GraficoBarra';
import TabelaRelatorio from '@/components/TabelaRelatorio';
import FiltrosRelatorio from '@/components/FiltrosRelatorio';
import ExportarRelatorioModal from './ExportarRelatorioModal';
import { FileDown } from 'lucide-react';

const dummyData = {
  resumo: { total: 1250, porStatus: 1200, maisTrocado: 'Modelo X' },
  graficos: {
    porStatus: [{ name: 'Instalado', value: 1200 }, { name: 'Em Manutenção', value: 50 }],
    porModelo: [{ name: 'Modelo X', value: 800 }, { name: 'Modelo Y', value: 450 }],
    porCliente: [{ name: 'Padaria A', value: 30 }, { name: 'Mercado B', value: 25 }],
    motivos: [{ name: 'Defeito', value: 10 }, { name: 'Upgrade', value: 5 }],
  },
  tabela: [
    { cliente: 'Padaria A', modelo: 'Modelo X', status: 'Instalado', quantidade: 30, motivo: 'Defeito' },
    { cliente: 'Mercado B', modelo: 'Modelo Y', status: 'Instalado', quantidade: 25, motivo: 'Upgrade' },
  ],
};
const colunasTabela = [
  { header: 'Cliente', accessor: 'cliente' },
  { header: 'Modelo', accessor: 'modelo' },
  { header: 'Status', accessor: 'status' },
  { header: 'Quantidade', accessor: 'quantidade' },
  { header: 'Motivo Mais Frequente', accessor: 'motivo' },
];

const RelatorioComodatoPage = () => {
  const { toast } = useToast();
  const [modalExportarOpen, setModalExportarOpen] = useState(false);

  return (
    <>
      <Helmet><title>Relatório de Comodato - APoio</title></Helmet>
      <div className="space-y-6">
        <FiltrosRelatorio onAplicar={() => toast({ title: 'Filtros aplicados (simulação).' })}>
          <div><Label>Data Início</Label><Input type="date" /></div>
          <div><Label>Data Fim</Label><Input type="date" /></div>
          <div><Label>Cliente</Label><Select><SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent></Select></div>
          <div><Label>Modelo</Label><Select><SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent></Select></div>
          <div><Label>Status</Label><Select><SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent></Select></div>
          <Button variant="outline" onClick={() => setModalExportarOpen(true)}>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </FiltrosRelatorio>
        
        <div className="grid gap-4 md:grid-cols-3">
          <CardResumo titulo="Total de Equipamentos" valor={dummyData.resumo.total} />
          <CardResumo titulo="Equipamentos por Status" valor={dummyData.resumo.porStatus} />
          <CardResumo titulo="Equipamento Mais Trocado" valor={dummyData.resumo.maisTrocado} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card><CardContent className="pt-6"><GraficoPizza dados={dummyData.graficos.porStatus} titulo="Equipamentos por Status" /></CardContent></Card>
          <Card><CardContent className="pt-6"><GraficoBarra dados={dummyData.graficos.porModelo} titulo="Equipamentos por Modelo" eixoX="name" eixoY="value" /></CardContent></Card>
        </div>
        
        <Card>
          <CardHeader><CardTitle>Detalhes por Cliente</CardTitle></CardHeader>
          <CardContent>
            <TabelaRelatorio dados={dummyData.tabela} colunas={colunasTabela} />
          </CardContent>
        </Card>
      </div>
      <ExportarRelatorioModal open={modalExportarOpen} onOpenChange={setModalExportarOpen} />
    </>
  );
};

export default RelatorioComodatoPage;