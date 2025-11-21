import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, UserPlus, Car, Bot } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import RouteManager from '@/components/delivery/RouteManager';
import AssignRoutesDialog from '@/components/delivery/AssignRoutesDialog';

const DriversManagement = () => {
  const { toast } = useToast();
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const [formState, setFormState] = useState({
    nome: '',
    veiculo: '',
    capacidade_kg: '',
    ativo: true,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: driversData, error: driversError } = await supabase
        .from('motoristas_v2')
        .select(`
          *,
          rotas:rotas(id, nome)
        `);

      if (driversError) throw driversError;
      
      const { data: routesData, error: routesError } = await supabase
        .from('rotas')
        .select('*')
        .order('nome', { ascending: true });
        
      if (routesError) throw routesError;
      
      const driversWithMappedRoutes = driversData.map(driver => ({
        ...driver,
        rotas: driver.rotas || []
      }));

      setDrivers(driversWithMappedRoutes);
      setRoutes(routesData);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao buscar dados',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenForm = (driver = null) => {
    if (driver) {
      setEditingDriver(driver);
      setFormState({
        nome: driver.nome,
        veiculo: driver.veiculo || '',
        capacidade_kg: driver.capacidade_kg || '',
        ativo: driver.ativo,
      });
    } else {
      setEditingDriver(null);
      setFormState({
        nome: '',
        veiculo: '',
        capacidade_kg: '',
        ativo: true,
      });
    }
    setIsFormOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked) => {
    setFormState(prev => ({ ...prev, ativo: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const driverData = {
        nome: formState.nome,
        veiculo: formState.veiculo,
        capacidade_kg: formState.capacidade_kg ? parseFloat(formState.capacidade_kg) : null,
        ativo: formState.ativo,
      };

      let error;
      if (editingDriver) {
        const { error: updateError } = await supabase
          .from('motoristas_v2')
          .update({ ...driverData, updated_at: new Date() })
          .eq('id', editingDriver.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('motoristas_v2')
          .insert([{ ...driverData, user_id: null }]); // Assuming user_id can be null or set later
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: `Motorista ${editingDriver ? 'atualizado' : 'cadastrado'} com sucesso!`,
      });
      setIsFormOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving driver:', error);
      toast({
        variant: 'destructive',
        title: `Erro ao salvar motorista`,
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && drivers.length === 0) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Cadastro de Motoristas e Rotas</title>
        <meta name="description" content="Página para cadastro e gerenciamento de motoristas e suas rotas." />
      </Helmet>
      <div className="space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Motoristas e Rotas</h1>
            <p className="text-muted-foreground">Gerencie os motoristas e as rotas de entrega.</p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenForm()}>
                <UserPlus className="mr-2 h-4 w-4" /> Novo Motorista
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingDriver ? 'Editar Motorista' : 'Novo Motorista'}</DialogTitle>
                <DialogDescription>
                  Preencha as informações abaixo para {editingDriver ? 'atualizar o' : 'cadastrar um novo'} motorista.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input id="nome" name="nome" value={formState.nome} onChange={handleFormChange} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="veiculo">Veículo</Label>
                    <Input id="veiculo" name="veiculo" value={formState.veiculo} onChange={handleFormChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacidade_kg">Capacidade (kg)</Label>
                    <Input id="capacidade_kg" name="capacidade_kg" type="number" value={formState.capacidade_kg} onChange={handleFormChange} />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="ativo" checked={formState.ativo} onCheckedChange={handleSwitchChange} />
                  <Label htmlFor="ativo">Ativo</Label>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingDriver ? 'Salvar Alterações' : 'Cadastrar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-semibold">Motoristas Cadastrados</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {drivers.map(driver => (
                <Card key={driver.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{driver.nome}</CardTitle>
                      <Badge variant={driver.ativo ? 'success' : 'destructive'}>
                        {driver.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2 pt-1">
                      <Car className="h-4 w-4" /> {driver.veiculo || 'Veículo não informado'} - {driver.capacidade_kg || 'N/A'} kg
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">Rotas Atribuídas:</p>
                      <div className="flex flex-wrap gap-1">
                        {driver.rotas.length > 0 ? driver.rotas.map(route => (
                          <Badge key={route.id} variant="secondary">{route.nome}</Badge>
                        )) : (
                          <p className="text-xs text-muted-foreground">Nenhuma rota.</p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button size="sm" variant="ghost" onClick={() => handleOpenForm(driver)}>Editar</Button>
                      <AssignRoutesDialog driver={driver} routes={routes} onAssignmentUpdate={fetchData} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
             <h2 className="text-2xl font-semibold mb-4">Rotas</h2>
            <RouteManager routes={routes} onRoutesUpdate={fetchData} />
          </div>
        </div>
      </div>
    </>
  );
};

export default DriversManagement;