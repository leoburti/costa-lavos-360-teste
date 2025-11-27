
import React, { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Play, CheckCircle2, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RPC_MIGRATION_MAP } from '@/config/rpc_migration_map';

// Configuration for the tests
const STANDARD_PARAMS = {
  p_exclude_employees: true,
  p_supervisors: null,
  p_sellers: null,
  p_customer_groups: null,
  p_regions: null,
  p_clients: null,
  p_search_term: null
};

// Helper to determine record count based on varied RPC response structures
const getRecordCount = (data) => {
  if (!data) return 0;
  if (Array.isArray(data)) return data.length;
  
  // Handle specific object structures
  if (data.kpis) {
    if (data.data && Array.isArray(data.data)) return data.data.length;
    if (data.phase1 && Array.isArray(data.phase1)) return data.phase1.length + (data.phase2?.length || 0);
    if (data.clients && Array.isArray(data.clients)) return data.clients.length;
    if (data.dailySales && Array.isArray(data.dailySales)) return data.dailySales.length;
    return 1; // At least returned the KPI object
  }
  
  if (data['A'] || data['B'] || data['C']) {
    let count = 0;
    Object.values(data).forEach(group => {
      if (group.client_count) count += group.client_count;
    });
    return count;
  }

  return 1; // Unknown object structure, but data exists
};

const DataVerificationPage = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const pagesToTest = [
    { name: "Dashboard Comercial", path: "/dashboard", rpc: "get_overview_data_v2", requiresDates: true },
    { name: "Dashboard Analítico", path: "/analitico-vendas-diarias", rpc: "get_daily_sales_data_v2", requiresDates: true },
    ...RPC_MIGRATION_MAP.flatMap(group => group.files.map(file => ({
      name: file.component,
      path: file.path.replace('src/pages', '').replace('.jsx', '').toLowerCase(),
      rpc: file.rpc,
      requiresDates: file.params?.includes('p_start_date')
    })))
  ];

  const runDiagnosis = useCallback(async () => {
    setIsRunning(true);
    setResults({});
    setProgress(0);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const endDate = new Date();

    const dateParams = {
      p_start_date: startDate.toISOString(),
      p_end_date: endDate.toISOString()
    };

    let completed = 0;

    for (const page of pagesToTest) {
      setResults(prev => ({ ...prev, [page.name]: { status: 'loading' } }));

      try {
        const start = performance.now();
        const callParams = page.requiresDates ? { ...STANDARD_PARAMS, ...dateParams } : { ...STANDARD_PARAMS };
        
        // Skip or handle functions that require specific IDs which we can't easily mock generically
        if (page.rpc === 'get_group_360_analysis') throw new Error("Requer parâmetro específico (ID do Grupo)");
        if (page.rpc === 'get_client_360_data_v2') throw new Error("Requer contexto de cliente específico");
        if (page.rpc === 'get_client_equipments') throw new Error("Requer ID do cliente (p_cliente_id)");

        const { data, error } = await supabase.rpc(page.rpc, callParams);
        const duration = performance.now() - start;

        if (error) throw error;

        setResults(prev => ({
          ...prev,
          [page.name]: { status: 'success', count: getRecordCount(data), duration: duration.toFixed(0) }
        }));

      } catch (err) {
        setResults(prev => ({
          ...prev,
          [page.name]: { status: 'error', message: err.message || 'Erro desconhecido' }
        }));
      } finally {
        completed++;
        setProgress((completed / pagesToTest.length) * 100);
      }
    }

    setIsRunning(false);
  }, []);

  const getStatusBadge = (result) => {
    if (!result) return <Badge variant="outline">Pendente</Badge>;
    if (result.status === 'loading') return <Badge variant="secondary" className="animate-pulse">Testando...</Badge>;
    if (result.status === 'success') {
        if (result.count === 0) return <Badge className="bg-yellow-500 hover:bg-yellow-600">Vazio (0)</Badge>;
        return <Badge className="bg-green-500 hover:bg-green-600">Sucesso</Badge>;
    }
    return <Badge variant="destructive">Erro</Badge>;
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-primary" />
            Verificação de Integridade de Dados
          </h1>
          <p className="text-muted-foreground mt-1">Diagnóstico em tempo real de todas as páginas analíticas e suas conexões RPC.</p>
        </div>
        <Button size="lg" onClick={runDiagnosis} disabled={isRunning} className="min-w-[200px]">
          {isRunning ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testando {Math.round(progress)}%</> : <><Play className="mr-2 h-4 w-4" /> Iniciar Diagnóstico</>}
        </Button>
      </div>

      {!isRunning && Object.keys(results).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-700">{Object.values(results).filter(r => r.status === 'success' && r.count > 0).length}</div>
              <p className="text-sm text-green-600 font-medium">Páginas Operacionais</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-700">{Object.values(results).filter(r => r.status === 'success' && r.count === 0).length}</div>
              <p className="text-sm text-yellow-600 font-medium">Retorno Vazio (Sem Dados)</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-700">{Object.values(results).filter(r => r.status === 'error').length}</div>
              <p className="text-sm text-red-600 font-medium">Erros de Execução</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Resultados por Página</CardTitle><CardDescription>Teste realizado considerando período de 30 dias.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Página / Componente</TableHead>
                <TableHead>RPC Function</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Registros</TableHead>
                <TableHead className="text-right">Tempo (ms)</TableHead>
                <TableHead className="text-right">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagesToTest.map((page, idx) => {
                const result = results[page.name];
                return (
                  <TableRow key={idx}>
                    <TableCell className="font-medium"><div className="flex flex-col"><span>{page.name}</span><span className="text-xs text-muted-foreground font-mono">{page.path}</span></div></TableCell>
                    <TableCell><code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{page.rpc}</code></TableCell>
                    <TableCell>{getStatusBadge(result)}</TableCell>
                    <TableCell className="text-right font-mono">{result?.status === 'success' ? result.count : '-'}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">{result?.duration ? `${result.duration}ms` : '-'}</TableCell>
                    <TableCell className="text-right">
                        {result?.status === 'error' && <div className="text-xs text-red-500 max-w-[200px] truncate" title={result.message}>{result.message}</div>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataVerificationPage;
