import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { SMOKE_TEST_SUITE } from '@/tests/smoke-test';
import { callRpc } from '@/services/api';
import { formatNumber } from '@/lib/utils';

const SmokeTestPage = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState({});
  const [progress, setProgress] = useState(0);

  const runTests = useCallback(async () => {
    setIsRunning(true);
    setResults({});
    setProgress(0);

    let completed = 0;
    const total = SMOKE_TEST_SUITE.length;

    for (const test of SMOKE_TEST_SUITE) {
      const startTime = performance.now();
      let status = 'pending';
      let message = '';
      let dataCount = 0;
      let duration = 0;

      try {
        const { data, error } = await callRpc(test.rpc, test.params);
        const endTime = performance.now();
        duration = endTime - startTime;

        if (error) {
          status = 'error';
          message = error.message || 'Erro desconhecido na RPC';
        } else if (!data) {
          status = 'warning';
          message = 'Nenhum dado retornado (null)';
        } else if (Array.isArray(data) && data.length === 0 && !test.expectEmpty) {
          status = 'warning';
          message = 'Array vazio retornado';
        } else {
          status = 'success';
          dataCount = Array.isArray(data) ? data.length : (data ? 1 : 0);
          message = test.expectEmpty && dataCount === 0 ? 'Sucesso: Retorno vazio esperado' : 'Dados carregados com sucesso';
        }
      } catch (err) {
        status = 'error';
        message = err.message;
        duration = performance.now() - startTime;
      }

      setResults(prev => ({
        ...prev,
        [test.id]: {
          status,
          message,
          duration,
          dataCount,
          timestamp: new Date().toLocaleTimeString()
        }
      }));

      completed++;
      setProgress((completed / total) * 100);
    }

    setIsRunning(false);
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success': return <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1"/> Aprovado</Badge>;
      case 'error': return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1"/> Erro</Badge>;
      case 'warning': return <Badge variant="warning" className="text-white"><AlertTriangle className="w-3 h-3 mr-1"/> Alerta</Badge>;
      default: return <Badge variant="outline"><Clock className="w-3 h-3 mr-1"/> Pendente</Badge>;
    }
  };

  const getDurationColor = (ms) => {
    if (ms < 500) return 'text-emerald-600';
    if (ms < 1500) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Smoke Test | Diagnóstico do Sistema</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Smoke Test Automatizado</h1>
          <p className="text-muted-foreground">
            Verificação de integridade das rotas analíticas e acesso a dados via RPC.
          </p>
        </div>
        <Button onClick={runTests} disabled={isRunning} size="lg">
          {isRunning ? (
            <span className="flex items-center gap-2"><Clock className="animate-spin" /> Executando...</span>
          ) : (
            <span className="flex items-center gap-2"><Play className="w-4 h-4" /> Iniciar Testes</span>
          )}
        </Button>
      </div>

      {isRunning && <Progress value={progress} className="w-full h-2" />}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Execução</CardTitle>
            <CardDescription>
              Testando endpoints RPC e carregamento de dados simulado para as principais rotas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Teste / Rota</TableHead>
                  <TableHead>Função RPC</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Performance</TableHead>
                  <TableHead className="text-right">Dados Retornados</TableHead>
                  <TableHead>Mensagem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SMOKE_TEST_SUITE.map((test) => {
                  const result = results[test.id];
                  return (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{test.name}</span>
                          <span className="text-xs text-muted-foreground">{test.route}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {test.rpc}
                      </TableCell>
                      <TableCell>
                        {result ? getStatusBadge(result.status) : <Badge variant="outline" className="opacity-50">Aguardando</Badge>}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {result ? (
                          <span className={getDurationColor(result.duration)}>
                            {formatNumber(result.duration)} ms
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {result ? result.dataCount : '-'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">
                        {result?.message || test.description}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SmokeTestPage;