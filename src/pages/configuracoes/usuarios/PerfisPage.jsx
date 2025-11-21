import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const dummyPerfis = [
  { id: '1', nome: 'Administrador', descricao: 'Acesso total ao sistema.', usuarios: 1, modulos: ['Todos'], ativo: true },
  { id: '2', nome: 'Gestor', descricao: 'Acesso gerencial.', usuarios: 2, modulos: ['Comodato', 'Chamados'], ativo: true },
  { id: '3', nome: 'Manutencista', descricao: 'Acesso para manutenção.', usuarios: 5, modulos: ['Agenda', 'Chamados'], ativo: true },
];

const PerfisPage = () => {
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
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total de Perfis</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">3</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Perfis Ativos</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">3</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Usuários por Perfil (Média)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">2.7</div></CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Perfis de Usuário</CardTitle>
              <CardDescription>Gerencie os perfis de acesso do sistema de apoio.</CardDescription>
            </div>
            <Button onClick={() => navigate('/configuracoes/usuarios/perfis/novo')}>
              <PlusCircle className="mr-2 h-4 w-4" /> Novo Perfil
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Usuários</TableHead>
                <TableHead>Módulos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyPerfis.map((perfil) => (
                <TableRow key={perfil.id}>
                  <TableCell className="font-medium">{perfil.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{perfil.descricao}</TableCell>
                  <TableCell>{perfil.usuarios}</TableCell>
                  <TableCell className="flex flex-wrap gap-1">
                    {perfil.modulos.map(mod => <Badge key={mod} variant="outline">{mod}</Badge>)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={perfil.ativo ? 'success' : 'destructive'}>{perfil.ativo ? 'Ativo' : 'Inativo'}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/configuracoes/usuarios/perfis/${perfil.id}/editar`)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('Ver Usuários')}>Ver Usuários</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleAction('Excluir')}>Excluir</DropdownMenuItem>
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

export default PerfisPage;