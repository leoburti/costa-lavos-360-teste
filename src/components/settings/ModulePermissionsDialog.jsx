import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { KeyRound, Loader2, Save } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { allMenuItems } from '@/components/Sidebar';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const getModuleItems = (menuItems) => {
  const items = [];
  const traverse = (menu) => {
    menu.forEach(item => {
      if (item.id && item.label) {
        items.push(item);
      }
      if (item.subItems) {
        traverse(item.subItems);
      }
    });
  };
  traverse(menuItems);
  return items;
};

const allModuleItems = getModuleItems(allMenuItems);
const allModuleIds = allModuleItems.map(item => item.id);

const ModulePermissionsDialog = ({ user, onUserUpdated }) => {
  const [open, setOpen] = useState(false);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { forceRoleRefetch, user: currentUser } = useAuth();

  useEffect(() => {
    if (open) {
      setPermissions(user.module_permissions || {});
    }
  }, [open, user.module_permissions]);

  const handleToggle = useCallback((moduleId) => {
    setPermissions(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  }, []);

  const handleSelectAll = useCallback(() => {
    const newPermissions = allModuleIds.reduce((acc, id) => {
      acc[id] = true;
      return acc;
    }, {});
    setPermissions(newPermissions);
  }, []);

  const handleDeselectAll = useCallback(() => {
    setPermissions({});
  }, []);

  const handleSaveChanges = async () => {
    setLoading(true);
    const { error } = await supabase.rpc('update_user_role', {
      p_user_id: user.user_id,
      p_role: user.role,
      p_can_access_crm: user.can_access_crm,
      p_supervisor_name: user.supervisor_name,
      p_seller_name: user.seller_name,
      p_module_permissions: permissions,
      p_phone_number: user.phone_number
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar permissões', description: error.message });
    } else {
      toast({ title: 'Sucesso!', description: `Permissões de módulo para ${user.full_name} atualizadas.` });
      onUserUpdated(user.user_id, null, permissions);
      if (currentUser.id === user.user_id) {
          await forceRoleRefetch();
      }
      setOpen(false);
    }
    setLoading(false);
  };

  const permissionGroups = useMemo(() => allModuleItems, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button size="icon" variant="ghost">
              <KeyRound className="h-4 w-4 text-yellow-500" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent><p>Permissões de Módulo</p></TooltipContent>
      </Tooltip>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Permissões de Módulo para: {user.full_name}</DialogTitle>
          <DialogDescription>
            Controle o acesso a módulos específicos da aplicação para este usuário.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex justify-end gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>Selecionar Tudo</Button>
            <Button variant="outline" size="sm" onClick={handleDeselectAll}>Limpar Tudo</Button>
          </div>
          <ScrollArea className="h-[50vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-6">
              {permissionGroups.map(item => (
                <Card key={item.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      {item.icon && <item.icon className="h-4 w-4 text-muted-foreground" />}
                      {item.label}
                    </CardTitle>
                    <Switch
                      checked={!!permissions[item.id]}
                      onCheckedChange={() => handleToggle(item.id)}
                    />
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {item.subItems ? 'Acesso ao grupo de módulos.' : 'Acesso ao módulo.'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveChanges} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Permissões
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModulePermissionsDialog;