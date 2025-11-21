import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserPlus, Loader2, Save } from 'lucide-react';

const AddUserDialog = ({ onUserAdded, supervisors, sellers }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Vendedor');
  const [canAccessCrm, setCanAccessCrm] = useState(false);
  const [supervisorName, setSupervisorName] = useState(null);
  const [sellerName, setSellerName] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAddUser = async () => {
    if (!email || !password || !fullName) {
      toast({ variant: 'destructive', title: 'Campos obrigatórios', description: 'Preencha Nome, Email e Senha.' });
      return;
    }
    setLoading(true);

    const { data: createData, error: createError } = await supabase.functions.invoke('create-user', {
        body: { email, password, fullName }
    });

    if (createError || createData.error) {
        toast({ variant: 'destructive', title: 'Erro ao criar usuário', description: createError?.message || createData.error.message });
        setLoading(false);
        return;
    }

    if (createData.user) {
      const { error: roleError } = await supabase.rpc('update_user_role', {
          p_user_id: createData.user.id,
          p_role: role,
          p_can_access_crm: canAccessCrm,
          p_supervisor_name: role === 'Supervisor' ? supervisorName : null,
          p_seller_name: role === 'Vendedor' ? sellerName : null,
          p_module_permissions: {}
      });

      if (roleError) {
        toast({ variant: 'destructive', title: 'Erro ao definir permissão', description: `Usuário criado, mas falha ao definir a permissão: ${roleError.message}` });
      } else {
        toast({ title: 'Sucesso!', description: `Usuário ${fullName} criado com a permissão ${role}.` });
        onUserAdded();
        setOpen(false);
        setEmail(''); setPassword(''); setFullName(''); setRole('Vendedor'); setCanAccessCrm(false); setSupervisorName(null); setSellerName(null);
      }
    }
    setLoading(false);
  };
  
  const userRoles = ['Nivel 1', 'Nivel 2', 'Nivel 3', 'Supervisor', 'Vendedor', 'Motorista'];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Adicionar Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Usuário</DialogTitle>
          <DialogDescription>
            Crie uma nova conta e defina as permissões. O usuário será criado e poderá fazer login imediatamente.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-1">
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nome do novo usuário" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@email.com" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha forte" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="role">Nível de Acesso</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue placeholder="Selecione um nível" /></SelectTrigger>
              <SelectContent>
                {userRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="crm-access-new" checked={canAccessCrm} onCheckedChange={setCanAccessCrm} />
            <Label htmlFor="crm-access-new">Permitir acesso ao CRM</Label>
          </div>
          {role === 'Supervisor' && (
            <div className="space-y-1">
              <Label htmlFor="supervisorName">Vínculo Supervisor</Label>
              <Select value={supervisorName || 'null'} onValueChange={(v) => setSupervisorName(v === 'null' ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Selecione o Supervisor" /></SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-[200px]">
                    <SelectItem value='null'>Nenhum</SelectItem>
                    {supervisors.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
          )}
          {role === 'Vendedor' && (
            <div className="space-y-1">
              <Label htmlFor="sellerName">Vínculo Vendedor</Label>
              <Select value={sellerName || 'null'} onValueChange={(v) => setSellerName(v === 'null' ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Selecione o Vendedor" /></SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-[200px]">
                    <SelectItem value='null'>Nenhum</SelectItem>
                    {sellers.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleAddUser} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Criar Usuário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;