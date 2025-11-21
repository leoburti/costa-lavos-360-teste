import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AcessosMatriz from './AcessosMatriz';

const AcessosPage = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários com Acesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Total de usuários com alguma permissão</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Módulo Mais Acessado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Chamados</div>
            <p className="text-xs text-muted-foreground">Módulo com mais permissões concedidas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permissão Mais Comum</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ler</div>
            <p className="text-xs text-muted-foreground">Permissão mais concedida entre todos os módulos</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Matriz de Acessos</CardTitle>
          <CardDescription>
            Visualize e gerencie as permissões de todos os usuários em uma única tela.
          </CardDescription>
          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <Input placeholder="Buscar por nome ou email..." className="max-w-sm" />
            <Select><SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Filtrar por Perfil" /></SelectTrigger><SelectContent><SelectItem value="admin">Admin</SelectItem></SelectContent></Select>
            <Select><SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Filtrar por Módulo" /></SelectTrigger><SelectContent><SelectItem value="comodato">Comodato</SelectItem></SelectContent></Select>
          </div>
        </CardHeader>
        <CardContent>
          <AcessosMatriz />
        </CardContent>
      </Card>
    </div>
  );
};

export default AcessosPage;