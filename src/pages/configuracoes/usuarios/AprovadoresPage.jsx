import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const dummyAprovadores = [
  { id: '1', nome: 'Admin', email: 'admin@example.com', tipos: ['Entrega', 'Troca', 'Retirada', 'Chamados'], status: 'ativo' },
  { id: '2', nome: 'Gestor', email: 'gestor@example.com', tipos: ['Chamados'], status: 'ativo' },
];

const AprovadoresPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAction = (action) => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: `🚧 A ação "${action}" ainda não foi implementada.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total de Aprovadores</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">2</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Aprovadores Ativos</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">2</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Tipos de Aprovação</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">4</div></CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Aprovadores</CardTitle>
              <CardDescription>Gerencie os usuários que podem aprovar solicitações no sistema.</CardDescription>
            </div>
            <Button onClick={() => navigate('/configuracoes/usuarios/aprovadores/novo')}>
              <PlusCircle className="mr-2 h-4 w-4" /> Designar Aprovador
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tipos de Aprovação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyAprovadores.map((aprovador) => (
                <TableRow key={aprovador.id}>
                  <TableCell className="font-medium">{aprovador.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{aprovador.email}</TableCell>
                  <TableCell className="flex flex-wrap gap-1">
                    {aprovador.tipos.map(tipo => <Badge key={tipo} variant="secondary">{tipo}</Badge>)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={aprovador.status === 'ativo' ? 'success' : 'destructive'}>{aprovador.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/configuracoes/usuarios/aprovadores/${aprovador.id}/editar`)}>Editar Aprovações</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleAction('Remover')}>Remover como Aprovador</DropdownMenuItem>
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
  );
};

export default AprovadoresPage;