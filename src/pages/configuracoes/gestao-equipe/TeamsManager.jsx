import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Plus, Edit2, UserCheck, Briefcase, Search, ArrowRight, ShieldCheck, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { getCommercialHierarchy } from '@/services/apoioSyncService';

const TeamsManager = () => {
  const { toast } = useToast();
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [commercialData, setCommercialData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCommercial, setLoadingCommercial] = useState(false);
  
  // States for Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  
  // State for Form
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({ nome: '', supervisor_id: '', descricao: '' });
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchMember, setSearchMember] = useState('');

  // State for Import
  const [selectedHierarchy, setSelectedHierarchy] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: teamsData, error: teamsError } = await supabase
        .from('apoio_equipes')
        .select(`
          *,
          supervisor:users_unified!supervisor_id(id, nome),
          members:users_unified!equipe_id(id, nome)
        `);
      
      if (teamsError) throw teamsError;

      const { data: usersData, error: usersError } = await supabase
        .from('users_unified')
        .select('id, nome, email, equipe_id, supervisor_id, status')
        .eq('status', 'ativo')
        .order('nome');

      if (usersError) throw usersError;

      setTeams(teamsData || []);
      setUsers(usersData || []);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchCommercialStructure = async () => {
    setLoadingCommercial(true);
    try {
        const data = await getCommercialHierarchy();
        setCommercialData(data);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao buscar dados comerciais.' });
    } finally {
        setLoadingCommercial(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter available members based on search
  const filteredUsers = users.filter(u => 
    u.nome.toLowerCase().includes(searchMember.toLowerCase())
  );

  const handleSave = async () => {
    try {
      if (formData.supervisor_id) {
          const existingTeam = teams.find(t => t.supervisor_id === formData.supervisor_id);
          if (existingTeam && (!editingTeam || existingTeam.id !== editingTeam.id)) {
              toast({ 
                  variant: 'destructive', 
                  title: 'Conflito de Supervisor', 
                  description: `O supervisor selecionado já lidera a equipe "${existingTeam.nome}".` 
              });
              return;
          }
      }

      const payload = {
        nome: formData.nome,
        supervisor_id: formData.supervisor_id || null,
        descricao: formData.descricao
      };

      let teamId;

      if (editingTeam) {
        const { error } = await supabase.from('apoio_equipes').update(payload).eq('id', editingTeam.id);
        if (error) throw error;
        teamId = editingTeam.id;
        toast({ title: 'Equipe atualizada com sucesso' });
      } else {
        const { data, error } = await supabase.from('apoio_equipes').insert(payload).select().single();
        if (error) throw error;
        teamId = data.id;
        toast({ title: 'Equipe criada com sucesso' });
      }

      if (teamId) {
          const currentMembers = users.filter(u => u.equipe_id === teamId).map(u => u.id);
          const membersToRemove = currentMembers.filter(id => !selectedMembers.includes(id));
          
          if (membersToRemove.length > 0) {
              await supabase.from('users_unified').update({ equipe_id: null }).in('id', membersToRemove);
          }

          if (selectedMembers.length > 0) {
              await supabase.from('users_unified').update({ equipe_id: teamId }).in('id', selectedMembers);
          }
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: error.message });
    }
  };

  const handleDeleteClick = (team) => {
    setTeamToDelete(team);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!teamToDelete) return;

    try {
        await supabase.from('users_unified').update({ equipe_id: null }).eq('equipe_id', teamToDelete.id);
        const { error } = await supabase.from('apoio_equipes').delete().eq('id', teamToDelete.id);
        if (error) throw error;

        toast({ title: 'Equipe excluída' });
        setIsDeleteDialogOpen(false);
        setTeamToDelete(null);
        fetchData();
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  };

  const openModal = (team = null) => {
    setEditingTeam(team);
    const currentMembers = team ? users.filter(u => u.equipe_id === team.id).map(u => u.id) : [];
    setSelectedMembers(currentMembers);

    setFormData({
      nome: team?.nome || '',
      supervisor_id: team?.supervisor_id || '',
      descricao: team?.descricao || ''
    });
    setIsModalOpen(true);
  };

  const openImportModal = (hierarchyItem) => {
      setSelectedHierarchy(hierarchyItem);
      
      const supervisorMatch = users.find(u => 
          u.nome.toLowerCase().includes(hierarchyItem.supervisor_nome.toLowerCase()) ||
          hierarchyItem.supervisor_nome.toLowerCase().includes(u.nome.toLowerCase())
      );

      const suggestedMembers = [];
      hierarchyItem.vendedores.forEach(vendedorName => {
          const match = users.find(u => 
              u.nome.toLowerCase().includes(vendedorName.toLowerCase()) ||
              vendedorName.toLowerCase().includes(u.nome.toLowerCase())
          );
          if (match) suggestedMembers.push(match.id);
      });

      setEditingTeam(null);
      setFormData({
          nome: `Equipe ${hierarchyItem.supervisor_nome}`,
          supervisor_id: supervisorMatch ? supervisorMatch.id : '',
          descricao: 'Equipe importada da estrutura comercial (bd-cl)'
      });
      setSelectedMembers(suggestedMembers);
      
      setIsImportModalOpen(true);
  };

  const handleImportConfirm = () => {
      setIsImportModalOpen(false);
      setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-lg font-semibold">Equipes Operacionais</h2>
            <p className="text-sm text-muted-foreground">Gerencie a estrutura de vendas e supervisão.</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" /> Nova Equipe Manual
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="active">Equipes Ativas</TabsTrigger>
          <TabsTrigger value="discovery" onClick={() => { if(commercialData.length === 0) fetchCommercialStructure(); }}>Descoberta Comercial</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {teams.length === 0 && !loading && (
                    <div className="col-span-full text-center py-12 border rounded-lg border-dashed">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <h3 className="text-lg font-medium">Nenhuma equipe encontrada</h3>
                        <p className="text-muted-foreground mb-4">Crie equipes manualmente ou importe da estrutura de vendas.</p>
                    </div>
                )}
                
                {teams.map(team => (
                <Card key={team.id} className="relative overflow-hidden hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <CardTitle className="text-base font-bold">{team.nome}</CardTitle>
                            <CardDescription className="line-clamp-1">{team.descricao || 'Sem descrição'}</CardDescription>
                        </div>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openModal(team)}>
                                <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteClick(team)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    </CardHeader>
                    <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 p-2 bg-slate-50 rounded-md">
                        <UserCheck className="h-4 w-4 text-primary" />
                        <span className="font-medium">Supervisor:</span>
                        <Badge variant="outline" className="bg-white font-normal border-slate-300">
                        {team.supervisor?.nome || 'Não definido'}
                        </Badge>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span className="flex items-center gap-2"><Users className="h-4 w-4" /> Membros ({team.members?.length || 0})</span>
                        </div>
                        <ScrollArea className="h-[80px] w-full rounded border p-2">
                            {team.members && team.members.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                    {team.members.map(m => (
                                        <Badge key={m.id} variant="secondary" className="text-[10px] px-1">{m.nome}</Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground italic text-center py-4">Nenhum membro vinculado</p>
                            )}
                        </ScrollArea>
                    </div>
                    </CardContent>
                </Card>
                ))}
            </div>
        </TabsContent>

        <TabsContent value="discovery" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Estrutura Comercial (BD-CL)</CardTitle>
                    <CardDescription>Sugestões de equipes baseadas no histórico de vendas. Converta para equipes operacionais.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingCommercial ? (
                        <div className="text-center py-8">Carregando dados...</div>
                    ) : commercialData.length === 0 ? (
                        <div className="text-center py-8">Nenhuma estrutura encontrada.</div>
                    ) : (
                        <div className="grid gap-4">
                            {commercialData.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-4 w-4 text-primary" />
                                            <span className="font-semibold text-sm">Supervisor: {item.supervisor_nome}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground pl-6">
                                            {item.vendedores.length} Vendedores vinculados: {item.vendedores.slice(0, 3).join(', ')} {item.vendedores.length > 3 && '...'}
                                        </div>
                                    </div>
                                    <Button size="sm" variant="secondary" onClick={() => openImportModal(item)}>
                                        Criar Equipe <ArrowRight className="ml-2 h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingTeam ? 'Editar Equipe' : 'Nova Equipe'}</DialogTitle>
            <DialogDescription>Configure o supervisor e os membros da equipe.</DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-4">
                {/* Dados Básicos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Nome da Equipe <span className="text-red-500">*</span></Label>
                        <Input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Ex: Equipe Comercial Norte" />
                    </div>
                    <div className="space-y-2">
                        <Label>Supervisor Responsável</Label>
                        <Select value={formData.supervisor_id} onValueChange={v => setFormData({...formData, supervisor_id: v})}>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>
                            {users.map(u => (
                                <SelectItem key={u.id} value={u.id}>
                                    {u.nome} {u.supervisor_id ? '(Já reporta a alguém)' : ''}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <p className="text-[10px] text-muted-foreground">O supervisor lidera a equipe.</p>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Input value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} />
                </div>

                {/* Seleção de Membros */}
                <div className="border-t pt-4">
                    <Label className="mb-2 block">Membros da Equipe</Label>
                    <div className="flex items-center gap-2 mb-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Filtrar usuários..." 
                            className="h-8 text-sm" 
                            value={searchMember} 
                            onChange={e => setSearchMember(e.target.value)}
                        />
                    </div>
                    
                    <div className="border rounded-md h-[250px] overflow-y-auto p-2 bg-slate-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {filteredUsers.map(user => {
                                const isSelected = selectedMembers.includes(user.id);
                                const isSupervisor = user.id === formData.supervisor_id;
                                if (isSupervisor) return null;

                                return (
                                    <div 
                                        key={user.id} 
                                        className={`flex items-center space-x-2 p-2 rounded border transition-colors cursor-pointer ${isSelected ? 'bg-green-50 border-green-200' : 'bg-white hover:bg-gray-100'}`}
                                        onClick={() => {
                                            if (isSelected) {
                                                setSelectedMembers(prev => prev.filter(id => id !== user.id));
                                            } else {
                                                setSelectedMembers(prev => [...prev, user.id]);
                                            }
                                        }}
                                    >
                                        <Checkbox checked={isSelected} onCheckedChange={() => {}} id={`user-${user.id}`} />
                                        <div className="grid gap-0.5 leading-none select-none">
                                            <label className="text-sm font-medium cursor-pointer">{user.nome}</label>
                                            <p className="text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</p>
                                            {user.equipe_id && user.equipe_id !== editingTeam?.id && (
                                                <p className="text-[10px] text-amber-600 flex items-center gap-1">
                                                    <Briefcase className="h-3 w-3" /> Em outra equipe
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="text-right mt-1 text-xs text-muted-foreground">
                        {selectedMembers.length} membros selecionados
                    </div>
                </div>
            </div>
          </ScrollArea>

          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!formData.nome}>Salvar Equipe</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL DE IMPORTAÇÃO */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Importar Estrutura</DialogTitle>
                  <DialogDescription>Confirme os dados antes de criar a equipe.</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-md text-sm text-blue-800">
                      <ShieldCheck className="h-4 w-4 inline mr-2" />
                      O sistema tentou associar automaticamente os nomes do banco de dados com os usuários cadastrados. Por favor, revise na próxima tela.
                  </div>
                  <div className="space-y-2">
                      <Label>Nome Sugerido</Label>
                      <Input value={formData.nome} readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                      <Label>Supervisor (BD-CL)</Label>
                      <div className="font-medium">{selectedHierarchy?.supervisor_nome}</div>
                  </div>
                  <div className="space-y-2">
                      <Label>Vendedores (BD-CL)</Label>
                      <div className="text-sm text-muted-foreground">
                          {selectedHierarchy?.vendedores.join(', ')}
                      </div>
                  </div>
              </div>

              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>Cancelar</Button>
                  <Button onClick={handleImportConfirm}>Continuar e Revisar</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* ALERT DIALOG PARA DELETAR */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Equipe</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a equipe "{teamToDelete?.nome}"? Os membros ficarão sem equipe. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Deletar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeamsManager;