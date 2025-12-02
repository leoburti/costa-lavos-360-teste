import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Shield, User, Layers, Network } from 'lucide-react';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getCommercialHierarchy } from '@/services/apoioSyncService';

const modulesList = [
  { id: 'analytics', label: 'Analytics' },
  { id: 'commercial-analysis', label: 'Análise Comercial' },
  { id: 'managerial-analysis', label: 'Análise Gerencial' },
  { id: 'crm', label: 'CRM' },
  { id: 'bonificacoes', label: 'Bonificações' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'apoio', label: 'Apoio Operacional' },
  { id: 'manutencao_equip', label: 'Manutenção Equip.'},
  { id: 'tarefas', label: 'Tarefas' },
  { id: 'settings_users', label: 'Gestão de Usuários' },
  { id: 'configuracoes', label: 'Configurações Gerais' }
];

const AccessEditModal = ({ open, onOpenChange, user, personas, onSave }) => {
  const { toast } = useToast();
  const { updateUsuario, loading } = useUsuarios();
  const { forceRoleRefetch } = useAuth();
  
  const [teams, setTeams] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [commercialLinks, setCommercialLinks] = useState({ supervisors: [], sellers: [] });
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    role: '',
    departamento: '',
    persona_id: '',
    status: 'ativo',
    module_permissions: {},
    equipe_id: '',
    supervisor_id: '',
    vinculo_comercial: '',
    tipo_vinculo: '',
    pode_solicitar_bonificacao: false,
    eh_aprovador: false,
    tipos_aprovacao: []
  });

  const fetchAuxData = useCallback(async () => {
    const { data: teamsData } = await supabase.from('apoio_equipes').select('id, nome');
    const { data: usersData } = await supabase.from('users_unified').select('id, nome').order('nome');
    try {
      const hierarchyData = await getCommercialHierarchy();
      const supervisors = hierarchyData.map(h => h.supervisor_nome);
      const sellers = hierarchyData.flatMap(h => h.vendedores);
      setCommercialLinks({
          supervisors: [...new Set(supervisors)],
          sellers: [...new Set(sellers)],
      });
    } catch(error) {
      toast({ variant: "destructive", title: "Erro ao carregar hierarquia", description: error.message });
    }

    setTeams(teamsData || []);
    setAllUsers(usersData || []);
  }, [toast]);

  useEffect(() => {
    if (open) {
      fetchAuxData();
    }
  }, [open, fetchAuxData]);

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome || '',
        email: user.email || '',
        role: user.role || 'Vendedor',
        departamento: user.departamento || '',
        persona_id: user.persona_id || '',
        status: user.status || 'ativo',
        module_permissions: user.module_permissions || {},
        equipe_id: user.equipe_id || '',
        supervisor_id: user.supervisor_id || '',
        vinculo_comercial: user.vinculo_comercial || '',
        tipo_vinculo: user.tipo_vinculo || '',
        pode_solicitar_bonificacao: user.pode_solicitar_bonificacao || false,
        eh_aprovador: user.eh_aprovador || false,
        tipos_aprovacao: user.tipos_aprovacao || []
      });
    }
  }, [user]);

  const handleModuleToggle = (moduleId) => {
    setFormData(prev => ({
      ...prev,
      module_permissions: {
        ...prev.module_permissions,
        [moduleId]: !prev.module_permissions?.[moduleId]
      }
    }));
  };

  const handleSave = async () => {
    if (!user?.id) {
        toast({
            variant: "destructive",
            title: "Erro Crítico",
            description: "ID do usuário não encontrado. Não é possível salvar."
        });
        return;
    }

    const payload = {
        nome: formData.nome,
        role: formData.role,
        departamento: formData.departamento,
        persona_id: formData.persona_id || null,
        status: formData.status,
        module_permissions: formData.module_permissions,
        equipe_id: formData.equipe_id || null,
        supervisor_id: formData.supervisor_id || null,
        vinculo_comercial: formData.vinculo_comercial,
        tipo_vinculo: formData.tipo_vinculo,
        pode_solicitar_bonificacao: formData.pode_solicitar_bonificacao,
        eh_aprovador: formData.eh_aprovador,
        tipos_aprovacao: formData.tipos_aprovacao,
        updated_at: new Date().toISOString()
    };
    
    const result = await updateUsuario(user.id, payload);

    if (result) {
      toast({
        title: 'Permissões atualizadas',
        description: `As regras de acesso para ${formData.nome} foram salvas com sucesso.`
      });
      onSave(); 
      forceRoleRefetch(); 
      onOpenChange(false);
    }
  };

  const selectedPersona = personas.find(p => p.id === formData.persona_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar Acesso: {user?.nome}</DialogTitle>
          <DialogDescription>Configure permissões, persona, equipe e vínculos comerciais.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general"><User className="mr-2 h-4 w-4" /> Geral</TabsTrigger>
            <TabsTrigger value="rules"><Shield className="mr-2 h-4 w-4" /> Regras</TabsTrigger>
            <TabsTrigger value="modules"><Layers className="mr-2 h-4 w-4" /> Módulos</TabsTrigger>
            <TabsTrigger value="team"><Network className="mr-2 h-4 w-4" /> Equipe</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto py-4 px-1">
            <TabsContent value="general" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nome Completo</Label><Input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} /></div>
                <div className="space-y-2"><Label>Email</Label><Input value={formData.email} disabled className="bg-muted" /></div>
                <div className="space-y-2"><Label>Departamento</Label><Input value={formData.departamento} onChange={e => setFormData({...formData, departamento: e.target.value})} /></div>
                <div className="space-y-2"><Label>Status</Label><Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ativo">Ativo</SelectItem><SelectItem value="inativo">Inativo</SelectItem><SelectItem value="suspenso">Suspenso</SelectItem></SelectContent></Select></div>
              </div>
            </TabsContent>

            <TabsContent value="rules" className="space-y-6 mt-0">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2"><Label>Persona</Label><Select value={formData.persona_id || ''} onValueChange={v => setFormData({...formData, persona_id: v})}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{personas.map(p => (<SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>))}</SelectContent></Select></div>
                  <div className="space-y-2"><Label>Cargo/Role Principal</Label><Select value={formData.role} onValueChange={v => setFormData({...formData, role: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Nivel 1">Nível 1 (Admin)</SelectItem><SelectItem value="Nivel 5">Nível 5 (Dev)</SelectItem><SelectItem value="Supervisor">Supervisor</SelectItem><SelectItem value="Vendedor">Vendedor</SelectItem><SelectItem value="Técnico">Técnico</SelectItem><SelectItem value="Financeiro">Financeiro</SelectItem></SelectContent></Select></div>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg border"><h4 className="font-medium mb-2 flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Permissões Base (da Persona)</h4>{selectedPersona ? (<div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Tipo:</span><span className="font-medium">{selectedPersona.tipo_uso}</span></div><Separator /><div className="space-y-1"><span className="text-muted-foreground block mb-1">Módulos:</span><div className="flex flex-wrap gap-1">{selectedPersona.permissoes && Object.keys(selectedPersona.permissoes).filter(key => selectedPersona.permissoes[key]).map(k => (<Badge key={k} variant="secondary" className="text-[10px]">{k}</Badge>))}</div></div></div>) : (<p className="text-sm text-muted-foreground italic">Selecione uma persona.</p>)}</div>
              </div>
               <Separator />
                <div>
                    <Label className="text-base font-medium">Bonificações</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="flex items-center space-x-2"><Checkbox id="pode_solicitar" checked={formData.pode_solicitar_bonificacao} onCheckedChange={(checked) => setFormData({...formData, pode_solicitar_bonificacao: !!checked})} /><label htmlFor="pode_solicitar" className="text-sm">Pode Solicitar Bonificação</label></div>
                        <div className="flex items-center space-x-2"><Checkbox id="eh_aprovador" checked={formData.eh_aprovador} onCheckedChange={(checked) => setFormData({...formData, eh_aprovador: !!checked})} /><label htmlFor="eh_aprovador" className="text-sm">É Aprovador</label></div>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="modules" className="space-y-4 mt-0">
              <div className="space-y-4"><div className="flex items-center justify-between"><Label className="text-base">Módulos Habilitados (Acesso Granular)</Label><Badge variant="outline">Substitui as regras da Persona</Badge></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{modulesList.map(module => (<div key={module.id} className="flex items-start space-x-3 p-3 border rounded-md hover:bg-muted/50 transition-colors"><Checkbox id={module.id} checked={!!formData.module_permissions?.[module.id]} onCheckedChange={() => handleModuleToggle(module.id)} /><div className="grid gap-1.5 leading-none"><Label htmlFor={module.id} className="cursor-pointer font-medium">{module.label}</Label></div></div>))}</div></div>
            </TabsContent>

            <TabsContent value="team" className="space-y-6 mt-0">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Equipe Operacional</Label><Select value={formData.equipe_id || ''} onValueChange={v => setFormData({...formData, equipe_id: v})}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{teams.map(t => (<SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>))}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Supervisor Operacional</Label><Select value={formData.supervisor_id || ''} onValueChange={v => setFormData({...formData, supervisor_id: v})}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{allUsers.map(s => (<SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>))}</SelectContent></Select></div>
                </div>
                <Separator />
                <div>
                  <Label className="text-base font-medium">Vínculo Comercial (RLS do BD-CL)</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2"><Label>Tipo</Label><Select value={formData.tipo_vinculo || ''} onValueChange={v => setFormData({...formData, tipo_vinculo: v, vinculo_comercial: ''})}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent><SelectItem value="supervisor">Supervisor</SelectItem><SelectItem value="vendedor">Vendedor</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label>Nome Vinculado</Label><Select value={formData.vinculo_comercial || ''} onValueChange={v => setFormData({...formData, vinculo_comercial: v})} disabled={!formData.tipo_vinculo}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{formData.tipo_vinculo === 'supervisor' ? commercialLinks.supervisors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>) : commercialLinks.sellers.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                  </div>
                </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="mt-auto pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading}>{loading ? 'Salvando...' : 'Salvar Alterações'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AccessEditModal;