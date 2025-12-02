
import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PlusCircle, Trash2, Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

const RouteManager = ({ routes = [], onRoutesUpdate, loading: externalLoading }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [routeName, setRouteName] = useState('');
  const [routeDescription, setRouteDescription] = useState('');

  const openNewForm = () => {
    setEditingRoute(null);
    setRouteName('');
    setRouteDescription('');
    setIsFormOpen(true);
  };

  const openEditForm = (route) => {
    setEditingRoute(route);
    setRouteName(route.nome);
    setRouteDescription(route.descricao || '');
    setIsFormOpen(true);
  };

  const handleDelete = async (routeId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta rota? Esta ação não pode ser desfeita.')) {
      return;
    }
    setLoading(true);
    try {
      // First, delete associations in motorista_rotas
      const { error: assocError } = await supabase
        .from('motorista_rotas')
        .delete()
        .eq('rota_id', routeId);
      
      if (assocError) throw assocError;

      // Then, delete the route itself
      const { error: routeError } = await supabase
        .from('rotas')
        .delete()
        .eq('id', routeId);
        
      if (routeError) throw routeError;

      toast({ title: 'Rota excluída com sucesso!' });
      if (onRoutesUpdate) onRoutesUpdate();
    } catch (error) {
      console.error('Error deleting route:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir rota',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!routeName) {
      toast({ variant: 'destructive', title: 'O nome da rota é obrigatório.' });
      return;
    }

    setLoading(true);
    try {
      let error;
      if (editingRoute) {
        // Update
        const { error: updateError } = await supabase
          .from('rotas')
          .update({ nome: routeName, descricao: routeDescription, updated_at: new Date() })
          .eq('id', editingRoute.id);
        error = updateError;
      } else {
        // Create
        const { error: insertError } = await supabase
          .from('rotas')
          .insert([{ nome: routeName, descricao: routeDescription }]);
        error = insertError;
      }

      if (error) throw error;

      toast({ title: `Rota ${editingRoute ? 'atualizada' : 'criada'} com sucesso!` });
      if (onRoutesUpdate) onRoutesUpdate();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving route:', error);
      toast({
        variant: 'destructive',
        title: `Erro ao ${editingRoute ? 'atualizar' : 'criar'} rota`,
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gerenciar Rotas</CardTitle>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openNewForm}>
              <PlusCircle className="mr-2 h-4 w-4" /> Nova Rota
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRoute ? 'Editar Rota' : 'Criar Nova Rota'}</DialogTitle>
              <DialogDescription>
                {editingRoute ? 'Atualize os detalhes desta rota.' : 'Preencha os detalhes da nova rota.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="routeName">Nome da Rota</Label>
                <Input
                  id="routeName"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  placeholder="Ex: Rota Centro"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="routeDescription">Descrição</Label>
                <Textarea
                  id="routeDescription"
                  value={routeDescription}
                  onChange={(e) => setRouteDescription(e.target.value)}
                  placeholder="Ex: Cobre a região central da cidade, incluindo bairros X e Y."
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingRoute ? 'Salvar Alterações' : 'Criar Rota'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {externalLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : !routes || routes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma rota cadastrada.</p>
        ) : (
          <ul className="space-y-2">
            {routes.map((route) => (
              <li key={route.id} className="flex items-center justify-between p-2 rounded-md border">
                <div>
                  <p className="font-medium">{route.nome}</p>
                  {route.descricao && <p className="text-sm text-muted-foreground">{route.descricao}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditForm(route)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(route.id)} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default RouteManager;
