import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Users, Save, Trash2, ShieldAlert, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from '@/components/ui/scroll-area';
import AddUserDialog from '@/components/settings/AddUserDialog';
import EditUserDialog from '@/components/settings/EditUserDialog';
import ModulePermissionsDialog from '@/components/settings/ModulePermissionsDialog';
import ApprovalPermissionsDialog from '@/components/settings/ApprovalPermissionsDialog';
import InputMask from 'react-input-mask';
import { useDebounce } from '@/hooks/useDebounce';

const Settings = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [deleting, setDeleting] = useState(null);
  const [supervisors, setSupervisors] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { toast } = useToast();
  const { user, userRole, forceRoleRefetch, session } = useAuth();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_all_users_with_roles');

      if (error) throw error;
      
      setUsers(data.map(u => ({ 
          ...u, 
          can_access_crm: u.can_access_crm || false, 
          module_permissions: u.module_permissions || {}, 
          approval_roles: u.approval_roles || {},
          phone_number: u.phone_number || '' 
      })));

    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar usuários', description: error.message });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchFilterOptions = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_all_filter_options');
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao carregar opções', description: error.message });
    } else {
      setSupervisors(data.supervisors || []);
      setSellers(data.sellers || []);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
    fetchFilterOptions();
  }, [fetchUsers, fetchFilterOptions]);

  const handleFieldChange = (userId, field, value) => {
    setUsers(users.map(u => u.user_id === userId ? { ...u, [field]: value } : u));
  };

  const handleUserUpdated = (userId, updates) => {
    setUsers(currentUsers => currentUsers.map(u => {
        if (u.user_id === userId) {
            if (typeof updates === 'string') { // specific case for EditUserDialog
                return { ...u, full_name: updates };
            }
            return { ...u, ...updates };
        }
        return u;
    }));
  };

  const handleSaveChanges = async (targetUser) => {
    setSaving(prev => ({...prev, [targetUser.user_id]: true}));
    const { error } = await supabase.rpc('update_user_role', {
      p_user_id: targetUser.user_id,
      p_role: targetUser.role,
      p_can_access_crm: targetUser.can_access_crm,
      p_supervisor_name: targetUser.supervisor_name,
      p_seller_name: targetUser.seller_name,
      p_module_permissions: targetUser.module_permissions,
      p_phone_number: targetUser.phone_number,
    });
    
    if (error) {
      toast({ variant: 'destructive', title: `Falha ao salvar ${targetUser.full_name}`, description: error.message });
    } else {
      toast({ title: 'Sucesso!', description: `As permissões de ${targetUser.full_name || targetUser.email} foram atualizadas.` });
      if (user.id === targetUser.user_id) await forceRoleRefetch();
    }
    setSaving(prev => ({...prev, [targetUser.user_id]: false}));
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (userId === user.id) {
      toast({ variant: 'destructive', title: 'Ação não permitida', description: 'Você não pode excluir sua própria conta.' });
      return;
    }
    setDeleting(userId);
    const { error } = await supabase.rpc('delete_user_by_admin', { p_user_id: userId });

    if (error) {
      toast({ variant: 'destructive', title: `Falha ao excluir ${userEmail}`, description: error.message });
    } else {
      toast({ title: 'Sucesso!', description: `Usuário ${userEmail} foi excluído permanentemente.` });
      setUsers(users.filter(u => u.user_id !== userId));
    }
    setDeleting(null);
  };

  const filteredUsers = useMemo(() => {
    if (!debouncedSearchTerm) return users;
    return users.filter(u => 
      (u.full_name && u.full_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
    );
  }, [users, debouncedSearchTerm]);

  if (loading && users.length === 0) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  const userRoles = ['Nivel 1', 'Nivel 2', 'Nivel 3', 'Supervisor', 'Vendedor', 'Motorista'];
  const canEdit = userRole === 'Nivel 1' || userRole === 'Nivel 2';

  return (
    <>
      <Helmet>
        <title>Gestão de Usuários - Costa Lavos</title>
        <meta name="description" content="Gerenciamento de usuários e permissões do sistema." />
      </Helmet>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Gerenciamento de Acessos</h1>
            <p className="text-muted-foreground mt-1">Controle permissões, vínculos e o ciclo de vida dos usuários da plataforma.</p>
          </div>
          {canEdit && <AddUserDialog onUserAdded={fetchUsers} supervisors={supervisors} sellers={sellers} />}
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><Users /> Usuários da Plataforma</CardTitle>
            <CardDescription>Ajuste os níveis de acesso e os vínculos de cada usuário. As alterações são salvas individualmente.</CardDescription>
            <div className="relative pt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Nome</TableHead>
                    <TableHead className="min-w-[200px]">Email</TableHead>
                    <TableHead className="min-w-[180px]">Telefone</TableHead>
                    <TableHead className="min-w-[150px]">Nível de Acesso</TableHead>
                    <TableHead className="text-center">Acesso CRM</TableHead>
                    <TableHead className="min-w-[200px]">Vínculo Supervisor</TableHead>
                    <TableHead className="min-w-[200px]">Vínculo Vendedor</TableHead>
                    <TableHead className="text-right min-w-[220px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredUsers.map((u, index) => (
                      <motion.tr key={u.user_id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3, delay: index * 0.05 }} className="border-b transition-colors hover:bg-muted/50">
                        <TableCell className="font-medium">{u.full_name || 'Não definido'}</TableCell>
                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                        <TableCell>
                          <InputMask mask="+55 (99) 99999-9999" value={u.phone_number || ''} onChange={(e) => handleFieldChange(u.user_id, 'phone_number', e.target.value)} disabled={!canEdit}>
                            {(inputProps) => <Input {...inputProps} type="tel" placeholder="+55 (11) 98765-4321" className="h-9"/>}
                          </InputMask>
                        </TableCell>
                        <TableCell>
                          <Select value={u.role || ''} onValueChange={(value) => handleFieldChange(u.user_id, 'role', value)} disabled={!canEdit}>
                            <SelectTrigger className="h-9"><SelectValue placeholder="Selecione" /></SelectTrigger>
                            <SelectContent>{userRoles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-center">
                            <Switch checked={u.can_access_crm} onCheckedChange={(checked) => handleFieldChange(u.user_id, 'can_access_crm', checked)} disabled={!canEdit} />
                        </TableCell>
                        <TableCell>
                          <Select value={u.supervisor_name || 'null'} onValueChange={(value) => handleFieldChange(u.user_id, 'supervisor_name', value === 'null' ? null : value)} disabled={!canEdit || u.role !== 'Supervisor'}>
                            <SelectTrigger className="h-9"><SelectValue placeholder="Nenhum" /></SelectTrigger>
                            <SelectContent><ScrollArea className="h-[200px]"><SelectItem value='null'>Nenhum</SelectItem>{supervisors.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}</ScrollArea></SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select value={u.seller_name || 'null'} onValueChange={(value) => handleFieldChange(u.user_id, 'seller_name', value === 'null' ? null : value)} disabled={!canEdit || u.role !== 'Vendedor'}>
                            <SelectTrigger className="h-9"><SelectValue placeholder="Nenhum" /></SelectTrigger>
                            <SelectContent><ScrollArea className="h-[200px]"><SelectItem value='null'>Nenhum</SelectItem>{sellers.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}</ScrollArea></SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <TooltipProvider>
                            <div className="flex justify-end items-center gap-1">
                              {canEdit && (
                                <>
                                  <Button size="sm" variant="primary-soft" onClick={() => handleSaveChanges(u)} disabled={saving[u.user_id]}>
                                    {saving[u.user_id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    <span className="ml-2 hidden sm:inline">Salvar</span>
                                  </Button>
                                  <ModulePermissionsDialog user={u} onUserUpdated={(userId, perms) => handleUserUpdated(userId, {module_permissions: perms})} />
                                  <ApprovalPermissionsDialog user={u} onUserUpdated={(userId, perms) => handleUserUpdated(userId, perms)} />
                                  <EditUserDialog user={u} onUserUpdated={(userId, name) => handleUserUpdated(userId, {full_name: name})} />
                                </>
                              )}
                              {session && u.user_id !== session.user.id && (
                                <AlertDialog>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <AlertDialogTrigger asChild>
                                        <Button size="icon" variant="ghost" disabled={deleting === u.user_id}>
                                          {deleting === u.user_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                                        </Button>
                                      </AlertDialogTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Excluir Usuário</p></TooltipContent>
                                  </Tooltip>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="flex items-center gap-2"><ShieldAlert className="text-destructive"/>Tem certeza absoluta?</AlertDialogTitle>
                                      <AlertDialogDescription>Essa ação não pode ser desfeita. Isso irá excluir permanentemente a conta de <strong>{u.full_name || u.email}</strong>.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteUser(u.user_id, u.email)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Sim, excluir</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </TooltipProvider>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
              {loading && users.length > 0 && <div className="flex items-center justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
              {!loading && filteredUsers.length === 0 && <div className="text-center p-8 text-muted-foreground">Nenhum usuário encontrado.</div>}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default Settings;