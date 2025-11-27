import React, { useState, useMemo } from 'react';
import { useEquipmentSearch } from '@/hooks/useEquipmentSearch';
import EquipmentSearchInput from './EquipmentSearchInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Plus, Wrench, Database, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const EquipmentSelector = ({ clientId, selectedEquipments = [], onSelectionChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { equipments: rawEquipments, isLoading, refetch } = useEquipmentSearch(clientId, searchTerm);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();

  // Form state
  const [newEquipment, setNewEquipment] = useState({
    nome: '',
    modelo: '',
    serie: '',
    localizacao: ''
  });

  // CRITICAL FIX: Deduplicate items based on ID to prevent React key warnings and Infinite Loops in ScrollArea
  const uniqueEquipments = useMemo(() => {
    if (!rawEquipments) return [];
    
    const seen = new Set();
    return rawEquipments.filter(item => {
      // Ensure item exists and has an ID
      if (!item || !item.id) return false;
      const duplicate = seen.has(item.id);
      seen.add(item.id);
      return !duplicate;
    });
  }, [rawEquipments]);

  const handleToggle = (equipment) => {
    const isSelected = selectedEquipments.some(e => e.id === equipment.id);
    let newSelection;
    if (isSelected) {
      newSelection = selectedEquipments.filter(e => e.id !== equipment.id);
    } else {
      newSelection = [...selectedEquipments, equipment];
    }
    if (onSelectionChange) {
        onSelectionChange(newSelection);
    }
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
          status: 'ativo'
        })
        .select()
        .single();

      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Equipamento cadastrado com sucesso.' });
      setIsAddModalOpen(false);
      setNewEquipment({ nome: '', modelo: '', serie: '', localizacao: '' });
      
      // Add safe check before calling prop callback
      if (onSelectionChange) {
        onSelectionChange([...selectedEquipments, data]);
      }
      refetch();
    } catch (error) {
      console.error('Error adding equipment:', error);
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  };

  if (!clientId) {
    return (
      <div className="border border-dashed border-gray-200 rounded-lg p-8 text-center bg-gray-50/30">
        <p className="text-sm text-muted-foreground">Selecione um cliente primeiro.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-gray-50 border rounded-lg p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 w-full">
          <EquipmentSearchInput 
            value={searchTerm} 
            onChange={setSearchTerm} 
            isLoading={isLoading} 
          />
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="shrink-0 gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" /> Novo Equipamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Equipamento</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nome" className="text-right">Nome*</Label>
                <Input id="nome" className="col-span-3" value={newEquipment.nome} onChange={e => setNewEquipment({...newEquipment, nome: e.target.value})} placeholder="Ex: Ar Condicionado Split" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="modelo" className="text-right">Modelo</Label>
                <Input id="modelo" className="col-span-3" value={newEquipment.modelo} onChange={e => setNewEquipment({...newEquipment, modelo: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="serie" className="text-right">Série</Label>
                <Input id="serie" className="col-span-3" value={newEquipment.serie} onChange={e => setNewEquipment({...newEquipment, serie: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="local" className="text-right">Local</Label>
                <Input id="local" className="col-span-3" value={newEquipment.localizacao} onChange={e => setNewEquipment({...newEquipment, localizacao: e.target.value})} placeholder="Ex: Sala de Reunião" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddNewEquipment}>Salvar e Selecionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[200px] border rounded-md bg-white">
        <div className="p-4 space-y-2">
          {isLoading ? (
             <div className="flex justify-center py-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Carregando...
             </div>
          ) : uniqueEquipments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Database className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Nenhum equipamento encontrado.</p>
            </div>
          ) : (
            uniqueEquipments.map((equip, index) => {
              // SAFE KEY: Use ID if valid, otherwise index fallback to prevent crash
              const safeKey = equip.id || `fallback-key-${index}`;
              const isSelected = selectedEquipments.some(e => e.id === equip.id);
              
              return (
                <div 
                  key={safeKey}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}
                >
                  <Checkbox 
                    id={`equip-${safeKey}`} 
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(equip)}
                  />
                  <div className="grid gap-1.5 leading-none w-full cursor-pointer" onClick={() => handleToggle(equip)}>
                    <label
                      htmlFor={`equip-${safeKey}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {equip.nome}
                    </label>
                    <div className="text-xs text-muted-foreground flex gap-2 flex-wrap">
                      {equip.modelo && <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">Mod: {equip.modelo}</span>}
                      {equip.serie && <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">S/N: {equip.serie}</span>}
                      {equip.localizacao && <span className="flex items-center gap-1"><Wrench className="h-3 w-3" /> {equip.localizacao}</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
      
      {selectedEquipments.length > 0 && (
        <div className="text-sm text-blue-600 font-medium px-1">
          {selectedEquipments.length} equipamento(s) selecionado(s)
        </div>
      )}
    </div>
  );
};

export default EquipmentSelector;