
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Edit2, UserCheck } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const TeamsManager = () => {
  const { toast } = useToast();
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({ nome: '', supervisor_id: '', descricao: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: teamsData, error: teamsError } = await supabase
        .from('apoio_equipes')
        .select(`
          *,
          supervisor:apoio_usuarios!supervisor_id(id, nome)
        `);
      
      if (teamsError) throw teamsError;

      const { data: usersData, error: usersError } = await supabase
        .from('apoio_usuarios')
        .select('id, nome, email')
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

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      const payload = {
        nome: formData.nome,
        supervisor_id: formData.supervisor_id || null,
        descricao: formData.descricao
      };

      if (editingTeam) {
        await supabase.from('apoio_equipes').update(payload).eq('id', editingTeam.id);
        toast({ title: 'Equipe atualizada' });
      } else {
        await supabase.from('apoio_equipes').insert(payload);
        toast({ title: 'Equipe criada' });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: error.message });
    }
  };

  const openModal = (team = null) => {
    setEditingTeam(team);
    setFormData({
      nome: team?.nome || '',
      supervisor_id: team?.supervisor_id || '',
      descricao: team?.descricao || ''
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Equipes Operacionais</h2>
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" /> Nova Equipe
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map(team => (
          <Card key={team.id} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">{team.nome}</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openModal(team)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>{team.descricao || 'Sem descrição'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <UserCheck className="h-4 w-4" />
                <span>Supervisor:</span>
                <Badge variant="outline" className="font-normal">
                  {team.supervisor?.nome || 'Não definido'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Membros:</span>
                <span className="font-medium">-</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTeam ? 'Editar Equipe' : 'Nova Equipe'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Equipe</Label>
              <Input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Supervisor Responsável</Label>
              <Select value={formData.supervisor_id} onValueChange={v => setFormData({...formData, supervisor_id: v})}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamsManager;
