import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getClientesComodato, getProfissionaisParaSelect, getEquipamentosComodatoByCliente } from '@/services/apoioSyncService';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, ArrowLeft, Save, Wrench, Check, ChevronsUpDown, Settings, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFormStatePersistence } from '@/hooks/useFormStatePersistence';
import { PersistenceStatus } from '@/components/PersistenceStatus';

// Constants for maintenance types that require equipment selection
const MAINTENANCE_TYPES = ['manutencao', 'preventiva'];

// Schema de validação
const chamadoSchema = z.object({
  cliente_id: z.string().min(1, 'Selecione um cliente'),
  tipo_chamado: z.string().min(1, 'Selecione o tipo'),
  motivo: z.string().min(5, 'Descreva o motivo com mais detalhes'),
  prioridade: z.string().min(1, 'Selecione a prioridade'),
  data_limite: z.string().optional().nullable(),
  profissional_sugerido_id: z.string().optional().or(z.literal('')),
  observacoes: z.string().optional(),
  status: z.string().default('aberto'),
  equipamentos_selecionados: z.array(z.string()).optional(),
}).refine((data) => {
  if (MAINTENANCE_TYPES.includes(data.tipo_chamado)) {
    return data.equipamentos_selecionados && data.equipamentos_selecionados.length > 0;
  }
  return true;
}, {
  message: "Selecione pelo menos um equipamento para manutenção",
  path: ["equipamentos_selecionados"],
});

const ChamadoForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userContext, loading: authLoading, forceRoleRefetch } = useAuth();
  
  const [clientes, setClientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [equipamentosCliente, setEquipamentosCliente] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingEquipamentos, setLoadingEquipamentos] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [openCliente, setOpenCliente] = useState(false);
  const [searchCliente, setSearchCliente] = useState("");

  const defaultValues = {
      cliente_id: '',
      tipo_chamado: '',
      motivo: '',
      prioridade: 'media',
      status: 'aberto',
      data_limite: '',
      profissional_sugerido_id: '',
      observacoes: '',
      equipamentos_selecionados: [],
  };

  const form = useForm({
    resolver: zodResolver(chamadoSchema),
    defaultValues
  });

  const { handleBulkChange, status, lastSaved, clearDraft } = useFormStatePersistence(
      `chamado_form_${id || 'new'}`,
      defaultValues,
      (restored) => {
          if (restored) form.reset(restored);
      }
  );

  // Watch form changes for persistence
  useEffect(() => {
      const subscription = form.watch((value) => {
          handleBulkChange(value);
      });
      return () => subscription.unsubscribe();
  }, [form.watch, handleBulkChange]);

  const selectedClienteId = form.watch('cliente_id');
  const selectedTipoChamado = form.watch('tipo_chamado');

  const handleSelectClient = useCallback((clienteId) => {
    form.setValue("cliente_id", clienteId, { 
      shouldValidate: true,
      shouldDirty: true 
    });
    setOpenCliente(false);
    setSearchCliente("");
  }, [form]);

  const clearSelection = useCallback((e) => {
    e.stopPropagation();
    form.setValue("cliente_id", "", { shouldValidate: true });
    setEquipamentosCliente([]);
  }, [form]);

  const filteredClientes = useMemo(() => {
    if (!searchCliente) return clientes.slice(0, 50); 
    const lowerSearch = searchCliente.toLowerCase().trim();
    return clientes.filter((cliente) => 
      (cliente.nome_fantasia?.toLowerCase() || '').includes(lowerSearch) ||
      (cliente.razao_social?.toLowerCase() || '').includes(lowerSearch) ||
      (cliente.cnpj || '').includes(lowerSearch) ||
      (cliente.id || '').toLowerCase().includes(lowerSearch)
    ).slice(0, 50); 
  }, [clientes, searchCliente]);

  const selectedClienteLabel = useMemo(() => {
    const cliente = clientes.find(c => c.id === selectedClienteId);
    return cliente ? (cliente.nome_fantasia || cliente.razao_social) : "Selecione o cliente...";
  }, [clientes, selectedClienteId]);

  const hasEquipment = (cliente) => !!cliente.apto_comodato;

  useEffect(() => {
    const fetchEquipamentos = async () => {
      if (!selectedClienteId) {
        setEquipamentosCliente([]);
        return;
      }

      if (MAINTENANCE_TYPES.includes(selectedTipoChamado)) {
        try {
          setLoadingEquipamentos(true);
          const data = await getEquipamentosComodatoByCliente(selectedClienteId);
          setEquipamentosCliente(data || []);
        } catch (error) {
          console.error("❌ [DEBUG] Erro ao buscar equipamentos:", error);
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível carregar os equipamentos do cliente."
          });
        } finally {
          setLoadingEquipamentos(false);
        }
      } else {
        setEquipamentosCliente([]);
      }
    };

    fetchEquipamentos();
  }, [selectedClienteId, selectedTipoChamado, toast]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        
        const [clientesData, profissionaisData] = await Promise.all([
          getClientesComodato('Todos'),
          getProfissionaisParaSelect()
        ]);
        
        setClientes(clientesData || []);
        setProfissionais(profissionaisData || []);

        if (isEditMode) {
          const { data: chamado, error } = await supabase
            .from('apoio_chamados')
            .select(`
              *,
              equipamentos:apoio_chamados_equipamentos(equipamento_id)
            `)
            .eq('id', id)
            .single();

          if (error) throw error;

          if (chamado) {
            let equipamentosIds = [];

            if (chamado.dados_solicitacao?.equipamentos) {
                equipamentosIds = chamado.dados_solicitacao.equipamentos.map(e => e.numero_serie || e.id);
            } 
            else if (chamado.equipamentos && chamado.equipamentos.length > 0) {
                equipamentosIds = chamado.equipamentos.map(e => e.equipamento_id);
            }

            form.reset({
              cliente_id: chamado.cliente_id,
              tipo_chamado: chamado.tipo_chamado,
              motivo: chamado.motivo,
              prioridade: chamado.prioridade,
              status: chamado.status,
              data_limite: chamado.data_limite || '',
              profissional_sugerido_id: chamado.profissional_sugerido_id || '',
              observacoes: chamado.observacoes || '',
              equipamentos_selecionados: equipamentosIds,
            });
            
            if (MAINTENANCE_TYPES.includes(chamado.tipo_chamado)) {
               const equipData = await getEquipamentosComodatoByCliente(chamado.cliente_id);
               setEquipamentosCliente(equipData || []);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          variant: "destructive",
          title: "Erro de carregamento",
          description: "Não foi possível carregar os dados necessários."
        });
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [isEditMode, id, form, toast]);

  const onSubmit = async (data) => {
    let criadorId = userContext?.apoioId;

    if (!criadorId) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: p1 } = await supabase.from('apoio_usuarios').select('id').eq('auth_id', user.id).maybeSingle();
                if (p1) criadorId = p1.id;
                
                if (!criadorId && user.email) {
                    const { data: p2 } = await supabase.from('apoio_usuarios').select('id').eq('email', user.email).maybeSingle();
                    if (p2) {
                        criadorId = p2.id;
                        await supabase.from('apoio_usuarios').update({ auth_id: user.id }).eq('id', p2.id);
                    }
                }

                if (!criadorId) {
                    const { data: newProfile } = await supabase.from('apoio_usuarios').insert({
                        nome: user.user_metadata?.full_name || user.email.split('@')[0],
                        email: user.email,
                        auth_id: user.id,
                        status: 'ativo',
                        nivel_acesso: 1,
                    }).select().single();
                    if (newProfile) criadorId = newProfile.id;
                }
            }
        } catch (err) {
            console.error("Erro crítico na recuperação de perfil:", err);
        }
    }

    if (!criadorId && !isEditMode) {
        toast({
            variant: "destructive",
            title: "Perfil não encontrado",
            description: "Não foi possível identificar ou criar seu perfil de usuário no módulo de Apoio. Contate o administrador."
        });
        return;
    }

    setSubmitting(true);
    try {
      const payload = {
        cliente_id: data.cliente_id,
        tipo_chamado: data.tipo_chamado,
        motivo: data.motivo,
        prioridade: data.prioridade,
        status: data.status,
        observacoes: data.observacoes,
        data_limite: data.data_limite || null,
        profissional_sugerido_id: data.profissional_sugerido_id || null,
        ...(isEditMode ? {} : { criado_por: criadorId }),
      };

      if (MAINTENANCE_TYPES.includes(data.tipo_chamado) && data.equipamentos_selecionados?.length > 0) {
          const selectedObjects = equipamentosCliente.filter(e => 
              data.equipamentos_selecionados.includes(e.id)
          );
          
          if (isEditMode) {
              const { data: currentData } = await supabase.from('apoio_chamados').select('dados_solicitacao').eq('id', id).single();
              payload.dados_solicitacao = { ...(currentData?.dados_solicitacao || {}), equipamentos: selectedObjects };
          } else {
              payload.dados_solicitacao = { equipamentos: selectedObjects };
          }
      }

      let error;
      if (isEditMode) {
        const { error: updateError } = await supabase
          .from('apoio_chamados')
          .update(payload)
          .eq('id', id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('apoio_chamados')
          .insert([payload])
          .select()
          .single();
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: isEditMode ? "Chamado atualizado" : "Chamado criado",
        description: isEditMode ? "As alterações foram salvas." : "Novo chamado registrado com sucesso.",
        className: "bg-green-50 border-green-200 text-green-800",
      });

      clearDraft();
      navigate('/admin/apoio/chamados/todos');

    } catch (error) {
      console.error("Erro ao salvar chamado:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao processar sua solicitação."
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loadingData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#6B2C2C]" />
        <p className="text-muted-foreground">Carregando formulário...</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="max-w-4xl mx-auto p-6 pb-24 relative">
        <div className="absolute top-6 right-6">
            <PersistenceStatus status={status} lastSaved={lastSaved} />
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#6B2C2C]">
              {isEditMode ? 'Editar Chamado' : 'Novo Chamado'}
            </h1>
            <p className="text-sm text-muted-foreground">Preencha os detalhes da solicitação de serviço.</p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            
            {/* Coluna Esquerda - Dados Principais */}
            <div className="md:col-span-2 space-y-6">
              <Card className="border-l-4 border-l-[#6B2C2C]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-[#6B2C2C]" />
                    Informações do Serviço
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6">
                  
                  {/* Cliente - Combobox Search */}
                  <div className="space-y-2">
                    <Label htmlFor="cliente_id">Cliente <span className="text-red-500">*</span></Label>
                    <Controller
                      name="cliente_id"
                      control={form.control}
                      render={({ field }) => (
                        <Popover open={openCliente} onOpenChange={setOpenCliente}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openCliente}
                              className={cn(
                                "w-full justify-between h-11 group", 
                                !field.value && "text-muted-foreground",
                                form.formState.errors.cliente_id && "border-red-500 hover:border-red-500"
                              )}
                            >
                              <span className="truncate max-w-[300px] text-left flex items-center gap-2">
                                {selectedClienteLabel}
                                {field.value && (
                                  <span className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={clearSelection}>
                                    <X className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                                  </span>
                                )}
                              </span>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[400px] p-0" align="start">
                            <Command shouldFilter={false}>
                              <CommandInput 
                                placeholder="Buscar cliente por nome, fantasia ou CNPJ..." 
                                value={searchCliente}
                                onValueChange={setSearchCliente}
                              />
                              <CommandList className="max-h-[300px] overflow-y-auto">
                                {filteredClientes.length === 0 && (
                                  <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                                )}
                                <CommandGroup>
                                  {filteredClientes.map((cliente) => (
                                    <CommandItem
                                      key={cliente.id}
                                      value={String(cliente.id)} 
                                      onSelect={() => handleSelectClient(cliente.id)}
                                      onClick={() => handleSelectClient(cliente.id)} 
                                      className="cursor-pointer"
                                      asChild={false}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4 text-[#6B2C2C]",
                                          selectedClienteId === cliente.id ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      <div className="flex flex-col w-full overflow-hidden">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium truncate">{cliente.nome_fantasia || cliente.razao_social}</span>
                                          {hasEquipment(cliente) && (
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <div className="inline-flex bg-amber-100 p-0.5 rounded-sm border border-amber-200">
                                                  <Wrench className="h-3 w-3 text-amber-700" />
                                                </div>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p className="text-xs">Possui equipamentos em comodato</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          )}
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground items-center mt-1">
                                          <span className="truncate max-w-[180px]">{cliente.razao_social}</span>
                                          <span className="shrink-0">{cliente.cnpj}</span>
                                        </div>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                    {form.formState.errors.cliente_id && (
                      <p className="text-sm text-red-500">{form.formState.errors.cliente_id.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="tipo_chamado">Tipo de Serviço <span className="text-red-500">*</span></Label>
                      <Controller
                        name="tipo_chamado"
                        control={form.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className={cn("h-11", form.formState.errors.tipo_chamado && "border-red-500")}>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="manutencao">Manutenção Corretiva</SelectItem>
                              <SelectItem value="preventiva">Manutenção Preventiva</SelectItem>
                              <SelectItem value="entrega">Entrega de Equipamento</SelectItem>
                              <SelectItem value="retirada">Retirada de Equipamento</SelectItem>
                              <SelectItem value="troca">Troca de Equipamento</SelectItem>
                              <SelectItem value="outros">Outros / Visita Técnica</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {form.formState.errors.tipo_chamado && (
                        <p className="text-sm text-red-500">{form.formState.errors.tipo_chamado.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prioridade">Prioridade <span className="text-red-500">*</span></Label>
                      <Controller
                        name="prioridade"
                        control={form.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="baixa">Baixa</SelectItem>
                              <SelectItem value="media">Média</SelectItem>
                              <SelectItem value="alta">Alta</SelectItem>
                              <SelectItem value="critica">Crítica</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  {MAINTENANCE_TYPES.includes(selectedTipoChamado) && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="flex items-center justify-between">
                        <Label className="text-[#6B2C2C]">Selecione os Equipamentos <span className="text-red-500">*</span></Label>
                        {loadingEquipamentos && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                      </div>
                      
                      <div className="border rounded-md bg-slate-50/50 p-4">
                        {loadingEquipamentos ? (
                          <div className="flex items-center justify-center py-8 text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Buscando equipamentos...
                          </div>
                        ) : equipamentosCliente.length > 0 ? (
                          <ScrollArea className="h-[200px] pr-4">
                            <Controller
                              name="equipamentos_selecionados"
                              control={form.control}
                              render={({ field }) => (
                                <div className="space-y-3">
                                  {equipamentosCliente.map((equip) => (
                                    <div key={equip.id} className="flex items-start space-x-3 bg-white p-2 rounded border hover:border-[#6B2C2C]/30 transition-colors">
                                      <Checkbox 
                                        id={`equip-${equip.id}`} 
                                        checked={field.value?.includes(equip.id)}
                                        onCheckedChange={(checked) => {
                                          const current = field.value || [];
                                          const next = checked 
                                            ? [...current, equip.id] 
                                            : current.filter((val) => val !== equip.id);
                                          field.onChange(next);
                                        }}
                                      />
                                      <div className="grid gap-1.5 leading-none w-full">
                                        <Label htmlFor={`equip-${equip.id}`} className="text-sm font-medium cursor-pointer flex items-center gap-2">
                                          {equip.nome_modelo || 'Equipamento Desconhecido'}
                                          <Settings className="h-3 w-3 text-slate-400" />
                                        </Label>
                                        <div className="flex flex-col gap-1 text-xs text-muted-foreground pr-2">
                                          <div className="flex items-center gap-3">
                                            <span>Chapa: <span className="font-mono font-medium text-[#6B2C2C]">{equip.chapa || 'N/A'}</span></span>
                                            <span className="text-slate-300">|</span>
                                            <span>Série: <span className="font-mono text-foreground">{equip.numero_serie}</span></span>
                                          </div>
                                          {equip.data_venda && <span>Instalado: {new Date(equip.data_venda).toLocaleDateString('pt-BR')}</span>}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            />
                          </ScrollArea>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
                            <Info className="h-8 w-8 text-slate-300" />
                            <p>
                              {selectedClienteId 
                                ? "Nenhum equipamento encontrado no inventário deste cliente." 
                                : "Selecione um cliente para ver os equipamentos."}
                            </p>
                          </div>
                        )}
                      </div>
                      {form.formState.errors.equipamentos_selecionados && (
                        <p className="text-sm text-red-500 font-medium mt-1 bg-red-50 p-2 rounded border border-red-100">
                          {form.formState.errors.equipamentos_selecionados.message}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="motivo">Motivo / Assunto <span className="text-red-500">*</span></Label>
                    <Input 
                      id="motivo" 
                      placeholder="Ex: Máquina não liga, Vazamento de água..." 
                      {...form.register('motivo')} 
                      className={cn("h-11", form.formState.errors.motivo && "border-red-500")}
                    />
                    {form.formState.errors.motivo && (
                      <p className="text-sm text-red-500">{form.formState.errors.motivo.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações Detalhadas</Label>
                    <Textarea 
                      id="observacoes" 
                      placeholder="Descreva o problema com o máximo de detalhes possível para auxiliar o técnico..." 
                      className="min-h-[120px] resize-none"
                      {...form.register('observacoes')} 
                    />
                  </div>

                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Agendamento e Atribuição</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="data_limite">Data Limite (SLA)</Label>
                    <Controller
                      name="data_limite"
                      control={form.control}
                      render={({ field: { value, onChange, ...fieldProps } }) => (
                        <Input 
                          id="data_limite" 
                          type="date" 
                          className="h-11"
                          value={value || ''} 
                          onChange={(e) => onChange(e.target.value)}
                          {...fieldProps} 
                        />
                      )}
                    />
                    <p className="text-xs text-muted-foreground">Data esperada para conclusão.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profissional_sugerido_id">Técnico Responsável</Label>
                    <Controller
                      name="profissional_sugerido_id"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Selecione um técnico..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">-- Não atribuir agora --</SelectItem>
                            {profissionais.map((prof) => (
                              <SelectItem key={prof.value} value={prof.value}>
                                {prof.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <p className="text-xs text-muted-foreground">Opcional. Pode ser definido posteriormente.</p>
                  </div>

                </CardContent>
              </Card>

              {MAINTENANCE_TYPES.includes(selectedTipoChamado) && (form.watch('equipamentos_selecionados') || []).length > 0 && (
                <Card className="bg-slate-50 border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Resumo da Manutenção</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Equipamentos:</span>
                      <span className="bg-[#6B2C2C] text-white text-xs font-bold px-2 py-1 rounded-full">
                        {form.watch('equipamentos_selecionados').length} selecionado(s)
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex flex-col gap-3 pt-4">
                <Button type="submit" className="w-full h-12 bg-[#6B2C2C] hover:bg-[#6B2C2C]/90 text-white font-semibold text-base shadow-md transition-all hover:translate-y-[-1px]" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      {isEditMode ? 'Salvar Alterações' : 'Criar Chamado'}
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" className="w-full h-12" onClick={() => navigate(-1)}>
                  Cancelar
                </Button>
              </div>
            </div>

          </div>
        </form>
      </div>
    </TooltipProvider>
  );
};

export default ChamadoForm;