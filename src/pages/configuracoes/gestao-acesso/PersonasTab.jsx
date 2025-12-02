import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import PersonaForm from '@/pages/apoio/personas/PersonaForm';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const PersonasTab = ({ personas, onRefresh, loading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState(null);
  const { toast } = useToast();

  const openModal = (persona = null) => {
    setEditingPersona(persona);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPersona(null);
  };

  const handleSave = () => {
    closeModal();
    onRefresh();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta persona?")) return;
    
    // Check if persona is in use
    const { data: users, error: usersError } = await supabase
      .from('apoio_usuarios')
      .select('id')
      .eq('persona_id', id)
      .limit(1);

    if (usersError) {
      toast({ variant: 'destructive', title: 'Erro', description: usersError.message });
      return;
    }

    if (users && users.length > 0) {
      toast({ variant: 'destructive', title: 'Não é possível excluir', description: 'Esta persona está em uso por um ou mais usuários.' });
      return;
    }

    const { error } = await supabase.from('apoio_personas').delete().eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao excluir', description: error.message });
    } else {
      toast({ title: 'Persona excluída com sucesso' });
      onRefresh();
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Personas (Perfis Base)</CardTitle>
              <CardDescription>Gerencie os modelos de permissão que podem ser aplicados aos usuários.</CardDescription>
            </div>
            <Button onClick={() => openModal()}>
              <Plus className="mr-2 h-4 w-4" /> Nova Persona
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome da Persona</TableHead>
                  <TableHead>Tipo de Uso</TableHead>
                  <TableHead>Permissões Base</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Carregando...</TableCell></TableRow>
                ) : personas.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Nenhuma persona encontrada.</TableCell></TableRow>
                ) : (
                  personas.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.nome}</TableCell>
                      <TableCell>{p.tipo_uso}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {p.permissoes && Object.keys(p.permissoes).length > 0 ? (
                            Object.keys(p.permissoes).slice(0, 4).map(key => (
                              <Badge key={key} variant="outline" className="text-[10px] px-1 py-0">{key}</Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                          {p.permissoes && Object.keys(p.permissoes).length > 4 && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0">+{Object.keys(p.permissoes).length - 4}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={p.ativo ? 'success' : 'secondary'}>
                          {p.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openModal(p)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {isModalOpen && (
        <PersonaForm
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleSave}
          persona={editingPersona}
        />
      )}
    </>
  );
};

export default PersonasTab;