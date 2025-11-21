import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { usePersonas } from '@/hooks/usePersonas';
import { Loader2, Save, ArrowLeft } from 'lucide-react';

const PersonaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPersonaById, savePersona, loading } = usePersonas();
  
  const [formData, setFormData] = useState({
    nome: '',
    tipo_uso: 'Suporte',
    descricao: '',
    ativo: true,
    permissoes: {
      apoio: { ler: true, escrever: false, admin: false },
      manutencao: { ler: true, escrever: false, admin: false },
      agenda: { ler: true, escrever: false },
      relatorios: { ler: true }
    },
    atributos: {
      prioridade_acesso: 'media',
      funcionalidades_extras: []
    }
  });

  useEffect(() => {
    if (id) {
      loadPersona();
    }
  }, [id]);

  const loadPersona = async () => {
    const data = await getPersonaById(id);
    if (data) {
      setFormData({
        ...data,
        permissoes: data.permissoes || formData.permissoes,
        atributos: data.atributos || formData.atributos
      });
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePermissionChange = (module, action, checked) => {
    setFormData(prev => ({
      ...prev,
      permissoes: {
        ...prev.permissoes,
        [module]: {
          ...prev.permissoes[module],
          [action]: checked
        }
      }
    }));
  };

  const handleAttributeChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      atributos: {
        ...prev.atributos,
        [key]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await savePersona(formData);
    if (result) {
      navigate('/admin/apoio/personas');
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/apoio/personas')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{id ? 'Editar Persona' : 'Nova Persona'}</h1>
          <p className="text-muted-foreground">Configure os detalhes e permissões da persona.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Persona</Label>
                <Input 
                  id="nome" 
                  value={formData.nome} 
                  onChange={(e) => handleChange('nome', e.target.value)} 
                  placeholder="Ex: Técnico de Campo N1" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo_uso">Tipo de Uso</Label>
                <Select value={formData.tipo_uso} onValueChange={(val) => handleChange('tipo_uso', val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Suporte">Suporte</SelectItem>
                    <SelectItem value="Técnico">Técnico</SelectItem>
                    <SelectItem value="Gerente">Gerente</SelectItem>
                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea 
                id="descricao" 
                value={formData.descricao} 
                onChange={(e) => handleChange('descricao', e.target.value)} 
                placeholder="Descreva o propósito desta persona..." 
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="ativo" 
                checked={formData.ativo} 
                onCheckedChange={(checked) => handleChange('ativo', checked)} 
              />
              <Label htmlFor="ativo">Ativo</Label>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Permissões e Acessos</CardTitle>
            <CardDescription>Defina o que esta persona pode fazer em cada módulo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Módulo Apoio */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Módulo Apoio (Geral)</h3>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="apoio_ler" 
                    checked={formData.permissoes?.apoio?.ler} 
                    onCheckedChange={(c) => handlePermissionChange('apoio', 'ler', c)} 
                  />
                  <Label htmlFor="apoio_ler">Visualizar</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="apoio_escrever" 
                    checked={formData.permissoes?.apoio?.escrever} 
                    onCheckedChange={(c) => handlePermissionChange('apoio', 'escrever', c)} 
                  />
                  <Label htmlFor="apoio_escrever">Editar/Criar</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="apoio_admin" 
                    checked={formData.permissoes?.apoio?.admin} 
                    onCheckedChange={(c) => handlePermissionChange('apoio', 'admin', c)} 
                  />
                  <Label htmlFor="apoio_admin">Administrar</Label>
                </div>
              </div>
            </div>

            {/* Módulo Manutenção */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Manutenção de Equipamentos</h3>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="manut_ler" 
                    checked={formData.permissoes?.manutencao?.ler} 
                    onCheckedChange={(c) => handlePermissionChange('manutencao', 'ler', c)} 
                  />
                  <Label htmlFor="manut_ler">Visualizar</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="manut_escrever" 
                    checked={formData.permissoes?.manutencao?.escrever} 
                    onCheckedChange={(c) => handlePermissionChange('manutencao', 'escrever', c)} 
                  />
                  <Label htmlFor="manut_escrever">Executar Manutenção</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="manut_admin" 
                    checked={formData.permissoes?.manutencao?.admin} 
                    onCheckedChange={(c) => handlePermissionChange('manutencao', 'admin', c)} 
                  />
                  <Label htmlFor="manut_admin">Gerenciar Catálogo</Label>
                </div>
              </div>
            </div>

            {/* Atributos Extras */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Atributos de Acesso</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prioridade de Acesso</Label>
                  <Select 
                    value={formData.atributos?.prioridade_acesso} 
                    onValueChange={(val) => handleAttributeChange('prioridade_acesso', val)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="critica">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/apoio/personas')}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Salvar Persona
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default PersonaForm;