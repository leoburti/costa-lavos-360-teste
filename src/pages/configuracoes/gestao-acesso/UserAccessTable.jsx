
import React, { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MoreHorizontal, ShieldAlert, UserCog } from 'lucide-react';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import AccessEditModal from '@/pages/configuracoes/gestao-acesso/AccessEditModal';

const UserAccessTable = ({ users, personas, onRefresh, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const filteredUsers = users.filter(user => 
    user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.departamento?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const getLevelBadge = (level) => {
    const colors = {
      1: 'bg-gray-100 text-gray-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-green-100 text-green-800',
      4: 'bg-orange-100 text-orange-800',
      5: 'bg-red-100 text-red-800'
    };
    return <Badge variant="outline" className={colors[level] || colors[1]}>Nível {level || 1}</Badge>;
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
                  <TableHead>Nível</TableHead>
                  <TableHead>Módulos Ativos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
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
                      <TableCell>{getLevelBadge(user.nivel_acesso)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {user.modulos_acesso && Object.keys(user.modulos_acesso).filter(k => user.modulos_acesso[k]).length > 0 ? (
                             Object.keys(user.modulos_acesso).filter(k => user.modulos_acesso[k]).slice(0, 2).map(m => (
                               <Badge key={m} variant="outline" className="text-[10px] px-1 py-0 uppercase">{m.replace('_', ' ')}</Badge>
                             ))
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                          {user.modulos_acesso && Object.keys(user.modulos_acesso).filter(k => user.modulos_acesso[k]).length > 2 && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0">+{Object.keys(user.modulos_acesso).filter(k => user.modulos_acesso[k]).length - 2}</Badge>
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
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
