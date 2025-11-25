
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, CheckCircle, XCircle, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useUsuarios } from '@/hooks/useUsuarios';

const UsuariosPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { fetchUsuarios, deleteUsuario, toggleStatusUsuario, loading } = useUsuarios();
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    const data = await fetchUsuarios();
    if (data) setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, [fetchUsuarios]);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      const success = await deleteUsuario(id);
      if (success) loadUsers();
    }
  };

  const handleToggleStatus = async (id, status) => {
    const success = await toggleStatusUsuario(id, status);
    if (success) loadUsers();
  };

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
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadUsers} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={() => navigate('/configuracoes/usuarios/novo')}>
                <PlusCircle className="mr-2 h-4 w-4" /> Novo Usuário
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Persona</TableHead>
              <TableHead>Aprovador?</TableHead>
              <TableHead>Vínculo (BD)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && !loading ? (
                <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhum usuário encontrado.
                    </TableCell>
                </TableRow>
            ) : (
                users.map((user) => (
                <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                        <Badge variant="secondary" className="font-normal">
                            {user.persona?.nome || 'Sem Persona'}
                        </Badge>
                    </TableCell>
                    <TableCell>
                    {user.eh_aprovador ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-muted-foreground/30" />}
                    </TableCell>
                    <TableCell>
                        {user.access_path ? (
                            <div className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full w-fit">
                                <LinkIcon className="h-3 w-3" /> {user.access_path}
                            </div>
                        ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                        )}
                    </TableCell>
                    <TableCell>
                        <Badge 
                            variant={user.status === 'ativo' ? 'success' : 'destructive'}
                            className="cursor-pointer"
                            onClick={() => handleToggleStatus(user.id, user.status)}
                        >
                            {user.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/configuracoes/usuarios/${user.id}/editar`)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('Ver Acessos')}>Ver Detalhes</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(user.id)}>Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UsuariosPage;
