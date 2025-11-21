import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Helmet } from 'react-helmet-async';

const dummyBloqueios = [
  { id: 'b1', profissional: 'Técnico Zé', data_inicio: '2025-12-01', data_fim: '2025-12-10', motivo: 'Férias', tipo: 'ferias' },
  { id: 'b2', profissional: 'Maria Santos', data_inicio: '2025-11-25', data_fim: '2025-11-25', motivo: 'Consulta Médica', tipo: 'outro' },
];

const BloqueiosPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAction = (action, id) => {
    if (action === 'Editar') {
      navigate(`/apoio/agenda/bloqueios/${id}/editar`);
    } else {
      toast({ title: "Funcionalidade em desenvolvimento", description: `🚧 A ação "${action}" para o bloqueio ${id} ainda não foi implementada.` });
    }
  };

  return (
    <>
      <Helmet>
        <title>Bloqueios de Agenda - Costa Lavos</title>
        <meta name="description" content="Gerencie os períodos de bloqueio na agenda dos profissionais." />
      </Helmet>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Bloqueios de Agenda</CardTitle>
              <CardDescription>Gerencie os períodos em que os profissionais estão indisponíveis.</CardDescription>
            </div>
            <Button onClick={() => navigate('/apoio/agenda/bloqueios/novo')}>
              <PlusCircle className="mr-2 h-4 w-4" /> Novo Bloqueio
            </Button>
          </div>
          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <Select><SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder="Filtrar por Profissional" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem></SelectContent></Select>
            <Select><SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Filtrar por Tipo" /></SelectTrigger><SelectContent><SelectItem value="ferias">Férias</SelectItem></SelectContent></Select>
            <Input type="date" className="w-full md:w-[180px]" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profissional</TableHead>
                <TableHead>Data Início</TableHead>
                <TableHead>Data Fim</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyBloqueios.map((bloqueio) => (
                <TableRow key={bloqueio.id}>
                  <TableCell className="font-medium">{bloqueio.profissional}</TableCell>
                  <TableCell>{bloqueio.data_inicio}</TableCell>
                  <TableCell>{bloqueio.data_fim}</TableCell>
                  <TableCell>{bloqueio.motivo}</TableCell>
                  <TableCell><Badge variant="secondary">{bloqueio.tipo}</Badge></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleAction('Editar', bloqueio.id)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleAction('Excluir', bloqueio.id)}>Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default BloqueiosPage;