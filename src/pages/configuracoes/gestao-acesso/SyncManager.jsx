import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useUsuarios } from '@/hooks/useUsuarios';

const SyncManager = ({ localUsers, onSyncComplete }) => {
  const { toast } = useToast();
  const { createUsuario } = useUsuarios();
  const [loading, setLoading] = useState(false);
  const [authUsers, setAuthUsers] = useState([]);
  const [discrepancies, setDiscrepancies] = useState([]);

  const fetchAuthUsers = async () => {
    setLoading(true);
    try {
      const { data: { users }, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;
      const activeUsers = users.filter(u => u.email.endsWith('@costalavos.com.br'));
      setAuthUsers(activeUsers || []);
      analyzeDiscrepancies(activeUsers || [], localUsers);
    } catch (error) {
      console.error("Error fetching auth users:", error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao buscar usuários de autenticação.' });
    } finally {
      setLoading(false);
    }
  };

  const analyzeDiscrepancies = (authList, localList) => {
    const issues = [];
    const localMap = new Map(localList.map(u => [u.email.toLowerCase(), u]));
    const authMap = new Map(authList.map(u => [u.email.toLowerCase(), u]));

    // Check Auth users missing in Local unified profile
    authList.forEach(au => {
      if (!localMap.has(au.email.toLowerCase())) {
        issues.push({
          type: 'missing_local',
          email: au.email,
          name: au.user_metadata?.full_name,
          auth_id: au.id,
          details: 'Usuário existe no Auth mas não no perfil unificado.'
        });
      }
    });

    // Check Local unified profiles missing in Auth
    localList.forEach(lu => {
      if (!authMap.has(lu.email.toLowerCase())) {
        issues.push({
          type: 'missing_auth',
          email: lu.email,
          name: lu.nome,
          details: 'Perfil unificado existe mas sem conta de login ativa.'
        });
      }
    });

    setDiscrepancies(issues);
  };

  useEffect(() => {
    if (localUsers.length > 0) {
      fetchAuthUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localUsers]);

  const handleSync = async (issue) => {
    setLoading(true);
    try {
      if (issue.type === 'missing_local') {
        const result = await createUsuario({
          id: issue.auth_id,
          email: issue.email,
          nome: issue.name || issue.email.split('@')[0],
          status: 'ativo',
          role: 'Vendedor' // Default role
        });
        if (result) {
            toast({ title: 'Sincronizado', description: `Perfil criado para ${issue.email}` });
        } else {
            throw new Error("Falha ao criar usuário no hook useUsuarios");
        }
      }
      onSyncComplete();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro na sincronização', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Usuários Auth</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{authUsers.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Perfis Unificados</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{localUsers.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Discrepâncias</CardTitle></CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${discrepancies.length > 0 ? 'text-amber-600' : 'text-green-600'}`}>
              {discrepancies.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Status de Sincronização</CardTitle>
              <CardDescription>Identifique e corrija inconsistências entre contas de login e perfis de sistema.</CardDescription>
            </div>
            <Button variant="outline" onClick={fetchAuthUsers} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Verificar Agora
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {discrepancies.length === 0 ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Tudo Sincronizado</AlertTitle>
              <AlertDescription className="text-green-700">
                Todos os usuários de autenticação possuem perfis unificados correspondentes.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Problema</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discrepancies.map((issue, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{issue.email}</TableCell>
                      <TableCell>{issue.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <span className="text-sm text-muted-foreground">{issue.details}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {issue.type === 'missing_local' && (
                          <Button size="sm" variant="secondary" onClick={() => handleSync(issue)} disabled={loading}>
                            Criar Perfil <ArrowRight className="ml-2 h-3 w-3" />
                          </Button>
                        )}
                        {issue.type === 'missing_auth' && (
                          <Badge variant="outline">Requer Convite Manual</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SyncManager;