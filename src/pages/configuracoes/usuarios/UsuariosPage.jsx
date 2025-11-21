import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, CheckCircle, XCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const dummyUsers = [
  { id: '1', nome: 'Admin', email: 'admin@example.com', telefone: '(11) 99999-9999', perfil: 'Administrador', eh_aprovador: true, status: 'ativo' },
  { id: '2', nome: 'Gestor', email: 'gestor@example.com', telefone: '(21) 98888-8888', perfil: 'Gestor', eh_aprovador: true, status: 'ativo' },
  { id: '3', nome: 'Manutencista', email: 'manu@example.com', telefone: '(31) 97777-7777', perfil: 'Manutencista', eh_aprovador: false, status: 'inativo' },
];

const UsuariosPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAction = (action) => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: `🚧 A ação "${action}" ainda não foi implementada.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Usuários</CardTitle>
            <CardDescription>Gerencie os usuários do sistema de apoio.</CardDescription>
          </div>
          <Button onClick={() => navigate('/configuracoes/usuarios/novo')}>
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Usuário
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Aprovador?</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dummyUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.nome}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>{user.perfil}</TableCell>
                <TableCell>
                  {user.eh_aprovador ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-muted-foreground" />}
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'ativo' ? 'success' : 'destructive'}>{user.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/configuracoes/usuarios/${user.id}/editar`)}>Editar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('Designar Aprovador')}>Designar Aprovador</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('Ver Acessos')}>Ver Acessos</DropdownMenuItem>
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
  );
};

export default UsuariosPage;