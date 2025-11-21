import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

const approvalTypes = [
  { id: 'bonification_approver', label: 'Aprovador de Bonificação', description: 'Permite aprovar ou rejeitar solicitações de bonificação.' },
  { id: 'equipment_approver', label: 'Aprovador de Equipamentos', description: 'Permite aprovar ou rejeitar solicitações de comodato ou compra de equipamentos.' },
  { id: 'purchase_request_approver', label: 'Aprovador de Solicitação de Compra', description: 'Permite aprovar solicitações de compra de insumos ou serviços.' },
  { id: 'purchase_order_approver', label: 'Aprovador de Pedido de Compra', description: 'Permite aprovar o pedido de compra final para o fornecedor.' },
  { id: 'stock_approver', label: 'Aprovador de Estoque Geral', description: 'Permite aprovar requisições de itens do estoque geral.' },
];

const ApprovalPermissionsDialog = ({ user, onUserUpdated }) => {
  const [open, setOpen] = useState(false);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && user.approval_roles) {
      setPermissions(user.approval_roles);
    }
  }, [open, user]);

  const handleToggle = (permissionId) => {
    setPermissions(prev => ({ ...prev, [permissionId]: !prev[permissionId] }));
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    const { error } = await supabase.rpc('update_user_approval_roles', {
      p_user_id: user.user_id,
      p_bonification_approver: permissions.bonification_approver,
      p_equipment_approver: permissions.equipment_approver,
      p_purchase_request_approver: permissions.purchase_request_approver,
      p_purchase_order_approver: permissions.purchase_order_approver,
      p_stock_approver: permissions.stock_approver
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar permissões', description: error.message });
    } else {
      toast({ title: 'Sucesso!', description: `Permissões de aprovação para ${user.full_name} atualizadas.` });
      onUserUpdated(user.user_id, { approval_roles: permissions });
      setOpen(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button size="icon" variant="ghost">
              <ShieldCheck className="h-4 w-4 text-green-500" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent><p>Gerenciar Aprovações</p></TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Aprovações</DialogTitle>
          <DialogDescription>
            Defina os papéis de aprovação para {user.full_name}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {approvalTypes.map((perm) => (
            <Card key={perm.id} className="transition-all hover:shadow-md">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor={perm.id} className="text-base font-medium">
                    {perm.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {perm.description}
                  </p>
                </div>
                <Switch
                  id={perm.id}
                  checked={permissions[perm.id] || false}
                  onCheckedChange={() => handleToggle(perm.id)}
                  aria-label={perm.label}
                />
              </CardContent>
            </Card>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSaveChanges} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalPermissionsDialog;