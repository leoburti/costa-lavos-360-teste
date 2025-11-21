import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import ConfiguracaoGrupo from '@/components/ConfiguracaoGrupo';
import ConfiguracaoInput from '@/components/ConfiguracaoInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save } from 'lucide-react';

const PerfilUsuarioPage = () => {
  const { user, forceRoleRefetch } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    data_nascimento: '',
    genero: '',
    bio: '',
    idioma: 'pt-BR',
    fuso: 'America/Sao_Paulo',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.user_metadata?.full_name || '',
        email: user.email || '',
        telefone: user.user_metadata?.phone || '',
        data_nascimento: user.user_metadata?.birthdate || '',
        genero: user.user_metadata?.gender || '',
        bio: user.user_metadata?.bio || '',
        idioma: user.user_metadata?.language || 'pt-BR',
        fuso: user.user_metadata?.timezone || 'America/Sao_Paulo',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.nome,
          phone: formData.telefone,
          birthdate: formData.data_nascimento,
          gender: formData.genero,
          bio: formData.bio,
          language: formData.idioma,
          timezone: formData.fuso,
        }
      });

      if (error) throw error;

      await forceRoleRefetch();
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Perfil - Configurações</title></Helmet>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Perfil do Usuário</h2>
                <p className="text-muted-foreground">Gerencie suas informações pessoais e preferências.</p>
            </div>
            <Button onClick={handleSave} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Salvar Alterações
            </Button>
        </div>

        <ConfiguracaoGrupo
          titulo="Informações Pessoais"
          descricao="Dados básicos do seu perfil visíveis para a equipe."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ConfiguracaoInput
                label="Nome Completo"
                id="nome"
                name="nome"
                valor={formData.nome}
                onChange={handleChange}
              />
              <ConfiguracaoInput
                label="Email"
                id="email"
                name="email"
                valor={formData.email}
                disabled
                descricao="O email não pode ser alterado diretamente."
              />
              <ConfiguracaoInput
                label="Telefone"
                id="telefone"
                name="telefone"
                valor={formData.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
              />
              <ConfiguracaoInput
                label="Data de Nascimento"
                id="data_nascimento"
                name="data_nascimento"
                tipo="date"
                valor={formData.data_nascimento}
                onChange={handleChange}
              />
              <div className="space-y-2">
                <Label htmlFor="genero">Gênero</Label>
                <Select value={formData.genero} onValueChange={(value) => setFormData(prev => ({ ...prev, genero: value }))}>
                  <SelectTrigger id="genero">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="nao_informar">Prefiro não informar</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Biografia</Label>
            <Textarea 
                id="bio" 
                name="bio" 
                value={formData.bio} 
                onChange={handleChange} 
                placeholder="Conte um pouco sobre você..."
                className="h-24"
            />
            <p className="text-xs text-muted-foreground">Uma breve descrição sobre sua função ou interesses.</p>
          </div>
        </ConfiguracaoGrupo>

        <ConfiguracaoGrupo
          titulo="Preferências Regionais"
          descricao="Ajuste o idioma e fuso horário para sua experiência."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idioma">Idioma</Label>
                <Select value={formData.idioma} onValueChange={(value) => setFormData(prev => ({ ...prev, idioma: value }))}>
                  <SelectTrigger id="idioma">
                    <SelectValue placeholder="Selecione o idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (USA)</SelectItem>
                    <SelectItem value="es-ES">Español (España)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuso">Fuso Horário</Label>
                <Select value={formData.fuso} onValueChange={(value) => setFormData(prev => ({ ...prev, fuso: value }))}>
                  <SelectTrigger id="fuso">
                    <SelectValue placeholder="Selecione o fuso horário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">São Paulo (UTC-3)</SelectItem>
                    <SelectItem value="America/New_York">Nova York (UTC-5)</SelectItem>
                    <SelectItem value="Europe/London">Londres (UTC+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
          </div>
        </ConfiguracaoGrupo>
      </div>
    </>
  );
};

export default PerfilUsuarioPage;