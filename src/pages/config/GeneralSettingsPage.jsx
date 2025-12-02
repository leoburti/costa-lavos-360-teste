import React from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const GeneralSettingsPage = () => {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet><title>Configurações Gerais | Costa Lavos</title></Helmet>
      
      <PageHeader 
        title="Configurações Gerais" 
        description="Ajustes globais do sistema, empresa e segurança."
        breadcrumbs={[{ label: 'Configurações', path: '/configuracoes' }, { label: 'Geral' }]}
      />

      <Tabs defaultValue="company" className="w-full">
        <TabsList>
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="integrations">Integrações Globais</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados da Empresa</CardTitle>
              <CardDescription>Informações exibidas em relatórios e emails.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nome da Empresa</Label><Input defaultValue="Costa Lavos Ltda" /></div>
                <div className="space-y-2"><Label>CNPJ</Label><Input defaultValue="00.000.000/0001-00" /></div>
                <div className="col-span-2 space-y-2"><Label>Endereço</Label><Input defaultValue="Rua Exemplo, 123 - São Paulo/SP" /></div>
              </div>
              <Button>Salvar Dados</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Políticas de Segurança</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5"><Label>Autenticação de Dois Fatores (2FA)</Label><p className="text-sm text-muted-foreground">Forçar 2FA para todos os administradores.</p></div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5"><Label>Expiração de Sessão</Label><p className="text-sm text-muted-foreground">Deslogar automaticamente após inatividade.</p></div>
                <SelectWrapper defaultValue="30" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper to avoid importing Select just for one mock field
const SelectWrapper = () => <Input className="w-32" type="number" defaultValue="30" />;

export default GeneralSettingsPage;