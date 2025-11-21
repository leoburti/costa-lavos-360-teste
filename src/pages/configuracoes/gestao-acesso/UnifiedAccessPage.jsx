import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Shield, Users, LayoutDashboard, RefreshCw, Download, Network } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

import UserAccessTable from './UserAccessTable';
import AccessDashboard from './AccessDashboard';
import PermissionMatrix from './PermissionMatrix';
import SyncManager from './SyncManager';
import TeamsManager from './TeamsManager';

const UnifiedAccessPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [personas, setPersonas] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users with explicit relationship to avoid ambiguity
      // Using !fk_usuarios_equipe to specify the relationship for 'equipe'
      const { data: usersData, error: usersError } = await supabase
        .from('apoio_usuarios')
        .select('*, persona:apoio_personas(id, nome, permissoes), equipe:apoio_equipes!fk_usuarios_equipe(nome)')
        .order('nome');

      if (usersError) throw usersError;

      const { data: personasData, error: personasError } = await supabase
        .from('apoio_personas')
        .select('*')
        .order('nome');

      if (personasError) throw personasError;

      setUsers(usersData || []);
      setPersonas(personasData || []);
    } catch (error) {
      console.error("Error fetching access data:", error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar dados',
        description: error.message || 'Verifique as permissões e tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportConfig = () => {
    const config = {
      timestamp: new Date().toISOString(),
      personas,
      users_summary: users.map(u => ({ id: u.id, email: u.email, persona: u.persona_id, level: u.nivel_acesso }))
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `access-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast({ title: 'Configuração exportada', description: 'O arquivo JSON foi baixado com sucesso.' });
  };

  return (
    <div className="space-y-6 p-6">
      <Helmet>
        <title>Gestão de Acesso Unificada | Configurações</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Acesso Unificada</h1>
          <p className="text-muted-foreground">
            Controle centralizado de usuários, equipes, personas e permissões granulares.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportConfig}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Config
          </Button>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:w-[750px]">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Usuários
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Network className="h-4 w-4" /> Equipes
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="matrix" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Matriz
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Sincronização
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UserAccessTable users={users} personas={personas} onRefresh={fetchData} loading={loading} />
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <TeamsManager />
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <AccessDashboard users={users} personas={personas} />
        </TabsContent>

        <TabsContent value="matrix" className="space-y-4">
          <PermissionMatrix personas={personas} onRefresh={fetchData} />
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <SyncManager localUsers={users} onSyncComplete={fetchData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedAccessPage;