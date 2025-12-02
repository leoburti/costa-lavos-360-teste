
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { ShieldCheck, UserCheck, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { isAdmin } from '@/utils/permissions';

const PermissionsGrid = ({ allPermissions, currentPermissions, onToggle }) => {
  // Group permissions by module if available, otherwise flat list
  const groupedPermissions = allPermissions.reduce((acc, p) => {
    const moduleName = p.modulo || 'Geral';
    acc[moduleName] = acc[moduleName] || [];
    acc[moduleName].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(groupedPermissions).map(([modulo, permissoes]) => (
        <Card key={modulo}>
          <CardHeader>
            <CardTitle className="text-lg capitalize">{modulo.replace(/_/g, ' ')}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {permissoes.map(p => (
              <Button
                key={p.id}
                variant={currentPermissions[p.nome] ? "default" : "outline"}
                onClick={() => onToggle(p.nome)}
                className="justify-start text-left h-auto py-2"
              >
                <div className="flex items-center">
                  <div className="mr-2">
                    {currentPermissions[p.nome] ? <ShieldCheck className="h-4 w-4" /> : <UserCheck className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div>
                    <p className="font-semibold">{p.acao || p.nome}</p>
                    <p className="text-xs text-muted-foreground">{p.descricao}</p>
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const UsersPermissionsPage = () => {
  const { toast } = useToast();
  const { userContext } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [currentPermissions, setCurrentPermissions] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);

  // Debug logging to help diagnose access issues
  useEffect(() => {
    if (userContext) {
      const isUserAdmin = isAdmin(userContext);
      console.group('🔒 UsersPermissionsPage Access Check');
      console.log('User Context:', userContext);
      console.log('User Role:', userContext.role);
      console.log('Is Admin Check:', isUserAdmin);
      console.groupEnd();
    }
  }, [userContext]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('apoio_personas')
        .select('*')
        .order('nome');
        
      if (profilesError) throw profilesError;
      setProfiles(profilesData || []);

      // Fetch permissions - defaulting to a mock list if the table doesn't exist yet
      // In production this should fetch from 'apoio_permissoes' or similar
      const mockPermissions = [
        { id: 1, nome: 'comodato_ler', acao: 'Ler', modulo: 'Comodato', descricao: 'Visualizar dados de comodato' },
        { id: 2, nome: 'comodato_editar', acao: 'Editar', modulo: 'Comodato', descricao: 'Editar dados de comodato' },
        { id: 3, nome: 'agenda_ler', acao: 'Ler', modulo: 'Agenda', descricao: 'Visualizar agenda' },
        { id: 4, nome: 'agenda_editar', acao: 'Editar', modulo: 'Agenda', descricao: 'Gerenciar agenda' },
        { id: 5, nome: 'chamados_ler', acao: 'Ler', modulo: 'Chamados', descricao: 'Visualizar chamados' },
        { id: 6, nome: 'chamados_criar', acao: 'Criar', modulo: 'Chamados', descricao: 'Abrir novos chamados' },
        { id: 7, nome: 'analitico_vendas', acao: 'Visualizar', modulo: 'Analytics', descricao: 'Acesso a dados de vendas' },
        { id: 8, nome: 'analitico_churn', acao: 'Visualizar', modulo: 'Analytics', descricao: 'Relatórios de Churn' },
        { id: 9, nome: 'config_usuarios', acao: 'Gerenciar', modulo: 'Configurações', descricao: 'Gerenciar usuários e acessos' },
      ];
      setAllPermissions(mockPermissions);

    } catch (error) {
      console.error("Error fetching permissions data:", error);
      toast({ variant: 'destructive', title: 'Erro ao buscar dados', description: error.message });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // Only fetch data if user is admin
    if (isAdmin(userContext)) {
      fetchData();
    }
  }, [fetchData, userContext]);

  useEffect(() => {
    if (selectedProfileId) {
      const profile = profiles.find(p => p.id === selectedProfileId);
      // 'permissoes' column in 'apoio_personas' is jsonb
      setCurrentPermissions(profile?.permissoes || {});
      setHasChanges(false);
    }
  }, [selectedProfileId, profiles]);

  const handleTogglePermission = (permissionName) => {
    setCurrentPermissions(prev => {
      const newPerms = { ...prev };
      if (newPerms[permissionName]) {
        delete newPerms[permissionName];
      } else {
        newPerms[permissionName] = true;
      }
      return newPerms;
    });
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedProfileId) return;

    setLoading(true);
    const { error } = await supabase
      .from('apoio_personas')
      .update({ permissoes: currentPermissions })
      .eq('id', selectedProfileId);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: error.message });
    } else {
      toast({ title: 'Sucesso', description: 'Permissões do perfil salvas.' });
      setHasChanges(false);
      // Refresh data to ensure sync
      const { data: profilesData } = await supabase.from('apoio_personas').select('*').order('nome');
      if (profilesData) setProfiles(profilesData);
    }
    setLoading(false);
  };
  
  // Robust admin check using the utility
  if (!isAdmin(userContext)) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <div className="bg-red-100 p-4 rounded-full mb-4">
                <Lock className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Acesso Restrito</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-md">
                Esta página é restrita a administradores. Seu perfil atual não possui as permissões necessárias para gerenciar controles de acesso.
            </p>
            {/* Debug Info for Developer */}
            <div className="mt-6 text-xs font-mono text-muted-foreground bg-white p-3 rounded border border-slate-200">
                <p>Current Role: <span className="font-bold text-slate-800">{userContext?.role || 'N/A'}</span></p>
                <p>User ID: {userContext?.id}</p>
            </div>
        </div>
      );
  }

  return (
    <>
      <Helmet>
        <title>Permissões por Perfil | Costa Lavos 360</title>
      </Helmet>
      <div className="space-y-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Matriz de Permissões por Perfil</CardTitle>
                <CardDescription>Gerencie as capacidades de cada persona do sistema.</CardDescription>
              </div>
              <div className="flex gap-2 items-center w-full sm:w-auto">
                <Select onValueChange={setSelectedProfileId} value={selectedProfileId || ''}>
                  <SelectTrigger className="w-full sm:w-[250px]">
                    <SelectValue placeholder="Selecione uma persona..." />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map(p => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleSaveChanges} 
                  disabled={!hasChanges || loading || !selectedProfileId}
                  className={hasChanges ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading && !profiles.length ? (
              <div className="flex justify-center py-12">
                 <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            ) : selectedProfileId ? (
              <PermissionsGrid
                allPermissions={allPermissions}
                currentPermissions={currentPermissions}
                onToggle={handleTogglePermission}
              />
            ) : (
              <div className="text-center py-16 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                <ShieldCheck className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                <p className="font-medium text-slate-600">Nenhum perfil selecionado</p>
                <p className="text-sm mt-1">Selecione uma persona no menu acima para visualizar e editar suas permissões.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default UsersPermissionsPage;
