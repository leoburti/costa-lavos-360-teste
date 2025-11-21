import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const AssignRoutesDialog = ({ driver, routes, onAssignmentUpdate }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRoutes, setSelectedRoutes] = useState([]);

  useEffect(() => {
    if (driver && driver.rotas) {
      setSelectedRoutes(driver.rotas.map(r => r.id));
    }
  }, [driver, isOpen]);

  const handleCheckboxChange = (routeId) => {
    setSelectedRoutes(prev => 
      prev.includes(routeId)
        ? prev.filter(id => id !== routeId)
        : [...prev, routeId]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Delete existing assignments for this driver
      const { error: deleteError } = await supabase
        .from('motorista_rotas')
        .delete()
        .eq('motorista_id', driver.id);

      if (deleteError) throw deleteError;

      // Insert new assignments if any are selected
      if (selectedRoutes.length > 0) {
        const newAssignments = selectedRoutes.map(routeId => ({
          motorista_id: driver.id,
          rota_id: routeId,
        }));
        const { error: insertError } = await supabase
          .from('motorista_rotas')
          .insert(newAssignments);
          
        if (insertError) throw insertError;
      }
      
      toast({ title: 'Rotas do motorista atualizadas com sucesso!' });
      onAssignmentUpdate();
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating driver routes:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar rotas',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Gerenciar Rotas</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atribuir Rotas para {driver.nome}</DialogTitle>
          <DialogDescription>
            Selecione as rotas que este motorista irá operar.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {routes.length > 0 ? routes.map(route => (
            <div key={route.id} className="flex items-center space-x-2">
              <Checkbox
                id={`route-${route.id}`}
                checked={selectedRoutes.includes(route.id)}
                onCheckedChange={() => handleCheckboxChange(route.id)}
              />
              <Label htmlFor={`route-${route.id}`} className="font-normal">{route.nome}</Label>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground">Nenhuma rota disponível. Crie uma rota primeiro.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignRoutesDialog;