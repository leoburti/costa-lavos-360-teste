import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const EquipmentForm = ({ equipment, onSave, onCancel }) => {
  const { toast } = useToast();
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    family_id: '',
    nome: '',
    modelo: '',
    fabricante: '',
    ativo_fixo: '',
    serial: '',
    local: '',
    status: 'ativo'
  });

  useEffect(() => {
    const fetchFamilies = async () => {
      const { data, error } = await supabase.from('equipment_families').select('id, nome').order('nome');
      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao carregar famílias' });
      } else {
        setFamilies(data);
      }
    };

    fetchFamilies();

    if (equipment) {
      setFormData({
        family_id: equipment.family_id || '',
        nome: equipment.nome || '',
        modelo: equipment.modelo || '',
        fabricante: equipment.fabricante || '',
        ativo_fixo: equipment.ativo_fixo || '',
        serial: equipment.serial || '',
        local: equipment.local || '',
        status: equipment.status || 'ativo'
      });
    } else {
       setFormData({
        family_id: '', nome: '', modelo: '', fabricante: '',
        ativo_fixo: '', serial: '', local: '', status: 'ativo'
      });
    }
  }, [equipment, toast]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.family_id) {
      toast({ variant: 'destructive', title: 'Nome e Família são obrigatórios.' });
      return;
    }
    setLoading(true);

    const payload = { ...formData };
    if (!payload.family_id) {
      payload.family_id = null;
    }

    let error;
    if (equipment?.id) {
      const { error: updateError } = await supabase.from('equipment').update(payload).eq('id', equipment.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('equipment').insert(payload);
      error = insertError;
    }

    setLoading(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar equipamento', description: error.message });
    } else {
      toast({ title: 'Sucesso!', description: 'Equipamento salvo.' });
      onSave();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{equipment ? 'Editar' : 'Adicionar'} Equipamento</DialogTitle>
          <DialogDescription>Preencha os detalhes do equipamento.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="md:col-span-2">
            <Label htmlFor="nome">Nome do Equipamento</Label>
            <Input id="nome" value={formData.nome} onChange={e => handleInputChange('nome', e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="family_id">Família</Label>
            <Select value={formData.family_id} onValueChange={value => handleInputChange('family_id', value)} required>
              <SelectTrigger><SelectValue placeholder="Selecione uma família..." /></SelectTrigger>
              <SelectContent>
                {families.map(family => <SelectItem key={family.id} value={family.id}>{family.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={value => handleInputChange('status', value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="em_manutencao">Em Manutenção</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="modelo">Modelo</Label>
            <Input id="modelo" value={formData.modelo} onChange={e => handleInputChange('modelo', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="fabricante">Fabricante</Label>
            <Input id="fabricante" value={formData.fabricante} onChange={e => handleInputChange('fabricante', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="ativo_fixo">Ativo Fixo</Label>
            <Input id="ativo_fixo" value={formData.ativo_fixo} onChange={e => handleInputChange('ativo_fixo', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="serial">Número de Série</Label>
            <Input id="serial" value={formData.serial} onChange={e => handleInputChange('serial', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="local">Localização</Label>
            <Input id="local" value={formData.local} onChange={e => handleInputChange('local', e.target.value)} />
          </div>
          <DialogFooter className="md:col-span-2 mt-4">
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentForm;