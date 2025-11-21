import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Shield, User, Layers, History, Network } from 'lucide-react';

const modulesList = [
  { id: 'analytics', label: 'Analytics' },
  { id: 'comercial', label: 'Comercial' },
  { id: 'crm', label: 'CRM' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'apoio', label: 'Apoio Operacional' },
  { id: 'gestao_equipe', label: 'Gestão de Equipe' },
  { id: 'configuracoes', label: 'Configurações' }
];

const AccessEditModal = ({ open, onOpenChange, user, personas, onSave }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    departamento: '',
    persona_id: '',
    nivel_acesso: '1',
    status: 'ativo',
    modulos_acesso: {},
    equipe_id: '',
    supervisor_id: ''
  });

  useEffect(() => {
    const fetchAuxData = async () => {
      const { data: teamsData } = await supabase.from('apoio_equipes').select('id, nome');
      const { data: usersData } = await supabase.from('apoio_usuarios').select('id, nome').order('nome');
      setTeams(teamsData || []);
      setSupervisors(usersData || []);
    };
    if (open) fetchAuxData();
  }, [open]);

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome || '',
        email: user.email || '',
        departamento: user.departamento || '',
        persona_id: user.persona_id || '',
        nivel_acesso: user.nivel_acesso?.toString() || '1',
        status: user.status || 'ativo',
        modulos_acesso: user.modulos_acesso || {},
        equipe_id: user.equipe_id || '',
        supervisor_id: user.supervisor_id || ''
      });
    }
  }, [user]);

  const handleModuleToggle = (moduleId) => {
    setFormData(prev => ({
      ...prev,
      modulos_acesso: {
        ...prev.modulos_acesso,
        [moduleId]: !prev.modulos_acesso[moduleId]
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('apoio_usuarios')
        .update({
          nome: formData.nome,
          departamento: formData.departamento,
          persona_id: formData.persona_id || null,
          nivel_acesso: parseInt(formData.nivel_acesso),
          status: formData.status,
          modulos_acesso: formData.modulos_acesso,
          equipe_id: formData.equipe_id || null,
          supervisor_id: formData.supervisor_id || null,
          data_atualizacao: new Date()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Permissões atualizadas',
        description: `As regras de acesso para ${formData.nome} foram salvas.`
      });
      onSave();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedPersona = personas.find(p => p.id === formData.persona_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar Acesso: {user?.nome}</DialogTitle>
          <DialogDescription>Configure permissões granulares, persona e nível de acesso.</DialogDescription>
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
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={formData.email} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Departamento</Label>
                  <Input value={formData.departamento} onChange={e => setFormData({...formData, departamento: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="suspenso">Suspenso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="rules" className="space-y-6 mt-0">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Persona (Perfil Base)</Label>
                    <Select value={formData.persona_id} onValueChange={v => setFormData({...formData, persona_id: v})}>
                      <SelectTrigger><SelectValue placeholder="Selecione uma persona" /></SelectTrigger>
                      <SelectContent>
                        {personas.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Define o conjunto base de permissões.</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Nível de Acesso (1-5)</Label>
                    <Select value={formData.nivel_acesso} onValueChange={v => setFormData({...formData, nivel_acesso: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Nível 1 - Operacional/Suporte</SelectItem>
                        <SelectItem value="2">Nível 2 - Técnico</SelectItem>
                        <SelectItem value="3">Nível 3 - Gerente</SelectItem>
                        <SelectItem value="4">Nível 4 - Supervisor</SelectItem>
                        <SelectItem value="5">Nível 5 - Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Define a hierarquia de aprovação e visibilidade.</p>
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" /> Preview de Permissões
                  </h4>
                  {selectedPersona ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipo:</span>
                        <span className="font-medium">{selectedPersona.tipo_uso}</span>
                      </div>
                      <Separator />
                      <div className="space-y-1">
                        <span className="text-muted-foreground block mb-1">Permissões Base:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedPersona.permissoes && Object.keys(selectedPersona.permissoes).map(k => (
                            <Badge key={k} variant="secondary" className="text-[10px]">{k}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Selecione uma persona para visualizar as permissões base.</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="modules" className="space-y-4 mt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Módulos Operacionais Habilitados</Label>
                  <Badge variant="outline">Controle Granular</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modulesList.map(module => (
                    <div key={module.id} className="flex items-start space-x-3 p-3 border rounded-md hover:bg-muted/50 transition-colors">
                      <Checkbox 
                        id={module.id} 
                        checked={formData.modulos_acesso?.[module.id] || false}
                        onCheckedChange={() => handleModuleToggle(module.id)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor={module.id} className="cursor-pointer font-medium">
                          {module.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Habilita acesso completo ao módulo {module.label}.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="team" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Equipe</Label>
                  <Select value={formData.equipe_id} onValueChange={v => setFormData({...formData, equipe_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Selecione uma equipe" /></SelectTrigger>
                    <SelectContent>
                      {teams.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Equipe operacional a qual o usuário pertence.</p>
                </div>
                <div className="space-y-2">
                  <Label>Supervisor Responsável</Label>
                  <Select value={formData.supervisor_id} onValueChange={v => setFormData({...formData, supervisor_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Selecione um supervisor" /></SelectTrigger>
                    <SelectContent>
                      {supervisors.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Supervisor direto (hierarquia).</p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AccessEditModal;