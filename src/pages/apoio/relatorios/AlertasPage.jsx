import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet-async';
import CardResumo from '@/components/CardResumo';
import GraficoPizza from '@/components/GraficoPizza';
import { MoreHorizontal, Eye, CheckCircle } from 'lucide-react';
import AlertaDetalhesModal from './AlertaDetalhesModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const dummyAlertas = [
  { id: 1, tipo_alerta: 'chamado_atrasado', severidade: 'alta', titulo: 'Chamado #1234 Atrasado', descricao: 'O chamado está em andamento há mais de 4 horas.', data_criacao: new Date(), resolvido: false, dados_relacionados: { chamadoId: 1234 } },
  { id: 2, tipo_alerta: 'profissional_inativo', severidade: 'media', titulo: 'Profissional Zé Inativo', descricao: 'Zé não faz check-in há 6 horas.', data_criacao: new Date(), resolvido: false, dados_relacionados: { profissionalId: 'abc' } },
  { id: 3, tipo_alerta: 'equipamento_critico', severidade: 'critica', titulo: 'Equipamento XYZ com defeito', descricao: 'Equipamento XYZ reportou falha crítica.', data_criacao: new Date(), resolvido: true, data_resolucao: new Date(), dados_relacionados: { equipamentoId: 'xyz' } },
];

const severidadeCores = {
  baixa: 'bg-blue-500',
  media: 'bg-yellow-500',
  alta: 'bg-orange-500',
  critica: 'bg-red-500',
};

const AlertasPage = () => {
  const { toast } = useToast();
  const [alertaSelecionado, setAlertaSelecionado] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleVerDetalhes = (alerta) => {
    setAlertaSelecionado(alerta);
    setModalOpen(true);
  };

  const handleResolver = (id) => {
    toast({ title: "Funcionalidade em desenvolvimento", description: "Resolver alerta ainda não implementado." });
  };
  
  const alertasPorTipo = [
    { name: 'Chamado Atrasado', value: 1 },
    { name: 'Profissional Inativo', value: 1 },
    { name: 'Equipamento Crítico', value: 1 },
  ];
  const alertasPorSeveridade = [
    { name: 'Crítica', value: 1 },
    { name: 'Alta', value: 1 },
    { name: 'Média', value: 1 },
  ];

  return (
    <>
      <Helmet>
        <title>Alertas e Monitoramento - APoio</title>
      </Helmet>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <CardResumo titulo="Total de Alertas" valor="3" />
          <CardResumo titulo="Alertas Críticos" valor="1" />
          <CardResumo titulo="Alertas Não Resolvidos" valor="2" />
          <CardResumo titulo="Resolvidos Hoje" valor="1" />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Lista de Alertas</CardTitle>
            <CardDescription>Filtre e gerencie os alertas do sistema.</CardDescription>
            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <Select><SelectTrigger><SelectValue placeholder="Filtrar por Tipo" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent></Select>
              <Select><SelectTrigger><SelectValue placeholder="Filtrar por Severidade" /></SelectTrigger><SelectContent><SelectItem value="todas">Todas</SelectItem></SelectContent></Select>
              <Select><SelectTrigger><SelectValue placeholder="Filtrar por Status" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent></Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyAlertas.map((alerta) => (
                  <TableRow key={alerta.id}>
                    <TableCell>{alerta.tipo_alerta}</TableCell>
                    <TableCell><Badge className={severidadeCores[alerta.severidade]}>{alerta.severidade}</Badge></TableCell>
                    <TableCell>{alerta.titulo}</TableCell>
                    <TableCell>{new Date(alerta.data_criacao).toLocaleString()}</TableCell>
                    <TableCell><Badge variant={alerta.resolvido ? 'success' : 'outline'}>{alerta.resolvido ? 'Resolvido' : 'Pendente'}</Badge></TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleVerDetalhes(alerta)}><Eye className="mr-2 h-4 w-4" /> Ver Detalhes</DropdownMenuItem>
                          {!alerta.resolvido && <DropdownMenuItem onClick={() => handleResolver(alerta.id)}><CheckCircle className="mr-2 h-4 w-4" /> Resolver</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card><CardContent className="pt-6"><GraficoPizza dados={alertasPorTipo} titulo="Alertas por Tipo" /></CardContent></Card>
          <Card><CardContent className="pt-6"><GraficoPizza dados={alertasPorSeveridade} titulo="Alertas por Severidade" /></CardContent></Card>
        </div>
      </div>
      <AlertaDetalhesModal alerta={alertaSelecionado} open={modalOpen} onOpenChange={setModalOpen} onResolver={handleResolver} />
    </>
  );
};

export default AlertasPage;