import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import SeedData from './SeedData';
import DebugData from './DebugData';

const AdminFamilies = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentFamily, setCurrentFamily] = useState(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '' });
  const { toast } = useToast();

  const fetchFamilies = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('equipment_families')
      .select('*', { count: 'exact' })
      .order('nome', { ascending: true });

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar famílias', description: error.message });
    } else {
      setFamilies(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchFamilies();
  }, [fetchFamilies]);

  const handleOpenForm = (family = null) => {
    setCurrentFamily(family);
    setFormData(family ? { nome: family.nome, descricao: family.descricao || '' } : { nome: '', descricao: '' });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentFamily(null);
    setFormData({ nome: '', descricao: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome) {
      toast({ variant: 'destructive', title: 'O nome da família é obrigatório.' });
      return;
    }

    let error;
    if (currentFamily) {
      const { error: updateError } = await supabase
        .from('equipment_families')
        .update({ nome: formData.nome, descricao: formData.descricao })
        .eq('id', currentFamily.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('equipment_families')
        .insert({ nome: formData.nome, descricao: formData.descricao });
      error = insertError;
    }

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar família', description: error.message });
    } else {
      toast({ title: 'Sucesso!', description: `Família ${currentFamily ? 'atualizada' : 'criada'} com sucesso.` });
      fetchFamilies();
      handleCloseForm();
    }
  };

  const handleDelete = async (familyId) => {
    const { error } = await supabase.from('equipment_families').delete().eq('id', familyId);
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao excluir família', description: error.message });
    } else {
      toast({ title: 'Sucesso!', description: 'Família excluída com sucesso.' });
      fetchFamilies();
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    toast({ title: 'Sincronização iniciada...', description: 'Buscando e atualizando famílias e equipamentos. Isso pode levar alguns minutos.' });
    try {
        const { data, error } = await supabase.functions.invoke('sync-equipment-data');
        if (error) throw error;
        toast({ 
          title: 'Sincronização Concluída!', 
          description: `Resultado: ${data?.message || 'Dados atualizados.'} Famílias: ${data?.familiesCreated}, Equipamentos: ${data?.equipmentCreated}.`
        });
        fetchFamilies();
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro na Sincronização', description: error.message });
    } finally {
        setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Gerenciamento de Famílias</CardTitle>
            <CardDescription>Crie, edite e organize as famílias de equipamentos.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
              <SeedData onSeedComplete={fetchFamilies} familiesExist={families.length > 0} />
              <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <Button variant="outline" disabled={syncing || loading}>
                          {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                          Sincronizar Dados
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle/>Confirmar Sincronização</AlertDialogTitle>
                          <AlertDialogDescription>
                              Esta ação buscará novos equipamentos e famílias de fontes de dados externas. Pode levar alguns minutos e irá inserir registros que ainda não existem. Deseja continuar?
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleSync} disabled={syncing}>Sincronizar</AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
              <Button onClick={() => handleOpenForm()} disabled={syncing || loading}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Nova Família
              </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
              <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : families.length === 0 ? (
              <div className="text-center text-muted-foreground py-16">
                <p>Nenhuma família de equipamento encontrada.</p>
                <p className="text-sm mt-2">Você pode criar uma nova família ou carregar os dados de exemplo.</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {families.map((family) => (
                  <Card key={family.id}>
                  <CardHeader>
                      <CardTitle className="truncate">{family.nome}</CardTitle>
                      <CardDescription className="h-10 overflow-hidden text-ellipsis">{family.descricao || 'Sem descrição'}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenForm(family)}>
                      <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                      <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                          </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isso excluirá permanentemente a família e pode afetar equipamentos associados.
                          </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(family.id)}>Excluir</AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                      </AlertDialog>
                  </CardContent>
                  </Card>
              ))}
              </div>
          )}

          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{currentFamily ? 'Editar Família' : 'Nova Família'}</DialogTitle>
                <DialogDescription>
                  {currentFamily ? 'Altere os detalhes da família.' : 'Crie uma nova família de equipamentos.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseForm}>Cancelar</Button>
                  <Button type="submit">Salvar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      
      <DebugData />

    </div>
  );
};

export default AdminFamilies;