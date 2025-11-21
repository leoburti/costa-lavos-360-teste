import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, RefreshCw } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Helmet } from 'react-helmet-async';

const dummyConflitos = [
  { id: 'c1', profissional: 'Técnico Zé', data: '2025-11-20', hora: '09:00-10:00', tipo_conflito: 'sobreposicao', resolvido: false, eventos: ['Evento A', 'Evento B'] },
  { id: 'c2', profissional: 'Maria Santos', data: '2025-11-21', hora: '14:00-15:00', tipo_conflito: 'bloqueio', resolvido: false, eventos: ['Evento C', 'Bloqueio'] },
];

const ConflitosPage = () => {
  const { toast } = useToast();

  const handleAction = (action, id) => {
    toast({ title: "Funcionalidade em desenvolvimento", description: `🚧 A ação "${action}" para o conflito ${id} ainda não foi implementada.` });
  };

  return (
    <>
      <Helmet>
        <title>Conflitos de Agenda - Costa Lavos</title>
        <meta name="description" content="Visualize e gerencie conflitos na agenda dos profissionais." />
      </Helmet>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total de Conflitos</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">2</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Não Resolvidos</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">2</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Resolvidos</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">0</div></CardContent></Card>
        </div>
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>Conflitos de Agenda</CardTitle>
                <CardDescription>Lista de conflitos de agendamento que precisam de atenção.</CardDescription>
              </div>
              <Button variant="outline" onClick={() => handleAction('Detectar Novos Conflitos')}>
                <RefreshCw className="mr-2 h-4 w-4" /> Detectar Novos Conflitos
              </Button>
            </div>
            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <Select><SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder="Filtrar por Profissional" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem></SelectContent></Select>
              <Select><SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Filtrar por Tipo" /></SelectTrigger><SelectContent><SelectItem value="sobreposicao">Sobreposição</SelectItem></SelectContent></Select>
              <Select><SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Filtrar por Resolução" /></SelectTrigger><SelectContent><SelectItem value="pendente">Não Resolvido</SelectItem><SelectItem value="resolvido">Resolvido</SelectItem></SelectContent></Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Tipo de Conflito</TableHead>
                  <TableHead>Eventos Envolvidos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyConflitos.map((conflito) => (
                  <TableRow key={conflito.id}>
                    <TableCell className="font-medium">{conflito.profissional}</TableCell>
                    <TableCell>{conflito.data}</TableCell>
                    <TableCell>{conflito.hora}</TableCell>
                    <TableCell><Badge variant="destructive">{conflito.tipo_conflito}</Badge></TableCell>
                    <TableCell>{conflito.eventos.join(', ')}</TableCell>
                    <TableCell><Badge variant={conflito.resolvido ? 'success' : 'destructive'}>{conflito.resolvido ? 'Resolvido' : 'Não Resolvido'}</Badge></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAction('Ver Detalhes', conflito.id)}>Ver Detalhes</DropdownMenuItem>
                          {!conflito.resolvido && <DropdownMenuItem onClick={() => handleAction('Resolver Conflito', conflito.id)}>Resolver Conflito</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ConflitosPage;