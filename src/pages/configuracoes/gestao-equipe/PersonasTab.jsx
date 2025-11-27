import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Edit2, Plus, Shield, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const PersonasTab = () => {
  const { toast } = useToast();
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '', ativo: true });

  const fetchPersonas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('apoio_personas')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      setPersonas(data || []);
    } catch (error) {
      console.error("Error fetching personas:", error);
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonas();
  }, []);

  const handleSave = async () => {
    try {
      const payload = {
        nome: formData.nome,
        descricao: formData.descricao,
        ativo: formData.ativo,
        // Default permissions structure if new, else keep existing
        permissoes: editingPersona?.permissoes || {
            analytics: false,
            comercial: false,
            crm: false,
            delivery: false,
            apoio: false,
            gestao_equipe: false,
            configuracoes: false
        } 
      };

      if (editingPersona) {
        const { error } = await supabase.from('apoio_personas').update(payload).eq('id', editingPersona.id);
        if (error) throw error;
        toast({ title: 'Persona atualizada' });
      } else {
        const { error } = await supabase.from('apoio_personas').insert(payload);
        if (error) throw error;
        toast({ title: 'Persona criada' });
      }
      setIsModalOpen(false);
      fetchPersonas();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: error.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta persona? Usuários associados podem perder acesso.')) return;
    try {
      const { error } = await supabase.from('apoio_personas').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Persona excluída' });
      fetchPersonas();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao excluir', description: error.message });
    }
  };

  const openModal = (persona = null) => {
    setEditingPersona(persona);
    setFormData({
      nome: persona?.nome || '',
      descricao: persona?.descricao || '',
      ativo: persona?.ativo ?? true
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Gerenciamento de Personas</h2>
          <p className="text-sm text-muted-foreground">Defina perfis de acesso e funções do sistema.</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" /> Nova Persona
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8">Carregando...</TableCell></TableRow>
              ) : personas.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8">Nenhuma persona encontrada.</TableCell></TableRow>
              ) : (
                personas.map((persona) => (
                  <TableRow key={persona.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      {persona.nome}
                    </TableCell>
                    <TableCell>{persona.descricao || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={persona.ativo ? 'success' : 'secondary'}>
                        {persona.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openModal(persona)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(persona.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPersona ? 'Editar Persona' : 'Nova Persona'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Persona</Label>
              <Input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Ex: Supervisor Comercial" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} placeholder="Descreva as responsabilidades..." />
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={formData.ativo} onCheckedChange={c => setFormData({...formData, ativo: c})} />
              <Label>Ativo</Label>
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

export default PersonasTab;