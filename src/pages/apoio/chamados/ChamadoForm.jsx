import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet-async';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useChamados } from '@/hooks/useChamados';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

const ChamadoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const { createChamado, updateChamado, fetchChamadoById, loading: chamadosLoading } = useChamados();
  const [clientes, setClientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form state
  const [clienteId, setClienteId] = useState('');
  const [tipoChamado, setTipoChamado] = useState('');
  const [motivo, setMotivo] = useState('');
  const [prioridade, setPrioridade] = useState('media');
  const [observacoes, setObservacoes] = useState('');
  const [profissionalId, setProfissionalId] = useState('none'); // Initialize with 'none'
  const [dataLimite, setDataLimite] = useState(null);
  const [status, setStatus] = useState('aberto');

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      await supabase.functions.invoke('sync-chamados-clientes');
      const [clientesRes, profissionaisRes] = await Promise.all([
        supabase.from('apoio_chamados_clientes').select('cliente_comodato_id, nome_fantasia').order('nome_fantasia'),
        supabase.from('apoio_usuarios').select('id, nome').eq('status', 'ativo').order('nome'),
      ]);

      if (clientesRes.error) throw clientesRes.error;
      if (profissionaisRes.error) throw profissionaisRes.error;

      setClientes(clientesRes.data);
      setProfissionais(profissionaisRes.data);

      if (isEditing && id) {
        const chamado = await fetchChamadoById(id);
        if (chamado && chamado.chamado) {
          const details = chamado.chamado;
          setClienteId(details.cliente_id);
          setTipoChamado(details.tipo_chamado);
          setMotivo(details.motivo);
          setPrioridade(details.prioridade);
          setObservacoes(details.observacoes);
          setProfissionalId(details.profissional_sugerido_id || 'none');
          setStatus(details.status);
          if (details.data_limite) {
            setDataLimite(parseISO(details.data_limite));
          }
        }
      }
    } catch (error) {
      toast({ title: "Erro ao carregar dados", description: error.message, variant: "destructive" });
    } finally {
      setLoadingData(false);
    }
  }, [id, isEditing, toast, fetchChamadoById]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clienteId || !tipoChamado) {
      toast({ title: "Campos obrigatórios", description: "Cliente e Tipo de Chamado são obrigatórios.", variant: "warning" });
      return;
    }

    const chamadoData = {
      cliente_id: clienteId,
      tipo_chamado: tipoChamado,
      motivo,
      prioridade,
      observacoes,
      profissional_sugerido_id: profissionalId === 'none' ? null : profissionalId,
      data_limite: dataLimite ? format(dataLimite, "yyyy-MM-dd") : null,
      status,
    };

    let result;
    if (isEditing) {
      result = await updateChamado(id, chamadoData);
    } else {
      result = await createChamado(chamadoData);
    }

    if (result) {
      navigate('/apoio/chamados');
    }
  };
  
  if (loadingData) {
    return (
        <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <>
      <Helmet><title>{isEditing ? 'Editar Chamado' : 'Novo Chamado'}</title></Helmet>
      <form onSubmit={handleSubmit}>
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>{isEditing ? `Editar Chamado #${id.substring(0, 8)}` : 'Abrir Novo Chamado'}</CardTitle>
            <CardDescription>Preencha os dados para abrir ou editar um chamado de serviço.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label htmlFor="cliente">Cliente (Comodato)</Label><Select required value={clienteId} onValueChange={setClienteId}><SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger><SelectContent>{clientes.map(c => (<SelectItem key={c.cliente_comodato_id} value={c.cliente_comodato_id}>{c.nome_fantasia}</SelectItem>))}</SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="tipo_chamado">Tipo de Chamado</Label><Select required value={tipoChamado} onValueChange={setTipoChamado}><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger><SelectContent><SelectItem value="troca">Troca</SelectItem><SelectItem value="retirada">Retirada</SelectItem><SelectItem value="entrega">Entrega</SelectItem><SelectItem value="manutencao">Manutenção</SelectItem><SelectItem value="suporte">Suporte</SelectItem><SelectItem value="visita">Visita Técnica</SelectItem><SelectItem value="outro">Outro</SelectItem></SelectContent></Select></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2"><Label htmlFor="prioridade">Prioridade</Label><Select value={prioridade} onValueChange={setPrioridade}><SelectTrigger><SelectValue placeholder="Defina a prioridade" /></SelectTrigger><SelectContent><SelectItem value="baixa">Baixa</SelectItem><SelectItem value="media">Média</SelectItem><SelectItem value="alta">Alta</SelectItem><SelectItem value="critica">Crítica</SelectItem></SelectContent></Select></div>
                {isEditing && (<div className="space-y-2"><Label htmlFor="status">Status</Label><Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue placeholder="Defina o status" /></SelectTrigger><SelectContent><SelectItem value="aberto">Aberto</SelectItem><SelectItem value="atribuido">Atribuído</SelectItem><SelectItem value="em_andamento">Em Andamento</SelectItem><SelectItem value="resolvido">Resolvido</SelectItem><SelectItem value="fechado">Fechado</SelectItem><SelectItem value="cancelado">Cancelado</SelectItem></SelectContent></Select></div>)}
                 <div className="space-y-2"><Label htmlFor="data_limite">Data Limite (opcional)</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !dataLimite && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{dataLimite ? format(dataLimite, "dd/MM/yyyy") : <span>Escolha uma data</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dataLimite} onSelect={setDataLimite} initialFocus /></PopoverContent></Popover></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label htmlFor="motivo">Motivo / Título do Chamado</Label><Input id="motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex: Equipamento parado..." /></div>
                <div className="space-y-2"><Label htmlFor="profissional">Atribuir a</Label><Select value={profissionalId} onValueChange={setProfissionalId}><SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger><SelectContent><SelectItem value="none">Nenhum (Não atribuído)</SelectItem>{profissionais.map(p => (<SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>))}</SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label htmlFor="observacoes">Observações / Descrição Detalhada</Label><Textarea id="observacoes" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Descreva o problema ou a solicitação em detalhes." rows={5} /></div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/apoio/chamados')}>Cancelar</Button>
            <Button type="submit" disabled={chamadosLoading}>
              {chamadosLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Salvar Alterações' : 'Abrir Chamado'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </>
  );
};

export default ChamadoForm;