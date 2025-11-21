import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const AtribuirChamadoModal = ({ onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profissionais, setProfissionais] = useState([]);
  const [chamados, setChamados] = useState([]);
  
  const [formData, setFormData] = useState({
    profissional_id: '',
    chamado_id: '',
    data_evento: '',
    hora_inicio: '',
    hora_fim: '',
    observacoes: ''
  });

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [profissionaisRes, chamadosRes] = await Promise.all([
        supabase.from('apoio_usuarios').select('id, nome'),
        supabase.from('apoio_chamados').select('id, motivo, cliente:apoio_clientes_comodato(nome_fantasia)').eq('status', 'aberto')
      ]);
      if (profissionaisRes.error) throw profissionaisRes.error;
      if (chamadosRes.error) throw chamadosRes.error;
      setProfissionais(profissionaisRes.data);
      setChamados(chamadosRes.data);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao carregar dados', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAssign = async () => {
    setLoading(true);
    try {
      const { profissional_id, chamado_id, data_evento, hora_inicio, hora_fim } = formData;
      if (!profissional_id || !chamado_id || !data_evento || !hora_inicio || !hora_fim) {
        throw new Error("Todos os campos de atribuição são obrigatórios.");
      }

      const selectedChamado = chamados.find(c => c.id === chamado_id);

      const { data: eventoData, error: eventoError } = await supabase.rpc('agendar_evento', {
          p_profissional_id: profissional_id,
          p_chamado_id: chamado_id,
          p_data: data_evento,
          p_hora_inicio: hora_inicio,
          p_hora_fim: hora_fim,
          p_usuario_id: user.id,
          p_titulo: `Chamado #${selectedChamado.id.substring(0,4)}: ${selectedChamado.cliente.nome_fantasia}`,
          p_descricao: selectedChamado.motivo,
          p_local: selectedChamado.cliente.nome_fantasia,
          p_tipo_evento: selectedChamado.tipo_chamado || 'visita_tecnica'
      });

      if (eventoError) throw eventoError;

      toast({ title: 'Sucesso!', description: 'Chamado atribuído e evento criado com sucesso!' });
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro na Atribuição', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Atribuir Chamado</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atribuir Novo Chamado</DialogTitle>
          <DialogDescription>Atribua um chamado a um profissional e agende um evento.</DialogDescription>
        </DialogHeader>
        {loading && !profissionais.length ? <div className="py-8 flex justify-center"><Loader2 className="animate-spin" /></div> : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="profissional_id">Profissional</Label>
              <Select onValueChange={(v) => handleChange('profissional_id', v)}><SelectTrigger><SelectValue placeholder="Selecione um profissional" /></SelectTrigger><SelectContent>{profissionais.map(p => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="chamado_id">Chamado</Label>
              <Select onValueChange={(v) => handleChange('chamado_id', v)}><SelectTrigger><SelectValue placeholder="Selecione um chamado" /></SelectTrigger><SelectContent>{chamados.map(c => <SelectItem key={c.id} value={c.id}>{`#${c.id.substring(0,4)} - ${c.cliente.nome_fantasia}`}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_evento">Data do Atendimento</Label>
                <Input id="data_evento" type="date" onChange={(e) => handleChange('data_evento', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hora_inicio">Hora Início</Label>
                <Input id="hora_inicio" type="time" onChange={(e) => handleChange('hora_inicio', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hora_fim">Hora Fim</Label>
              <Input id="hora_fim" type="time" onChange={(e) => handleChange('hora_fim', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea id="observacoes" placeholder="Observações para o evento e chamado..." onChange={(e) => handleChange('observacoes', e.target.value)} />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleAssign} disabled={loading}>{loading && <Loader2 className="animate-spin mr-2" />}Atribuir e Agendar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AtribuirChamadoModal;