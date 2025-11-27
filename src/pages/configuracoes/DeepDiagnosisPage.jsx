import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Loader2, 
  Database, 
  ServerCrash, 
  CheckCircle, 
  AlertTriangle, 
  Terminal, 
  Download, 
  Play, 
  RefreshCcw, 
  FileJson, 
  Search,
  Activity
} from 'lucide-react';

const CRITICAL_TABLES = ['bd-cl', 'bd_cl_inv', 'vendas_consolidadas', 'bonification_requests', 'equipamentos'];

const DeepDiagnosisPage = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [report, setReport] = useState(null);
  const [progress, setProgress] = useState(0);
  const logsEndRef = useRef(null);

  // Helper to add logs
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Utility to execute SQL safely via RPC
  const runSql = async (query) => {
    try {
      const { data, error } = await supabase.rpc('execute_sql', { query });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  };

  // Main Diagnosis Function
  const runDiagnosis = async () => {
    setIsRunning(true);
    setLogs([]);
    setReport(null);
    setProgress(0);

    const diagnosisReport = {
      timestamp: new Date().toISOString(),
      tables: {},
      rpcs: {},
      critical_analysis: {},
      environment: {}
    };

    try {
      addLog("🚀 Iniciando Diagnóstico Profundo...", 'info');

      // --- STEP 1: List All Tables ---
      addLog("📡 Conectando ao Schema Information...", 'info');
      const { data: tablesList, error: tablesError } = await runSql(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
      );

      if (tablesError) {
        throw new Error(`Falha ao listar tabelas: ${tablesError}`);
      }

      const tables = tablesList.map(t => t.table_name);
      addLog(`✅ Encontradas ${tables.length} tabelas no schema public.`, 'success');
      setProgress(10);

      // --- STEP 2: Deep Inspect Each Table ---
      for (let i = 0; i < tables.length; i++) {
        const tableName = tables[i];
        const isCritical = CRITICAL_TABLES.includes(tableName);
        
        addLog(`🔍 Analisando tabela: ${tableName}...`, isCritical ? 'warning' : 'info');

        // Get Row Count
        const { data: countData, error: countError } = await runSql(`SELECT count(*) as total FROM "${tableName}"`);
        const rowCount = countData ? parseInt(countData[0].total) : 0;

        // Get Columns
        const { data: colsData } = await runSql(
          `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${tableName}'`
        );

        // Get Sample Data
        const { data: sampleData } = await runSql(`SELECT * FROM "${tableName}" LIMIT 5`);

        // Analyze Date Columns (Specific for bd-cl)
        let dateAnalysis = null;
        if (tableName === 'bd-cl') {
           const { data: dates } = await runSql(`SELECT min("DT Emissao") as min_date, max("DT Emissao") as max_date FROM "${tableName}"`);
           dateAnalysis = dates ? dates[0] : null;
        }

        diagnosisReport.tables[tableName] = {
          exists: true,
          rowCount,
          columnCount: colsData?.length || 0,
          columns: colsData || [],
          sample: sampleData || [],
          dateAnalysis,
          error: countError
        };

        if (isCritical && rowCount === 0) {
          addLog(`⚠️ CRÍTICO: Tabela ${tableName} está VAZIA!`, 'error');
        } else {
          addLog(`   -> ${rowCount} registros encontrados.`, 'info');
        }

        setProgress(10 + Math.floor(((i + 1) / tables.length) * 50));
      }

      // --- STEP 3: RPC Inspection ---
      addLog("⚡ Verificando RPC Functions...", 'info');
      const { data: rpcs } = await runSql(
        "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public'"
      );
      
      const rpcList = rpcs?.map(r => r.routine_name) || [];
      diagnosisReport.rpcs.list = rpcList;
      addLog(`✅ ${rpcList.length} RPC functions encontradas.`, 'success');

      // Test Specific Critical RPC
      if (rpcList.includes('get_overview_data_v2')) {
        addLog("🧪 Testando RPC 'get_overview_data_v2'...", 'warning');
        // Using a very wide date range to ensure we catch any data if it exists
        const { data: rpcResult, error: rpcError } = await supabase.rpc('get_overview_data_v2', {
          p_start_date: '2023-01-01',
          p_end_date: '2025-12-31',
          p_exclude_employees: true,
          p_supervisors: null,
          p_sellers: null,
          p_customer_groups: null,
          p_regions: null,
          p_clients: null,
          p_search_term: null
        });

        diagnosisReport.rpcs['get_overview_data_v2'] = {
          status: rpcError ? 'error' : 'success',
          data_preview: rpcResult,
          error: rpcError
        };

        if (rpcResult?.kpi?.totalRevenue > 0) {
          addLog(`✅ RPC retornou dados! Receita Total detectada: ${rpcResult.kpi.totalRevenue}`, 'success');
        } else {
          addLog(`⚠️ RPC retornou sucesso mas SEM DADOS (Receita = 0).`, 'error');
        }
      }

      setProgress(80);

      // --- STEP 4: Root Cause Analysis ---
      addLog("🧠 Analisando Causa Raiz...", 'info');
      
      const rootCauses = [];
      const bdCl = diagnosisReport.tables['bd-cl'];

      if (!bdCl) {
        rootCauses.push("CRÍTICO: Tabela principal 'bd-cl' NÃO EXISTE no banco de dados.");
      } else if (bdCl.rowCount === 0) {
        rootCauses.push("CRÍTICO: Tabela 'bd-cl' existe mas está COMPLETAMENTE VAZIA (0 registros). O processo de ETL/Importação falhou.");
      } else {
        // Check Dates
        if (bdCl.dateAnalysis) {
           const minYear = new Date(bdCl.dateAnalysis.min_date).getFullYear();
           const maxYear = new Date(bdCl.dateAnalysis.max_date).getFullYear();
           const currentYear = new Date().getFullYear();
           
           if (maxYear < currentYear - 1) {
             rootCauses.push(`ALERTA DE DADOS ANTIGOS: A data mais recente encontrada é ${bdCl.dateAnalysis.max_date}. Os filtros de data do dashboard (provavelmente mês atual) não encontrarão nada.`);
           }
        }

        // Check Columns
        const columnNames = bdCl.columns.map(c => c.column_name);
        const criticalCols = ['Total', 'DT Emissao', 'Cliente', 'Loja'];
        const missingCols = criticalCols.filter(c => !columnNames.includes(c));
        
        if (missingCols.length > 0) {
          rootCauses.push(`ERRO DE SCHEMA: Colunas críticas faltando em 'bd-cl': ${missingCols.join(', ')}. Isso quebrará todas as RPCs.`);
        }
      }

      diagnosisReport.critical_analysis = {
        root_causes: rootCauses,
        status: rootCauses.length === 0 ? 'Healthy' : 'Critical Issues Found'
      };

      if (rootCauses.length === 0) {
        addLog("🎉 Nenhuma causa raiz crítica óbvia detectada. O banco parece saudável.", 'success');
      } else {
        rootCauses.forEach(cause => addLog(cause, 'error'));
      }

      setProgress(100);
      setReport(diagnosisReport);
      addLog("🏁 Diagnóstico Completo Finalizado.", 'success');

    } catch (error) {
      addLog(`❌ Erro Fatal no Diagnóstico: ${error.message}`, 'error');
      console.error(error);
    } finally {
      setIsRunning(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostico_completo_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            Diagnóstico Profundo & Causa Raiz
          </h1>
          <p className="text-muted-foreground mt-2">
            Ferramenta forense para inspeção direta do banco de dados Supabase.
            Ignora camadas da aplicação para ver a verdade nua e crua dos dados.
          </p>
        </div>
        <div className="flex gap-3">
          {report && (
            <Button variant="outline" onClick={downloadReport}>
              <Download className="mr-2 h-4 w-4" /> Baixar Relatório JSON
            </Button>
          )}
          <Button onClick={runDiagnosis} disabled={isRunning} className="min-w-[180px]">
            {isRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            {isRunning ? 'Executando...' : 'Executar Diagnóstico'}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        
        {/* LOGS CONSOLE */}
        <Card className="lg:col-span-1 flex flex-col h-full bg-zinc-950 text-green-400 border-zinc-800 font-mono">
          <CardHeader className="pb-2 border-b border-zinc-800">
            <CardTitle className="text-sm uppercase tracking-wider flex items-center gap-2">
              <Terminal className="h-4 w-4" /> Console de Execução
            </CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-1.5 text-xs">
              {logs.map((log, index) => (
                <div key={index} className={`flex gap-2 ${
                  log.type === 'error' ? 'text-red-400 font-bold' : 
                  log.type === 'warning' ? 'text-yellow-400' : 
                  log.type === 'success' ? 'text-emerald-400' : 'text-zinc-400'
                }`}>
                  <span className="opacity-50 shrink-0">[{log.timestamp}]</span>
                  <span>{log.message}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </ScrollArea>
        </Card>

        {/* RESULTS PANEL */}
        <Card className="lg:col-span-2 flex flex-col h-full overflow-hidden">
          <Tabs defaultValue="analysis" className="h-full flex flex-col">
            <div className="px-6 pt-6">
              <TabsList>
                <TabsTrigger value="analysis">Análise & Causa Raiz</TabsTrigger>
                <TabsTrigger value="tables">Tabelas & Dados ({report ? Object.keys(report.tables).length : 0})</TabsTrigger>
                <TabsTrigger value="rpcs">Funções RPC</TabsTrigger>
                <TabsTrigger value="json">Raw JSON</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden p-6">
              {!report && !isRunning && (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <Database className="h-16 w-16 mb-4 opacity-20" />
                  <p>Clique em "Executar Diagnóstico" para começar.</p>
                </div>
              )}

              {report && (
                <>
                  <TabsContent value="analysis" className="mt-0 h-full overflow-auto space-y-6">
                    {/* Root Cause Section */}
                    {report.critical_analysis.root_causes.length > 0 ? (
                      <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
                        <AlertTriangle className="h-5 w-5" />
                        <AlertTitle className="text-lg font-bold">Problemas Críticos Encontrados</AlertTitle>
                        <AlertDescription className="mt-2 space-y-2">
                          {report.critical_analysis.root_causes.map((cause, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                              <p>{cause}</p>
                            </div>
                          ))}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="border-emerald-500/50 bg-emerald-500/10">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                        <AlertTitle className="text-emerald-600 font-bold">Sistema Saudável</AlertTitle>
                        <AlertDescription className="text-emerald-700">
                          Não foram encontrados bloqueios críticos óbvios nas tabelas principais.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">Total Tabelas</p>
                          <p className="text-2xl font-bold">{Object.keys(report.tables).length}</p>
                        </CardContent>
                      </Card>
                      <Card className={`bg-muted/30 ${report.tables['bd-cl']?.rowCount === 0 ? 'border-red-500 border' : ''}`}>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">Registros em 'bd-cl'</p>
                          <p className="text-2xl font-bold">{report.tables['bd-cl']?.rowCount?.toLocaleString() || 'N/A'}</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">RPCs Disponíveis</p>
                          <p className="text-2xl font-bold">{report.rpcs.list?.length || 0}</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Action Plan */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Plano de Ação Sugerido</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3 list-disc list-inside text-sm">
                          {report.critical_analysis.root_causes.some(c => c.includes('VAZIA')) && (
                            <li className="text-red-600 font-semibold">
                              URGENTE: Verificar o script de ETL ou integração que popula o banco. As tabelas estão vazias.
                            </li>
                          )}
                          {report.critical_analysis.root_causes.some(c => c.includes('DADOS ANTIGOS')) && (
                            <li className="text-orange-600 font-semibold">
                              ATENÇÃO: Os dados existem mas são antigos. Verifique se a automação de atualização diária está rodando.
                            </li>
                          )}
                          {!report.critical_analysis.root_causes.length && (
                            <li className="text-muted-foreground">
                              Se os dashboards ainda estiverem vazios, verifique os filtros de usuário (RLS - Row Level Security) nas policies do Supabase.
                            </li>
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="tables" className="mt-0 h-full overflow-auto">
                    <div className="space-y-4">
                      <div className="flex gap-2 mb-4">
                        {CRITICAL_TABLES.map(t => (
                          <Badge 
                            key={t} 
                            variant={report.tables[t] ? (report.tables[t].rowCount > 0 ? 'default' : 'destructive') : 'outline'}
                          >
                            {t}: {report.tables[t]?.rowCount ?? 'N/A'}
                          </Badge>
                        ))}
                      </div>
                      <Accordion type="single" collapsible className="w-full">
                        {Object.entries(report.tables).map(([tableName, info]) => (
                          <AccordionItem key={tableName} value={tableName}>
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center justify-between w-full pr-4">
                                <span className="font-mono text-sm">{tableName}</span>
                                <div className="flex gap-3 text-sm text-muted-foreground">
                                  <span>{info.columnCount} cols</span>
                                  <span className={info.rowCount === 0 ? 'text-red-500 font-bold' : 'text-green-600'}>
                                    {info.rowCount?.toLocaleString()} linhas
                                  </span>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="p-4 bg-muted/30 rounded-md space-y-4">
                                {/* Columns */}
                                <div>
                                  <h4 className="font-bold text-xs uppercase mb-2">Estrutura (Colunas)</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {info.columns.map(col => (
                                      <Badge key={col.column_name} variant="outline" className="font-mono text-[10px]">
                                        {col.column_name} <span className="text-muted-foreground ml-1">({col.data_type})</span>
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                
                                {/* Sample Data */}
                                <div>
                                  <h4 className="font-bold text-xs uppercase mb-2 flex items-center gap-2">
                                    <Search className="h-3 w-3" /> Amostra de Dados (Top 5)
                                  </h4>
                                  <div className="rounded-md border overflow-hidden">
                                    <div className="overflow-x-auto max-w-full">
                                      <table className="w-full text-xs text-left">
                                        <thead className="bg-muted text-muted-foreground border-b">
                                          <tr>
                                            {info.columns.slice(0, 8).map(c => (
                                              <th key={c.column_name} className="p-2 font-medium whitespace-nowrap">{c.column_name}</th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody className="bg-card">
                                          {info.sample.length > 0 ? info.sample.map((row, idx) => (
                                            <tr key={idx} className="border-b last:border-0">
                                              {info.columns.slice(0, 8).map(c => (
                                                <td key={c.column_name} className="p-2 whitespace-nowrap border-r last:border-0 truncate max-w-[150px]">
                                                  {row[c.column_name] === null ? <span className="text-muted-foreground italic">null</span> : String(row[c.column_name])}
                                                </td>
                                              ))}
                                            </tr>
                                          )) : (
                                            <tr><td colSpan="100" className="p-4 text-center text-muted-foreground">Tabela Vazia</td></tr>
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </TabsContent>

                  <TabsContent value="rpcs" className="mt-0 h-full overflow-auto">
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Teste: get_overview_data_v2</CardTitle>
                          <CardDescription>Esta é a principal função usada pelo dashboard comercial.</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {report.rpcs['get_overview_data_v2'] ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                Status: 
                                <Badge variant={report.rpcs['get_overview_data_v2'].status === 'success' ? 'success' : 'destructive'}>
                                  {report.rpcs['get_overview_data_v2'].status.toUpperCase()}
                                </Badge>
                              </div>
                              {report.rpcs['get_overview_data_v2'].error && (
                                <Alert variant="destructive">
                                  <AlertTitle>Erro de Execução</AlertTitle>
                                  <AlertDescription>{report.rpcs['get_overview_data_v2'].error.message}</AlertDescription>
                                </Alert>
                              )}
                              <div className="bg-zinc-950 text-green-400 p-4 rounded-md font-mono text-xs overflow-auto max-h-[300px]">
                                <pre>{JSON.stringify(report.rpcs['get_overview_data_v2'].data_preview, null, 2)}</pre>
                              </div>
                            </div>
                          ) : (
                            <p className="text-muted-foreground">Teste não executado ou função não encontrada.</p>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Todas as Funções Disponíveis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {report.rpcs.list.map(rpc => (
                              <Badge key={rpc} variant="secondary" className="font-mono">{rpc}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="json" className="mt-0 h-full overflow-hidden">
                    <div className="h-full bg-zinc-950 text-zinc-300 p-4 rounded-md font-mono text-xs overflow-auto border border-zinc-800">
                      <pre>{JSON.stringify(report, null, 2)}</pre>
                    </div>
                  </TabsContent>
                </>
              )}
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default DeepDiagnosisPage;