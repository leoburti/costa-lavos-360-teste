import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Helmet } from 'react-helmet-async';

const dummyDisponibilidade = [
  { id: 'd1', profissional: 'Técnico Zé', dia_semana: 'Segunda-feira', hora_inicio: '08:00', hora_fim: '17:00', ativo: true },
  { id: 'd2', profissional: 'Técnico Zé', dia_semana: 'Terça-feira', hora_inicio: '08:00', hora_fim: '17:00', ativo: true },
];

const DisponibilidadePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAction = (action, id) => {
    if (action === 'Editar') {
      navigate(`/apoio/agenda/disponibilidade/${id}/editar`);
    } else {
      toast({ title: "Funcionalidade em desenvolvimento", description: `🚧 A ação "${action}" para a disponibilidade ${id} ainda não foi implementada.` });
    }
  };

  return (
    <>
      <Helmet>
        <title>Disponibilidade de Profissionais - Costa Lavos</title>
        <meta name="description" content="Gerencie os horários de disponibilidade dos profissionais." />
      </Helmet>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Disponibilidade de Profissionais</CardTitle>
              <CardDescription>Defina os horários em que cada profissional está disponível para atendimentos.</CardDescription>
            </div>
            <Button onClick={() => navigate('/apoio/agenda/disponibilidade/novo')}>
              <PlusCircle className="mr-2 h-4 w-4" /> Nova Disponibilidade
            </Button>
          </div>
          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <Select><SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder="Filtrar por Profissional" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem></SelectContent></Select>
            <Select><SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Filtrar por Status" /></SelectTrigger><SelectContent><SelectItem value="ativo">Ativo</SelectItem></SelectContent></Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profissional</TableHead>
                <TableHead>Dia da Semana</TableHead>
                <TableHead>Hora Início</TableHead>
                <TableHead>Hora Fim</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyDisponibilidade.map((disp) => (
                <TableRow key={disp.id}>
                  <TableCell className="font-medium">{disp.profissional}</TableCell>
                  <TableCell>{disp.dia_semana}</TableCell>
                  <TableCell>{disp.hora_inicio}</TableCell>
                  <TableCell>{disp.hora_fim}</TableCell>
                  <TableCell><Badge variant={disp.ativo ? 'success' : 'destructive'}>{disp.ativo ? 'Sim' : 'Não'}</Badge></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleAction('Editar', disp.id)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleAction('Excluir', disp.id)}>Excluir</DropdownMenuItem>
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

export default DisponibilidadePage;