import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet-async';
import AprovacaoTypesGrid from './AprovacaoTypesGrid';
import { usePersonas } from '@/hooks/usePersonas';
import { useUsuarios } from '@/hooks/useUsuarios';
import { searchCommercialEntities, validateCommercialEntity } from '@/services/apoioSyncService';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const UsuarioForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);
  
  const { fetchPersonas } = usePersonas();
  const { createUsuario, updateUsuario, fetchUsuarioById } = useUsuarios();
  
  const [personas, setPersonas] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    persona_id: '',
    status: 'ativo',
    eh_aprovador: false,
    tipos_aprovacao: {},
    pode_solicitar_bonificacao: false,
    tipo_vinculo: '',
    vinculo_comercial: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [accessPathOptions, setAccessPathOptions] = useState([]);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const personasData = await fetchPersonas();
      setPersonas(personasData || []);

      if (isEditing) {
        const user = await fetchUsuarioById(id);
        if (user) {
          setFormData({
            nome: user.nome || '',
            email: user.email || '',
            telefone: user.telefone || '',
            persona_id: user.persona_id || '',
            status: user.status || 'ativo',
            eh_aprovador: user.eh_aprovador || false,
            tipos_aprovacao: user.tipos_aprovacao || {},
            pode_solicitar_bonificacao: user.pode_solicitar_bonificacao || false,
            tipo_vinculo: user.tipo_vinculo || '',
            vinculo_comercial: user.vinculo_comercial || '',
          });
        }
      }
      setLoading(false);
    };
    loadData();
  }, [id, isEditing, fetchPersonas, fetchUsuarioById]);

  const handleSearchCommercial = async (search) => {
      if (!formData.tipo_vinculo || !search || search.length < 2) return;
      setLoadingSearch(true);
      const results = await searchCommercialEntities(formData.tipo_vinculo, search);
      setAccessPathOptions(results);
      setLoadingSearch(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleVinculoChange = (field, value) => {
    setFormData(prev => ({ 
        ...prev, 
        [field]: value,
        vinculo_comercial: field === 'tipo_vinculo' ? '' : prev.vinculo_comercial,
     }));
     setAccessPathOptions([]);
  };

  const handleReasonChange = (reasonId, checked) => {
    setFormData(prev => ({
      ...prev,
      tipos_aprovacao: {
        ...prev.tipos_aprovacao,
        [reasonId]: checked
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Nome e Email são obrigatórios.' });
        return;
    }

    if (formData.tipo_vinculo && !formData.vinculo_comercial) {
        toast({ variant: 'destructive', title: 'Erro', description: `Para o tipo de vínculo "${formData.tipo_vinculo}", é obrigatório definir o Vínculo Comercial.` });
        return;
    }
    
    if(formData.vinculo_comercial){
        const isValid = await validateCommercialEntity(formData.tipo_vinculo, formData.vinculo_comercial);
        if (!isValid) {
            toast({ variant: 'destructive', title: 'Vínculo Inválido', description: `O ${formData.tipo_vinculo} "${formData.vinculo_comercial}" não foi encontrado no banco de dados comercial (bd-cl).` });
            return;
        }
    }

    setLoading(true);
    
    try {
      const payload = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        persona_id: formData.persona_id || null,
        status: formData.status,
        eh_aprovador: formData.eh_aprovador,
        pode_solicitar_bonificacao: formData.pode_solicitar_bonificacao,
        tipos_aprovacao: formData.eh_aprovador ? formData.tipos_aprovacao : {},
        tipo_vinculo: formData.tipo_vinculo || null,
        vinculo_comercial: formData.vinculo_comercial || null,
      };

      let result;
      if (isEditing) {
        result = await updateUsuario(id, payload);
      } else {
        result = await createUsuario(payload);
      }

      if (result) {
        navigate('/configuracoes/gestao-equipe');
      }
    } catch (error) {
      console.error('Erro no formulário:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
      return <div>Carregando usuário...</div>
  }

  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Editar Usuário' : 'Novo Usuário'} - Apoio</title>
      </Helmet>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</CardTitle>
            <CardDescription>Preencha os dados para criar ou editar um usuário do sistema de apoio.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dados Básicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo <span className="text-red-500">*</span></Label>
                  <Input id="nome" value={formData.nome} onChange={(e) => handleChange('nome', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" value={formData.telefone} onChange={(e) => handleChange('telefone', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Persona e Acesso</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="persona">Persona (Função)</Label>
                  <Select value={formData.persona_id} onValueChange={(val) => handleChange('persona_id', val)}>
                    <SelectTrigger><SelectValue placeholder="Selecione uma persona" /></SelectTrigger>
                    <SelectContent>{personas.map(p => (<SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(val) => handleChange('status', val)}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4 border p-4 rounded-md bg-blue-50/50">
                <h3 className="text-lg font-semibold text-blue-800">Vínculo Comercial (opcional)</h3>
                <p className="text-xs text-muted-foreground mb-2">Vincule este usuário a um Supervisor ou Vendedor do banco de dados comercial para aplicar filtros de dados automáticos.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Tipo de Vínculo</Label>
                        <Select value={formData.tipo_vinculo} onValueChange={(val) => handleVinculoChange('tipo_vinculo', val)}>
                            <SelectTrigger><SelectValue placeholder="Selecione um tipo"/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Nenhum</SelectItem>
                                <SelectItem value="supervisor">Supervisor</SelectItem>
                                <SelectItem value="vendedor">Vendedor</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Nome do {formData.tipo_vinculo || '...'}</Label>
                        <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" aria-expanded={isComboboxOpen} className="w-full justify-between" disabled={!formData.tipo_vinculo}>
                                    {formData.vinculo_comercial || `Buscar ${formData.tipo_vinculo}...`}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0">
                                <Command shouldFilter={false}>
                                    <CommandInput placeholder={`Digite o nome...`} onValueChange={handleSearchCommercial}/>
                                    <CommandList>
                                        {loadingSearch && <CommandItem disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Buscando...</CommandItem>}
                                        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                                        <CommandGroup>
                                            {accessPathOptions.map((name) => (
                                                <CommandItem key={name} value={name} onSelect={(currentValue) => {handleVinculoChange('vinculo_comercial', currentValue); setIsComboboxOpen(false);}}>
                                                    <Check className={cn("mr-2 h-4 w-4", formData.vinculo_comercial === name ? "opacity-100" : "opacity-0")}/>
                                                    {name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Permissões de Bonificação</h3>
                <div className="flex items-center space-x-3 p-3 border rounded-md">
                    <Checkbox id="pode_solicitar_bonificacao" checked={formData.pode_solicitar_bonificacao} onCheckedChange={(checked) => handleChange('pode_solicitar_bonificacao', checked)} />
                    <Label htmlFor="pode_solicitar_bonificacao">Pode solicitar bonificação?</Label>
                </div>
              <div className="flex items-center space-x-2 p-3 border rounded-md">
                <Checkbox id="eh_aprovador" checked={formData.eh_aprovador} onCheckedChange={(checked) => handleChange('eh_aprovador', checked)} />
                <Label htmlFor="eh_aprovador">Este usuário é um aprovador de bonificações?</Label>
              </div>
              {formData.eh_aprovador && <AprovacaoTypesGrid selectedTypes={formData.tipos_aprovacao} onTypeChange={handleReasonChange} />}
            </div>

          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/configuracoes/gestao-equipe')}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar Usuário'}</Button>
          </CardFooter>
        </Card>
      </form>
    </>
  );
};

export default UsuarioForm;