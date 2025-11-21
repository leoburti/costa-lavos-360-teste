import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  Shield, 
  Database, 
  RefreshCw 
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

const SystemDiagnosisPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    authUsers: [],
    apoioUsers: [],
    personas: [],
    roles: [],
    analysis: {
      authOnly: [],
      apoioOnly: [],
      synced: [],
      inconsistentRoles: []
    }
  });

  const operationalModules = [
    {
      name: "Analytics",
      submodules: ["Supervisor", "Vendedor", "Região", "Grupo Clientes", "Produto", "Visão 360"]
    },
    {
      name: "Comercial",
      submodules: ["Vendas Diárias", "Churn", "Curva ABC", "RFM", "Tendência", "Valor Unitário"]
    },
    {
      name: "Equipamentos",
      submodules: ["Movimentação", "Por Cliente", "Por Equipamento", "Em Campo"]
    },
    {
      name: "CRM",
      submodules: ["Pipeline", "Contatos", "Contratos", "Relatórios"]
    },
    {
      name: "Delivery",
      submodules: ["Dashboard", "Entregas", "Motoristas", "Rotas"]
    },
    {
      name: "Apoio (Operacional)",
      submodules: ["Comodato", "Chamados", "Agenda", "Geolocalização", "Relatórios"]
    },
    {
      name: "Gestão de Equipe",
      submodules: ["Usuários & Acesso"]
    }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Auth Users via RPC
      const { data: authUsers, error: authError } = await supabase.rpc('get_all_users_with_roles');
      if (authError) throw authError;

      // 2. Fetch Apoio Users
      const { data: apoioUsers, error: apoioError } = await supabase
        .from('apoio_usuarios')
        .select(`
          *,
          persona:apoio_personas(id, nome)
        `);
      if (apoioError) throw apoioError;

      // 3. Fetch Personas
      const { data: personas, error: personasError } = await supabase
        .from('apoio_personas')
        .select('*');
      if (personasError) throw personasError;

      // 4. Analyze Data
      const authMap = new Map(authUsers.map(u => [u.email.toLowerCase(), u]));
      const apoioMap = new Map(apoioUsers.map(u => [u.email.toLowerCase(), u]));

      const authOnly = authUsers.filter(u => !apoioMap.has(u.email.toLowerCase()));
      const apoioOnly = apoioUsers.filter(u => !authMap.has(u.email.toLowerCase()));
      
      const synced = [];
      const inconsistentRoles = [];

      authUsers.forEach(authUser => {
        const apoioUser = apoioMap.get(authUser.email.toLowerCase());
        if (apoioUser) {
          synced.push({ auth: authUser, apoio: apoioUser });
          
          // Check for role inconsistencies (Basic check)
          // Mapping logic: Nivel 1 -> Admin, etc.
          // This is a heuristic check
          const authRole = authUser.role?.toLowerCase();
          const apoioPersona = apoioUser.persona?.nome?.toLowerCase();
          
          // Simple mismatch detection (can be refined)
          if (authRole && apoioPersona && !authRole.includes(apoioPersona) && !apoioPersona.includes(authRole)) {
             // Ignore common mismatches that are actually fine or generic
             if (authRole !== 'sem permissão') {
                 inconsistentRoles.push({ 
                   email: authUser.email, 
                   authRole: authUser.role, 
                   apoioPersona: apoioUser.persona?.nome || 'Sem Persona' 
                 });
             }
          }
        }
      });

      setData({
        authUsers,
        apoioUsers,
        personas,
        analysis: {
          authOnly,
          apoioOnly,
          synced,
          inconsistentRoles
        }
      });

    } catch (error) {
      console.error("Diagnosis Error:", error);
      toast({
        variant: 'destructive',
        title: 'Erro no diagnóstico',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExport = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      system_structure: {
        modules: operationalModules,
        personas: data.personas
      },
      diagnosis: {
        total_auth_users: data.authUsers.length,
        total_apoio_users: data.apoioUsers.length,
        orphaned_auth_users: data.analysis.authOnly.map(u => u.email),
        orphaned_apoio_users: data.analysis.apoioOnly.map(u => u.email),
        inconsistent_roles: data.analysis.inconsistentRoles
      },
      raw_data: {
        auth_users: data.authUsers,
        apoio_users: data.apoioUsers
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostico-sistema-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Executando diagnóstico do sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Helmet>
        <title>Diagnóstico do Sistema | Configurações</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Diagnóstico Estrutural</h1>
          <p className="text-muted-foreground">
            Análise completa de usuários, permissões e integridade do sistema.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Usuários Auth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.authUsers.length}</div>
            <p className="text-xs text-muted-foreground">Contas de login (Supabase)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Usuários Apoio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.apoioUsers.length}</div>
            <p className="text-xs text-muted-foreground">Perfis internos do sistema</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sincronizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.analysis.synced.length}</div>
            <p className="text-xs text-muted-foreground">Contas vinculadas corretamente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inconsistências</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {data.analysis.authOnly.length + data.analysis.apoioOnly.length}
            </div>
            <p className="text-xs text-muted-foreground">Registros órfãos detectados</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts for Issues */}
      {(data.analysis.authOnly.length > 0 || data.analysis.apoioOnly.length > 0) && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atenção Necessária</AlertTitle>
          <AlertDescription>
            Foram detectados {data.analysis.authOnly.length} usuários no Auth sem perfil no Apoio, e {data.analysis.apoioOnly.length} perfis no Apoio sem conta Auth correspondente.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Análise de Usuários</TabsTrigger>
          <TabsTrigger value="structure">Estrutura & Módulos</TabsTrigger>
          <TabsTrigger value="personas">Personas & Regras</TabsTrigger>
          <TabsTrigger value="raw">Dados Brutos</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status de Sincronização</CardTitle>
              <CardDescription>Comparativo entre tabela de autenticação e tabela de usuários do sistema.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Nome (Auth)</TableHead>
                    <TableHead>Nome (Apoio)</TableHead>
                    <TableHead>Role (Auth)</TableHead>
                    <TableHead>Persona (Apoio)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Synced Users */}
                  {data.analysis.synced.map((item, idx) => (
                    <TableRow key={`synced-${idx}`}>
                      <TableCell className="font-medium">{item.auth.email}</TableCell>
                      <TableCell>{item.auth.full_name}</TableCell>
                      <TableCell>{item.apoio.nome}</TableCell>
                      <TableCell><Badge variant="outline">{item.auth.role}</Badge></TableCell>
                      <TableCell><Badge variant="outline" className="bg-blue-50">{item.apoio.persona?.nome || '-'}</Badge></TableCell>
                      <TableCell><Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-100">Sincronizado</Badge></TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Auth Only (Missing in Apoio) */}
                  {data.analysis.authOnly.map((item, idx) => (
                    <TableRow key={`auth-${idx}`}>
                      <TableCell className="font-medium">{item.email}</TableCell>
                      <TableCell>{item.full_name}</TableCell>
                      <TableCell className="text-muted-foreground italic">Não encontrado</TableCell>
                      <TableCell><Badge variant="outline">{item.role}</Badge></TableCell>
                      <TableCell>-</TableCell>
                      <TableCell><Badge variant="destructive">Falta Perfil Apoio</Badge></TableCell>
                    </TableRow>
                  ))}

                  {/* Apoio Only (Missing in Auth) */}
                  {data.analysis.apoioOnly.map((item, idx) => (
                    <TableRow key={`apoio-${idx}`}>
                      <TableCell className="font-medium">{item.email}</TableCell>
                      <TableCell className="text-muted-foreground italic">Não encontrado</TableCell>
                      <TableCell>{item.nome}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell><Badge variant="outline" className="bg-blue-50">{item.persona?.nome || '-'}</Badge></TableCell>
                      <TableCell><Badge variant="warning" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Falta Conta Auth</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {operationalModules.map((module, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    {module.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {module.submodules.map((sub, sIdx) => (
                      <Badge key={sIdx} variant="secondary">{sub}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="personas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personas Definidas</CardTitle>
              <CardDescription>Configurações de acesso baseadas em personas (apoio_personas).</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome da Persona</TableHead>
                    <TableHead>Tipo de Uso</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.personas.map((persona) => (
                    <TableRow key={persona.id}>
                      <TableCell className="font-medium">{persona.nome}</TableCell>
                      <TableCell>{persona.tipo_uso}</TableCell>
                      <TableCell>{persona.descricao || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={persona.ativo ? 'default' : 'secondary'}>
                          {persona.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.personas.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        Nenhuma persona encontrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="raw">
          <Card>
            <CardHeader>
              <CardTitle>Dados Brutos (JSON)</CardTitle>
              <CardDescription>Visualização técnica dos dados recuperados para depuração.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] w-full rounded-md border p-4 bg-muted/50">
                <pre className="text-xs font-mono">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemDiagnosisPage;