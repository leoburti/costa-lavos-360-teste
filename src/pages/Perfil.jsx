
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Mail, Shield, Phone, Save } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

export default function Perfil() {
  const { user, forceRoleRefetch } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.user_metadata?.full_name || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        // Tenta obter a role de várias fontes possíveis
        role: user.user_metadata?.role || user.role || 'Usuário',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
        }
      });

      if (error) throw error;

      // Força atualização do contexto se necessário
      await forceRoleRefetch();

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
        variant: "default",
      });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao atualizar suas informações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Gera iniciais para o Avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <Helmet>
        <title>Meu Perfil | Costa Lavos 360</title>
      </Helmet>

      <PageHeader
        title="Meu Perfil"
        description="Gerencie suas informações pessoais e visualize suas credenciais."
        breadcrumbs={[
          { label: 'Configurações', path: '/configuracoes/geral' },
          { label: 'Perfil' }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna da Esquerda - Cartão de Resumo */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {getInitials(formData.fullName)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{formData.fullName || 'Usuário'}</CardTitle>
              <CardDescription>{formData.email}</CardDescription>
              <div className="mt-4 flex justify-center">
                <Badge variant="secondary" className="px-3 py-1">
                  <Shield className="w-3 h-3 mr-1" />
                  {formData.role}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" />
                  <span>ID: {user?.id?.slice(0, 8)}...</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4" />
                  <span>{formData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{formData.phone || 'Não informado'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna da Direita - Formulário de Edição */}
        <div className="md:col-span-2">
          <Card>
            <form onSubmit={handleSave}>
              <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
                <CardDescription>
                  Atualize suas informações básicas de identificação.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="Seu nome completo"
                      className="pl-9"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="pl-9 bg-muted"
                      title="O email não pode ser alterado diretamente."
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Para alterar seu email, entre em contato com o administrador do sistema.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone / Celular</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="(00) 00000-0000"
                      className="pl-9"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="justify-between border-t pt-6">
                <Button type="button" variant="ghost" onClick={() => window.history.back()}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
