import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import AddUserDialog from '@/components/settings/AddUserDialog';
import EditUserDialog from '@/components/settings/EditUserDialog';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UserManagementPage = () => {
  const { hasPermission, userRole } = useAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Ensure we call the RPC correctly
      const { data, error } = await supabase.rpc('get_all_users_with_roles');
      
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar usuários. " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const abortController = new AbortController();
    
    if (hasPermission('configuracoes', 'view')) {
        fetchUsers();
    } else {
        setLoading(false);
    }

    return () => {
        abortController.abort();
    };
  }, [fetchUsers, hasPermission]);

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) return;

    try {
      const { error } = await supabase.rpc('delete_user_by_admin', { p_user_id: userId });
      if (error) throw error;

      toast({ title: "Sucesso", description: "Usuário excluído com sucesso." });
      fetchUsers();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir usuário: " + error.message,
        variant: "destructive"
      });
    }
  };

  if (!hasPermission('configuracoes', 'view')) {
    return <div className="p-8 text-center text-muted-foreground">Você não tem permissão para ver esta página.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestão de Usuários</h2>
          <p className="text-muted-foreground">Gerencie contas, permissões e papéis de acesso.</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-brand-primary hover:bg-brand-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>Acesso CRM</TableHead>
                    <TableHead>Data Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhum usuário encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((u) => (
                      <TableRow key={u.user_id}>
                        <TableCell className="font-medium">{u.full_name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            u.role === 'Admin' ? 'bg-red-100 text-red-800 hover:bg-red-100' : 
                            u.role.includes('Nivel 1') ? 'bg-purple-100 text-purple-800 hover:bg-purple-100' :
                            'bg-blue-100 text-blue-800 hover:bg-blue-100'
                          }>
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={u.can_access_crm ? "success" : "secondary"}>
                            {u.can_access_crm ? "Sim" : "Não"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(u.created_at).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => setEditingUser(u)}>
                              <Edit className="h-4 w-4 text-blue-500" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(u.user_id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddUserDialog 
        isOpen={isAddDialogOpen} 
        onClose={() => setIsAddDialogOpen(false)} 
        onUserAdded={fetchUsers} 
      />

      {editingUser && (
        <EditUserDialog
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          user={editingUser}
          onUserUpdated={fetchUsers}
        />
      )}
    </div>
  );
};

export default UserManagementPage;