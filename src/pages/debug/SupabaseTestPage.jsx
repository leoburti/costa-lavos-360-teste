import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, RefreshCw, Database, Server, FileJson } from 'lucide-react';

const StatusIcon = ({ status }) => {
  if (status === 'running') return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
  if (status === 'success') return <CheckCircle className="h-5 w-5 text-green-500" />;
  if (status === 'error') return <XCircle className="h-5 w-5 text-red-500" />;
  return <div className="h-5 w-5 rounded-full border-2 border-gray-200" />;
};

const SupabaseTestPage = () => {
  const [tests, setTests] = useState({
    connection: { status: 'pending', message: '' },
    count: { status: 'pending', data: null, error: null },
    select: { status: 'pending', data: null, error: null }
  });

  const runTests = async () => {
    setTests({
      connection: { status: 'running', message: 'Verificando sessão...' },
      count: { status: 'pending', data: null, error: null },
      select: { status: 'pending', data: null, error: null }
    });

    // 1. Connection/Auth Test
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      setTests(prev => ({ 
        ...prev, 
        connection: { 
          status: 'success', 
          message: session ? `Conectado como: ${session.user.email}` : 'Conectado (Anônimo/Sem sessão ativa)' 
        } 
      }));
    } catch (err) {
      setTests(prev => ({ 
        ...prev, 
        connection: { status: 'error', message: err.message || 'Erro desconhecido ao verificar sessão' } 
      }));
    }

    // 2. Count Test (bd-cl)
    setTests(prev => ({ ...prev, count: { status: 'running' } }));
    try {
      const { count, error } = await supabase
        .from('bd-cl')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      
      setTests(prev => ({ 
        ...prev, 
        count: { status: 'success', data: count } 
      }));
    } catch (err) {
      setTests(prev => ({ 
        ...prev, 
        count: { status: 'error', error: err.message || 'Erro ao contar registros' } 
      }));
    }

    // 3. Select Single Record Test (bd-cl)
    setTests(prev => ({ ...prev, select: { status: 'running' } }));
    try {
      const { data, error } = await supabase
        .from('bd-cl')
        .select('*')
        .limit(1);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setTests(prev => ({ 
          ...prev, 
          select: { status: 'success', data: data[0] } 
        }));
      } else {
        setTests(prev => ({ 
          ...prev, 
          select: { status: 'error', error: 'Nenhum registro retornado (Tabela vazia?)' } 
        }));
      }
    } catch (err) {
      setTests(prev => ({ 
        ...prev, 
        select: { status: 'error', error: err.message || 'Erro ao buscar registro' } 
      }));
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Teste de Conectividade Supabase</h1>
          <p className="text-muted-foreground mt-1">Diagnóstico direto da tabela 'bd-cl'</p>
        </div>
        <Button onClick={runTests} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Recarregar Testes
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Card 1: Conexão */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <Server className="h-5 w-5 text-slate-500" />
                Status da Conexão
              </CardTitle>
              <CardDescription>Verifica se o cliente Supabase consegue autenticar/conectar.</CardDescription>
            </div>
            <StatusIcon status={tests.connection.status} />
          </CardHeader>
          <CardContent>
            {tests.connection.status === 'success' && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <AlertTitle>Sucesso</AlertTitle>
                <AlertDescription>{tests.connection.message}</AlertDescription>
              </Alert>
            )}
            {tests.connection.status === 'error' && (
              <Alert variant="destructive">
                <AlertTitle>Falha</AlertTitle>
                <AlertDescription>{tests.connection.message}</AlertDescription>
              </Alert>
            )}
            {tests.connection.status === 'running' && <p className="text-sm text-muted-foreground">Conectando...</p>}
          </CardContent>
        </Card>

        {/* Card 2: Count */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5 text-slate-500" />
                Contagem de Registros (bd-cl)
              </CardTitle>
              <CardDescription>Executa SELECT COUNT(*) na tabela principal.</CardDescription>
            </div>
            <StatusIcon status={tests.count.status} />
          </CardHeader>
          <CardContent>
            {tests.count.status === 'success' && (
              <div className="text-2xl font-bold text-slate-900">
                {tests.count.data?.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">registros encontrados</span>
              </div>
            )}
            {tests.count.status === 'error' && (
              <Alert variant="destructive">
                <AlertTitle>Erro na Query</AlertTitle>
                <AlertDescription className="font-mono text-xs">{tests.count.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Card 3: Select Sample */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileJson className="h-5 w-5 text-slate-500" />
                Amostra de Dados
              </CardTitle>
              <CardDescription>Tenta buscar o primeiro registro (LIMIT 1).</CardDescription>
            </div>
            <StatusIcon status={tests.select.status} />
          </CardHeader>
          <CardContent>
            {tests.select.status === 'success' && (
              <div className="rounded-md bg-slate-950 p-4 overflow-x-auto">
                <pre className="text-xs text-green-400 font-mono">
                  {JSON.stringify(tests.select.data, null, 2)}
                </pre>
              </div>
            )}
            {tests.select.status === 'error' && (
              <Alert variant="destructive">
                <AlertTitle>Erro ao buscar dados</AlertTitle>
                <AlertDescription className="font-mono text-xs">{tests.select.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupabaseTestPage;