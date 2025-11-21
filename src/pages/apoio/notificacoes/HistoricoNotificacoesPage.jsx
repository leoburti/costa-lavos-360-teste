import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, ArchiveRestore } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Helmet } from 'react-helmet-async';

const dummyHistorico = [
  { id: 'h1', tipo: 'mudanca_status', titulo: 'Status do Chamado #1001 Alterado', mensagem: 'De Aberto para Atribuído', data_criacao: '2025-11-19', data_leitura: '2025-11-19' },
  { id: 'h2', tipo: 'novo_chamado', titulo: 'Novo Chamado Aberto', mensagem: 'Chamado de entrega para Padaria Pão Quente', data_criacao: '2025-11-18', data_leitura: '2025-11-18' },
];

const HistoricoNotificacoesPage = () => {
  const { toast } = useToast();

  const handleAction = (action, id) => {
    toast({ title: "Funcionalidade em desenvolvimento", description: `🚧 A ação "${action}" para o histórico ${id} ainda não foi implementada.` });
  };

  return (
    <>
      <Helmet>
        <title>Histórico de Notificações - Costa Lavos</title>
        <meta name="description" content="Visualize o histórico completo de todas as suas notificações." />
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Notificações</CardTitle>
          <CardDescription>Todas as suas notificações, incluindo as já lidas.</CardDescription>
          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <Select><SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Filtrar por Tipo" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem></SelectContent></Select>
            <Input type="date" className="w-full md:w-[180px]" placeholder="Filtrar por data" />
            <Input placeholder="Buscar por título/mensagem..." className="max-w-sm" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Mensagem</TableHead>
                <TableHead>Data Criação</TableHead>
                <TableHead>Data Leitura</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyHistorico.map((notif) => (
                <TableRow key={notif.id}>
                  <TableCell><Badge variant="secondary">{notif.tipo}</Badge></TableCell>
                  <TableCell className="font-medium">{notif.titulo}</TableCell>
                  <TableCell>{notif.mensagem}</TableCell>
                  <TableCell>{notif.data_criacao}</TableCell>
                  <TableCell>{notif.data_leitura || 'Não lido'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleAction('Ver Detalhes', notif.id)}>Ver Detalhes</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleAction('Excluir', notif.id)}>Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Implementar paginação aqui */}
        </CardContent>
      </Card>
    </>
  );
};

export default HistoricoNotificacoesPage;