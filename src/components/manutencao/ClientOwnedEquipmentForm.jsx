
import React, { useState } from 'react';
import { useClientEquipments } from '@/hooks/useClientEquipments';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Plus, User, Wrench, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Badge } from '@/components/ui/badge';

const ClientOwnedEquipmentForm = ({ clientId, selectedEquipments, onSelectionChange }) => {
  const { equipments, isLoading, refetch } = useClientEquipments(clientId);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();

  // Filter only Client owned items
  const clientOwnedEquipments = equipments.filter(eq => eq.tipo_propriedade === 'cliente');

  const [newEquipment, setNewEquipment] = useState({
    nome: '',
    modelo: '',
    serie: '',
    localizacao: ''
  });

  const handleToggle = (equipment) => {
    const isSelected = selectedEquipments.some(e => e.id === equipment.id);
    let newSelection;
    if (isSelected) {
      newSelection = selectedEquipments.filter(e => e.id !== equipment.id);
    } else {
      newSelection = [...selectedEquipments, { ...equipment, source: 'cliente' }];
    }
    onSelectionChange(newSelection);
  };

  const handleAddNewEquipment = async () => {
    if (!newEquipment.nome) {
      toast({ variant: 'destructive', description: 'Nome do equipamento é obrigatório.' });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('equipamentos')
        .insert({
          ...newEquipment,
          cliente_id: clientId,
          status: 'ativo',
          tipo_propriedade: 'cliente'
        })
        .select()
        .single();

      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Equipamento do cliente registrado.' });
      setIsAddModalOpen(false);
      setNewEquipment({ nome: '', modelo: '', serie: '', localizacao: '' });
      
      // Select automatically
      onSelectionChange([...selectedEquipments, { ...data, source: 'cliente' }]);
      refetch(); 
    } catch (error) {
      console.error('Error adding equipment:', error);
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  };

  if (!clientId) return null;

  return (
    <div className="space-y-4 bg-amber-50/50 border border-amber-100 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-amber-900 flex items-center gap-2">
          <User className="h-4 w-4" />
          Equipamentos Próprios do Cliente ({clientOwnedEquipments.length})
        </h4>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="bg-white border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 gap-1">
              <Plus className="h-3 w-3" /> Registrar Novo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Registrar Equipamento do Cliente</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome / Descrição*</Label>
                <Input 
                    id="nome" 
                    value={newEquipment.nome} 
                    onChange={e => setNewEquipment({...newEquipment, nome: e.target.value})} 
                    placeholder="Ex: Freezer Horizontal Consul" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="modelo">Modelo</Label>
                    <Input 
                        id="modelo" 
                        value={newEquipment.modelo} 
                        onChange={e => setNewEquipment({...newEquipment, modelo: e.target.value})} 
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="serie">Nº Série</Label>
                    <Input 
                        id="serie" 
                        value={newEquipment.serie} 
                        onChange={e => setNewEquipment({...newEquipment, serie: e.target.value})} 
                    />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="local">Localização na Loja</Label>
                <Input 
                    id="local" 
                    value={newEquipment.localizacao} 
                    onChange={e => setNewEquipment({...newEquipment, localizacao: e.target.value})} 
                    placeholder="Ex: Cozinha, Área de Vendas" 
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddNewEquipment} className="bg-amber-600 hover:bg-amber-700 text-white">
                <Save className="mr-2 h-4 w-4" /> Salvar Registro
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[200px]">
        <div className="space-y-2">
          {clientOwnedEquipments.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-amber-200 rounded-lg bg-white/50">
              <p className="text-sm text-amber-800/70">Nenhum equipamento próprio registrado ainda.</p>
              <p className="text-xs text-amber-800/50 mt-1">Clique em "Registrar Novo" para adicionar.</p>
            </div>
          ) : (
            clientOwnedEquipments.map((equip) => {
              const isSelected = selectedEquipments.some(e => e.id === equip.id);
              return (
                <div 
                  key={equip.id} 
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    isSelected 
                        ? 'border-amber-500 bg-amber-100/50 ring-1 ring-amber-200' 
                        : 'border-amber-200/50 bg-white hover:bg-amber-50 hover:border-amber-300'
                  }`}
                  onClick={() => handleToggle(equip)}
                >
                  <Checkbox 
                    id={`client-own-${equip.id}`} 
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(equip)}
                    className="mt-1 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                  />
                  <div className="grid gap-1.5 leading-none w-full">
                    <label
                      htmlFor={`client-own-${equip.id}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {equip.nome}
                    </label>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {equip.modelo && <span className="bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">Mod: {equip.modelo}</span>}
                      {equip.localizacao && <span className="flex items-center gap-1 text-amber-800"><Wrench className="h-3 w-3" /> {equip.localizacao}</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ClientOwnedEquipmentForm;
