import React from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { User, Lock, Bell } from 'lucide-react';

const PerfilPage = () => {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet><title>Meu Perfil | Costa Lavos</title></Helmet>
      
      <PageHeader 
        title="Meu Perfil" 
        description="Gerencie suas informações pessoais e preferências."
        breadcrumbs={[{ label: 'Configurações', path: '/configuracoes' }, { label: 'Perfil' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Avatar className="h-32 w-32 mb-4 border-4 border-white shadow-lg">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CL</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">Admin User</h2>
              <p className="text-sm text-muted-foreground">Administrador Geral</p>
              <Button className="w-full mt-6" variant="outline">Alterar Foto</Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="general">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="general"><User className="mr-2 h-4 w-4"/> Informações Gerais</TabsTrigger>
              <TabsTrigger value="security"><Lock className="mr-2 h-4 w-4"/> Segurança</TabsTrigger>
              <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4"/> Preferências</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <Card>
                <CardHeader><CardTitle>Dados Pessoais</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Nome Completo</Label><Input defaultValue="Admin User" /></div>
                    <div className="space-y-2"><Label>Email</Label><Input defaultValue="admin@costalavos.com" disabled /></div>
                    <div className="space-y-2"><Label>Telefone</Label><Input defaultValue="(11) 99999-9999" /></div>
                    <div className="space-y-2"><Label>Cargo</Label><Input defaultValue="Administrador" disabled /></div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end border-t pt-4">
                  <Button>Salvar Alterações</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader><CardTitle>Alterar Senha</CardTitle><CardDescription>Recomendamos usar uma senha forte.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label>Senha Atual</Label><Input type="password" /></div>
                  <div className="space-y-2"><Label>Nova Senha</Label><Input type="password" /></div>
                  <div className="space-y-2"><Label>Confirmar Nova Senha</Label><Input type="password" /></div>
                </CardContent>
                <CardFooter className="justify-end border-t pt-4">
                  <Button>Atualizar Senha</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PerfilPage;