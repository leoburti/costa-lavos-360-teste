
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
import PermissionsGrid from './PermissionsGrid';
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
    access_path: ''
  });
  
  // Access Path (Link Comercial) States
  const [isAccessPathRequired, setIsAccessPathRequired] = useState(false);
  const [accessPathType, setAccessPathType] = useState(null); // 'Vendedor' or 'Supervisor'
  const [accessPathOptions, setAccessPathOptions] = useState([]);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  
  const [loading, setLoading] = useState(false);

  // Initial Load
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
            access_path: user.access_path || ''
          });
        }
      }
      setLoading(false);
    };
    loadData();
  }, [id, isEditing, fetchPersonas, fetchUsuarioById]);

  // Persona Change Logic - determine if we need commercial link
  useEffect(() => {
    if (formData.persona_id && personas.length > 0) {
      const selectedPersona = personas.find(p => p.id === formData.persona_id);
      if (selectedPersona) {
        const nameLower = selectedPersona.nome.toLowerCase();
        if (nameLower.includes('vendedor')) {
          setIsAccessPathRequired(true);
          setAccessPathType('Vendedor');
        } else if (nameLower.includes('supervisor')) {
          setIsAccessPathRequired(true);
          setAccessPathType('Supervisor');
        } else {
          setIsAccessPathRequired(false);
          setAccessPathType(null);
          // Optional: Clear access path if type changes? Keeping it might be safer for edits.
        }
      }
    } else {
        setIsAccessPathRequired(false);
        setAccessPathType(null);
    }
  }, [formData.persona_id, personas]);

  const handleSearchCommercial = async (search) => {
      if (!accessPathType || !search || search.length < 2) return;
      setLoadingSearch(true);
      const results = await searchCommercialEntities(accessPathType, search);
      setAccessPathOptions(results);
      setLoadingSearch(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.nome || !formData.email) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Nome e Email são obrigatórios.' });
        return;
    }

    if (isAccessPathRequired) {
        if (!formData.access_path) {
            toast({ variant: 'destructive', title: 'Erro', description: `Para o perfil de ${accessPathType}, é obrigatório vincular a um registro comercial.` });
            return;
        }
        
        // Validate existence in bd-cl
        const isValid = await validateCommercialEntity(accessPathType, formData.access_path);
        if (!isValid) {
            toast({ variant: 'destructive', title: 'Vínculo Inválido', description: `O ${accessPathType} "${formData.access_path}" não foi encontrado no banco de dados comercial (bd-cl).` });
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
        access_path: isAccessPathRequired ? formData.access_path : null
      };

      let result;
      if (isEditing) {
        result = await updateUsuario(id, payload);
      } else {
        result = await createUsuario(payload);
      }

      if (result) {
        navigate('/configuracoes/usuarios/usuarios');
      }
    } catch (error) {
      console.error('Erro no formulário:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Editar Usuário' : 'Novo Usuário'} - APoio</title>
      </Helmet>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</CardTitle>
            <CardDescription>Preencha os dados para criar ou editar um usuário do sistema de apoio.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            
            {/* DADOS BÁSICOS */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dados Básicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo <span className="text-red-500">*</span></Label>
                  <Input 
                    id="nome" 
                    value={formData.nome} 
                    onChange={(e) => handleChange('nome', e.target.value)} 
                    placeholder="Ex: João da Silva" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => handleChange('email', e.target.value)} 
                    placeholder="joao.silva@example.com" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input 
                    id="telefone" 
                    value={formData.telefone} 
                    onChange={(e) => handleChange('telefone', e.target.value)} 
                    placeholder="(11) 98765-4321" 
                  />
                </div>
              </div>
            </div>

            {/* PERFIL E ACESSO */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Persona e Acesso</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="persona">Persona (Função) <span className="text-red-500">*</span></Label>
                  <Select value={formData.persona_id} onValueChange={(val) => handleChange('persona_id', val)}>
                    <SelectTrigger><SelectValue placeholder="Selecione uma persona" /></SelectTrigger>
                    <SelectContent>
                      {personas.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">A persona define as permissões padrão.</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(val) => handleChange('status', val)}>
                    <SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* ACCESS PATH - CONDITIONAL */}
                {isAccessPathRequired && (
                    <div className="space-y-2 col-span-1 md:col-span-2 border p-4 rounded-md bg-blue-50/50">
                        <Label className="flex items-center gap-2 text-blue-800">
                            Vínculo Comercial ({accessPathType}) <span className="text-red-500">*</span>
                        </Label>
                        <p className="text-xs text-muted-foreground mb-2">
                            Este usuário será vinculado aos dados comerciais deste {accessPathType} no banco de dados (bd-cl).
                        </p>
                        
                        <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={isComboboxOpen}
                                    className="w-full justify-between"
                                >
                                    {formData.access_path || `Buscar ${accessPathType}...`}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0">
                                <Command shouldFilter={false}>
                                    <CommandInput 
                                        placeholder={`Digite o nome do ${accessPathType}...`} 
                                        onValueChange={handleSearchCommercial}
                                    />
                                    <CommandList>
                                        {loadingSearch && <CommandItem disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Buscando...</CommandItem>}
                                        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                                        <CommandGroup>
                                            {accessPathOptions.map((name) => (
                                                <CommandItem
                                                    key={name}
                                                    value={name}
                                                    onSelect={(currentValue) => {
                                                        handleChange('access_path', currentValue);
                                                        setIsComboboxOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            formData.access_path === name ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {formData.access_path && (
                            <p className="text-xs text-green-600 mt-1">
                                <Check className="inline h-3 w-3 mr-1"/> Vínculo selecionado: <strong>{formData.access_path}</strong>
                            </p>
                        )}
                    </div>
                )}
              </div>
            </div>

            {/* APROVAÇÕES */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Aprovações</h3>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="eh_aprovador" 
                  checked={formData.eh_aprovador} 
                  onCheckedChange={(checked) => handleChange('eh_aprovador', checked)} 
                />
                <Label htmlFor="eh_aprovador">Este usuário é um aprovador</Label>
              </div>
              {formData.eh_aprovador && <AprovacaoTypesGrid selectedTypes={{}} onTypeChange={() => {}} />}
            </div>

            {/* PERMISSÕES EXTRA */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Acesso a Módulos (Permissões Personalizadas)</h3>
              <p className="text-sm text-muted-foreground">Estas permissões sobrescrevem as da persona selecionada.</p>
              <PermissionsGrid permissions={{}} onPermissionChange={() => {}} />
            </div>

          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/configuracoes/usuarios/usuarios')}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar Usuário'}</Button>
          </CardFooter>
        </Card>
      </form>
    </>
  );
};

export default UsuarioForm;
