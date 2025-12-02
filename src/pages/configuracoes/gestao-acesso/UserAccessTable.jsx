import React, { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MoreHorizontal, ShieldAlert, UserCog, UserX } from 'lucide-react';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import AccessEditModal from '@/pages/configuracoes/gestao-acesso/AccessEditModal';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useToast } from '@/components/ui/use-toast';

const UserAccessTable = ({ users, personas, onRefresh, loading: initialLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { toggleStatusUsuario, loading: actionLoading } = useUsuarios();
  const { toast } = useToast();

  const filteredUsers = users.filter(user => 
    user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.departamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };
  
  const handleToggleStatus = async (user) => {
    const success = await toggleStatusUsuario(user.id, user.status);
    if(success) {
      onRefresh();
    }
  }

  const getRoleBadge = (role) => {
    const roleColors = {
      'Nivel 1': 'bg-red-100 text-red-800',
      'Nivel 5': 'bg-purple-100 text-purple-800',
      'Supervisor': 'bg-blue-100 text-blue-800',
      'Vendedor': 'bg-green-100 text-green-800',
      'Técnico': 'bg-orange-100 text-orange-800',
      'Financeiro': 'bg-yellow-100 text-yellow-800'
    };
    return <Badge variant="outline" className={roleColors[role] || 'bg-gray-100 text-gray-800'}>{role || 'Não definido'}</Badge>;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Usuários e Permissões</CardTitle>
              <CardDescription>Gerencie quem tem acesso a quais recursos do sistema.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuário..."
                  className="pl-8 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Equipe</TableHead>
                  <TableHead>Persona</TableHead>
                  <TableHead>Cargo (Role)</TableHead>
                  <TableHead>Módulos Ativos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">Carregando...</TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">Nenhum usuário encontrado.</TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.nome}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.equipe?.nome || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{user.persona?.nome || 'Sem Persona'}</Badge>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {user.module_permissions && Object.keys(user.module_permissions).filter(k => user.module_permissions[k]).length > 0 ? (
                             Object.keys(user.module_permissions).filter(k => user.module_permissions[k]).slice(0, 2).map(m => (
                               <Badge key={m} variant="outline" className="text-[10px] px-1 py-0 uppercase">{m.replace(/_/g, ' ')}</Badge>
                             ))
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                          {user.module_permissions && Object.keys(user.module_permissions).filter(k => user.module_permissions[k]).length > 2 && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0">+{Object.keys(user.module_permissions).filter(k => user.module_permissions[k]).length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'ativo' ? 'success' : 'destructive'}>
                          {user.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                              <UserCog className="mr-2 h-4 w-4" /> Editar Acesso
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(user)} disabled={actionLoading}>
                              <UserX className="mr-2 h-4 w-4" /> Alterar Status
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => toast({ title: "Funcionalidade não implementada.", variant: "destructive" })}>
                              <ShieldAlert className="mr-2 h-4 w-4" /> Revogar Acesso
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedUser && (
        <AccessEditModal 
          open={isEditOpen} 
          onOpenChange={setIsEditOpen} 
          user={selectedUser} 
          personas={personas}
          onSave={onRefresh}
        />
      )}
    </>
  );
};

export default UserAccessTable;