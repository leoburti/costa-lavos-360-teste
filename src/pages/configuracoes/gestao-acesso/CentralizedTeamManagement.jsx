import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Shield, Users, LayoutDashboard, RefreshCw, Download, Network, Activity, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Absolute imports to prevent path resolution errors
import UserAccessTable from '@/pages/configuracoes/gestao-acesso/UserAccessTable';
import AccessDashboard from '@/pages/configuracoes/gestao-acesso/AccessDashboard';
import SyncManager from '@/pages/configuracoes/gestao-acesso/SyncManager';
import TeamsManager from '@/pages/configuracoes/gestao-acesso/TeamsManager';
import PersonasTab from '@/pages/configuracoes/gestao-equipe/PersonasTab';
import SystemDiagnosisPage from '@/pages/configuracoes/SystemDiagnosisPage';
import UsersPermissionsPage from '@/pages/configuracoes/usuarios/UsersPermissionsPage';

const CentralizedTeamManagement = () => {
  const { toast } = useToast();
  const { userContext, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [personas, setPersonas] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users_unified')
        .select(`
            *,
            persona:apoio_personas(id, nome, permissoes, tipo_uso), 
            equipe:apoio_equipes!equipe_id(id, nome),
            supervisor:users_unified!supervisor_id(id, nome)
        `)
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
    if (!authLoading) {
        fetchData();
    }
  }, [authLoading]);

  const handleExportConfig = () => {
    const config = {
      timestamp: new Date().toISOString(),
      personas,
      users_summary: users.map(u => ({ 
          id: u.id, 
          email: u.email, 
          persona: u.persona_id, 
          level: u.nivel_acesso,
          team: u.equipe?.nome,
          supervisor: u.supervisor?.nome
      }))
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast({ title: 'Configuração exportada', description: 'O arquivo JSON foi baixado com sucesso.' });
  };

  const isAdmin = useMemo(() => {
    if (authLoading || !userContext) return false;
    const role = userContext.role?.toLowerCase() || '';
    return ['nivel 1', 'admin', 'nivel 5', 'nível 1', 'nível 5'].includes(role);
  }, [userContext, authLoading]);

  if (!authLoading && !isAdmin) {
      return (
          <div className="p-8 flex justify-center">
              <Alert variant="destructive" className="max-w-2xl">
                  <Lock className="h-4 w-4" />
                  <AlertTitle>Acesso Negado</AlertTitle>
                  <AlertDescription>
                      Este módulo é restrito a administradores. Por favor, contate o suporte se acredita que isso é um erro.
                  </AlertDescription>
              </Alert>
          </div>
      );
  }

  return (
    <div className="space-y-6 p-6">
      <Helmet>
        <title>Gestão de Equipe Centralizada | Configurações</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Gestão de Equipe & Acesso</h1>
          <p className="text-muted-foreground mt-1">
            Módulo centralizado para controle de usuários, personas, equipes e permissões.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportConfig}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={fetchData}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar Dados
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto p-1 bg-muted/50">
          <TabsTrigger value="users" className="flex items-center gap-2 py-2">
            <Users className="h-4 w-4" /> Usuários
          </TabsTrigger>
          <TabsTrigger value="personas" className="flex items-center gap-2 py-2">
            <Shield className="h-4 w-4" /> Personas
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2 py-2">
            <Network className="h-4 w-4" /> Equipes
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2 py-2">
            <Lock className="h-4 w-4" /> Permissões
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-2 py-2">
            <RefreshCw className="h-4 w-4" /> Sincronização
          </TabsTrigger>
          <TabsTrigger value="diagnosis" className="flex items-center gap-2 py-2">
            <Activity className="h-4 w-4" /> Diagnóstico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4 animate-in fade-in-50 duration-300">
          <AccessDashboard users={users} personas={personas} />
          <UserAccessTable users={users} personas={personas} onRefresh={fetchData} loading={loading} />
        </TabsContent>

        <TabsContent value="personas" className="space-y-4 animate-in fade-in-50 duration-300">
          <PersonasTab />
        </TabsContent>

        <TabsContent value="teams" className="space-y-4 animate-in fade-in-50 duration-300">
          <TeamsManager />
        </TabsContent>
        
        <TabsContent value="permissions" className="space-y-4 animate-in fade-in-50 duration-300">
          <UsersPermissionsPage />
        </TabsContent>
        
        <TabsContent value="sync" className="space-y-4 animate-in fade-in-50 duration-300">
          <SyncManager localUsers={users} onSyncComplete={fetchData} />
        </TabsContent>

        <TabsContent value="diagnosis" className="space-y-4 animate-in fade-in-50 duration-300">
          <div className="border rounded-lg p-4 bg-background">
             <SystemDiagnosisPage />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CentralizedTeamManagement;