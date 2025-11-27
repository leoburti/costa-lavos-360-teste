import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2 } from 'lucide-react';

export default function NovoEventoModal({ open, onOpenChange, onSuccess }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    tipo_evento: 'reuniao',
    data_evento: '',
    hora_inicio: '',
    hora_fim: '',
    local: '',
    descricao: '',
    is_recorrente: false,
    recorrencia_tipo: 'semanal',
    recorrencia_fim: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) throw new Error("Usuário não autenticado");

      if (!formData.titulo || !formData.data_evento || !formData.hora_inicio || !formData.hora_fim) {
        throw new Error("Por favor, preencha todos os campos obrigatórios.");
      }

      const payload = {
        profissional_id: user.id,
        ...formData,
        // Ensure tipo_evento value is compatible with DB enum
        tipo_evento: formData.tipo_evento === 'outros' ? 'outro' : formData.tipo_evento,
        status: 'agendado'
      };

      const { error } = await supabase.rpc('create_evento_completo', {
        p_dados_evento: payload,
        p_participantes: [], 
        p_lembretes: [] 
      });

      if (error) throw error;

      toast({
        title: "Evento criado com sucesso!",
        description: "O novo evento foi adicionado à sua agenda.",
        variant: "success",
        className: "bg-green-50 border-green-200 text-green-800"
      });

      onSuccess?.();
      onOpenChange(false);
      setFormData({
        titulo: '',
        tipo_evento: 'reuniao',
        data_evento: '',
        hora_inicio: '',
        hora_fim: '',
        local: '',
        descricao: '',
        is_recorrente: false,
        recorrencia_tipo: 'semanal',
        recorrencia_fim: ''
      });

    } catch (error) {
      console.error('Erro ao criar evento:', error);
      toast({
        title: "Erro ao criar evento",
        description: error.message || "Ocorreu um erro ao tentar salvar o evento.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="titulo" className="text-right">Título *</Label>
              <Input id="titulo" name="titulo" value={formData.titulo} onChange={handleChange} className="col-span-3" required placeholder="Ex: Reunião com Cliente" />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tipo" className="text-right">Tipo</Label>
              <Select value={formData.tipo_evento} onValueChange={(val) => handleSelectChange('tipo_evento', val)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reuniao">Reunião</SelectItem>
                  <SelectItem value="visita_tecnica">Visita Técnica</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="instalacao">Instalação</SelectItem>
                  <SelectItem value="treinamento">Treinamento</SelectItem>
                  <SelectItem value="outro">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="data_evento" className="text-right">Data *</Label>
              <Input id="data_evento" name="data_evento" type="date" value={formData.data_evento} onChange={handleChange} className="col-span-3" required />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hora_inicio" className="text-right">Início *</Label>
              <Input id="hora_inicio" name="hora_inicio" type="time" value={formData.hora_inicio} onChange={handleChange} className="col-span-3" required />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hora_fim" className="text-right">Fim *</Label>
              <Input id="hora_fim" name="hora_fim" type="time" value={formData.hora_fim} onChange={handleChange} className="col-span-3" required />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="local" className="text-right">Local</Label>
              <Input id="local" name="local" value={formData.local} onChange={handleChange} className="col-span-3" placeholder="Ex: Sala de Reuniões 1" />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="descricao" className="text-right pt-2">Descrição</Label>
              <Textarea id="descricao" name="descricao" value={formData.descricao} onChange={handleChange} className="col-span-3" placeholder="Detalhes adicionais..." rows={3} />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-start-2 col-span-3 flex items-center space-x-2">
                <Checkbox id="is_recorrente" name="is_recorrente" checked={formData.is_recorrente} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_recorrente: checked }))} />
                <Label htmlFor="is_recorrente">Evento Recorrente</Label>
              </div>
            </div>

            {formData.is_recorrente && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="recorrencia_tipo" className="text-right">Repetir</Label>
                  <Select value={formData.recorrencia_tipo} onValueChange={(val) => handleSelectChange('recorrencia_tipo', val)}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diaria">Diariamente</SelectItem>
                      <SelectItem value="semanal">Semanalmente</SelectItem>
                      <SelectItem value="mensal">Mensalmente</SelectItem>
                      <SelectItem value="anual">Anualmente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="recorrencia_fim" className="text-right">Até</Label>
                  <Input id="recorrencia_fim" name="recorrencia_fim" type="date" value={formData.recorrencia_fim} onChange={handleChange} className="col-span-3" />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Evento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}