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
import { supabase } from '@/lib/customSupabaseClient';

const UsuarioForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);
  const { fetchPersonas } = usePersonas();
  
  const [personas, setPersonas] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    perfil: '', // Legacy field, kept for compatibility
    persona_id: '',
    status: 'ativo',
    eh_aprovador: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const personasData = await fetchPersonas();
      setPersonas(personasData || []);

      if (isEditing) {
        setLoading(true);
        const { data, error } = await supabase
          .from('apoio_usuarios')
          .select('*')
          .eq('id', id)
          .single();
        
        if (data) {
          setFormData({
            nome: data.nome || '',
            email: data.email || '',
            telefone: data.telefone || '',
            perfil: data.perfil_id || '', // Assuming perfil_id maps to legacy profile
            persona_id: data.persona_id || '',
            status: data.status || 'ativo',
            eh_aprovador: data.eh_aprovador || false
          });
        }
        setLoading(false);
      }
    };
    loadData();
  }, [id, isEditing, fetchPersonas]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        persona_id: formData.persona_id || null,
        status: formData.status,
        eh_aprovador: formData.eh_aprovador,
        // perfil_id: formData.perfil // Optional: keep syncing if needed
      };

      let error;
      if (isEditing) {
        const { error: updateError } = await supabase
          .from('apoio_usuarios')
          .update(payload)
          .eq('id', id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('apoio_usuarios')
          .insert(payload);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: `Usuário ${isEditing ? 'atualizado' : 'criado'} com sucesso!`,
        description: "As alterações foram salvas.",
      });
      navigate('/configuracoes/usuarios/usuarios');
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível salvar o usuário. Verifique os dados.',
      });
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
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dados Básicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input 
                    id="nome" 
                    value={formData.nome} 
                    onChange={(e) => handleChange('nome', e.target.value)} 
                    placeholder="Ex: João da Silva" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
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

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Persona e Acesso</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="persona">Persona (Função)</Label>
                  <Select value={formData.persona_id} onValueChange={(val) => handleChange('persona_id', val)}>
                    <SelectTrigger><SelectValue placeholder="Selecione uma persona" /></SelectTrigger>
                    <SelectContent>
                      {personas.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">A persona define as permissões padrão do usuário.</p>
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
              </div>
            </div>

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