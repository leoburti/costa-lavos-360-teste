import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { MoreHorizontal, Save, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Helmet } from 'react-helmet-async';
import { syncModelosEquipamentosFromBdClInv, getModelosEquipamentos, updateModeloEquipamento, deleteModeloEquipamento } from '@/services/apoioSyncService';
import LoadingSpinner from '@/components/LoadingSpinner';

const ModelosEquipamentosPage = () => {
  const { toast } = useToast();
  const [modelos, setModelos] = useState([]);
  const [editingValues, setEditingValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState({});
  const [deleting, setDeleting] = useState(null);

  const fetchData = useCallback(async (showToast = false) => {
    if(!showToast) setLoading(true);
    try {
      const data = await getModelosEquipamentos();
      setModelos(data);
      const initialEditing = data.reduce((acc, modelo) => {
        acc[modelo.id] = { descricao: modelo.descricao || '', ativo: modelo.ativo };
        return acc;
      }, {});
      setEditingValues(initialEditing);
      if (showToast) {
        toast({ title: "Lista de modelos atualizada!" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os modelos." });
    } finally {
      if(!showToast) setLoading(false);
    }
  }, [toast]);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    toast({
      title: "Sincronizando modelos...",
      description: "Buscando novos modelos de equipamentos do inventário.",
    });
    try {
      const result = await syncModelosEquipamentosFromBdClInv();
      if (result.error) throw new Error(result.error);
      toast({ title: "Sincronização Concluída", description: `${result.processed || 0} novos modelos foram adicionados.`, variant: 'success' });
      await fetchData(true);
    } catch (error) {
      toast({ variant: "destructive", title: "Erro de Sincronização", description: error.message });
    } finally {
      setSyncing(false);
    }
  }, [toast, fetchData]);

  useEffect(() => {
      fetchData();
  }, [fetchData]);

  const handleInputChange = (id, field, value) => {
    setEditingValues(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleSave = async (id) => {
    setSaving(prev => ({ ...prev, [id]: true }));
    const { descricao, ativo } = editingValues[id];
    const result = await updateModeloEquipamento(id, { descricao, ativo });

    if (result.success) {
      toast({ title: "Sucesso!", description: result.message });
      setModelos(prev => prev.map(m => m.id === id ? { ...m, ...result.data } : m));
    } else {
      toast({ variant: "destructive", title: "Erro ao Salvar", description: result.message });
    }
    setSaving(prev => ({ ...prev, [id]: false }));
  };
  
  const handleDelete = async (id) => {
    if (!id) return;
    const result = await deleteModeloEquipamento(id);
    if (result.success) {
      toast({ title: "Sucesso!", description: result.message });
      setModelos(prev => prev.map(m => m.id === id ? { ...m, ativo: false } : m));
      setEditingValues(prev => ({...prev, [id]: {...prev[id], ativo: false}}));
    } else {
      toast({ variant: "destructive", title: "Erro ao Desativar", description: result.message });
    }
    setDeleting(null);
  };

  return (
    <>
      <Helmet>
        <title>Modelos de Equipamentos</title>
        <meta name="description" content="Gerencie os modelos de equipamentos para comodato." />
      </Helmet>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Modelos de Equipamentos</CardTitle>
              <CardDescription>Catálogo de modelos únicos sincronizados do inventário.</CardDescription>
            </div>
            <Button onClick={handleSync} disabled={syncing || loading}>
              {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Sincronizar Agora
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Ativo</TableHead>
                    <TableHead className="text-right w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modelos.map((modelo) => (
                    <TableRow key={modelo.id}>
                      <TableCell className="font-medium">{modelo.nome_modelo}</TableCell>
                      <TableCell>
                        <Input
                          value={editingValues[modelo.id]?.descricao || ''}
                          onChange={(e) => handleInputChange(modelo.id, 'descricao', e.target.value)}
                          placeholder="Adicione uma descrição"
                          className="max-w-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={editingValues[modelo.id]?.ativo}
                          onCheckedChange={(checked) => handleInputChange(modelo.id, 'ativo', checked)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                         <div className="flex items-center justify-end gap-2">
                            <Button size="sm" onClick={() => handleSave(modelo.id)} disabled={saving[modelo.id]}>
                                {saving[modelo.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuItem className="text-destructive" onClick={() => setDeleting(modelo.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Desativar
                                </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                         </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá desativar o modelo. Ele não será excluído permanentemente e poderá ser reativado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(deleting)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sim, desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ModelosEquipamentosPage;