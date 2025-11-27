import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Activity, Database, Server, AlertTriangle, CheckCircle, XCircle, 
  Download, Terminal, ShieldAlert, AlertOctagon, BrainCircuit, Bug
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/lib/customSupabaseClient';
import { format, subDays } from 'date-fns';

const AutoDiagnosisPage = () => {
  const [status, setStatus] = useState('idle'); // 'idle', 'running', 'analyzing', 'completed', 'error'
  const [progress, setProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState('Iniciando sistema de diagnóstico...');
  const [logs, setLogs] = useState([]);
  const [report, setReport] = useState(null);
  const scrollRef = useRef(null);

  // Add log helper with unique ID to prevent "unique key" warnings
  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { 
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
      message, 
      type, 
      timestamp: new Date().toISOString() 
    }]);
    
    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  // Main Diagnosis Logic
  useEffect(() => {
    let isMounted = true;

    const runDiagnosis = async () => {
      if (status !== 'idle') return;
      setStatus('running');
      addLog("Iniciando diagnóstico automático...", "info");

      const finalReport = {
        timestamp: new Date().toISOString(),
        summary: {
          total_tables: 0,
          empty_tables: 0,
          critical_tables_ok: false,
          rpc_functions_count: 0,
          rpc_failures: 0
        },
        tables: {},
        functions: {},
        root_causes: [],
        recommendations: []
      };

      try {
        // --- STEP 1: Schema Inspection ---
        addLog("Conectando ao Information Schema...", "info");
        setProgress(5);
        
        let tables = [];
        let functions = [];

        // Try dedicated RPC first, else SQL
        const { data: overviewData, error: overviewError } = await supabase.rpc('get_db_overview');
        
        if (!overviewError && overviewData) {
          tables = overviewData.tables || [];
          functions = overviewData.functions || [];
          addLog(`Schema recuperado via RPC. ${tables.length} tabelas, ${functions.length} funções encontradas.`, "success");
        } else {
          addLog("RPC 'get_db_overview' falhou/inexistente. Tentando SQL fallback...", "warning");
          
          const tablesQuery = "SELECT table_name as name, table_schema as schema FROM information_schema.tables WHERE table_schema = 'public'";
          const { data: tData } = await supabase.rpc('execute_sql', { query: tablesQuery });
          tables = tData || [];

          const funcsQuery = "SELECT routine_name as name FROM information_schema.routines WHERE routine_schema = 'public'";
          const { data: fData } = await supabase.rpc('execute_sql', { query: funcsQuery });
          functions = fData || [];
          
          addLog(`Schema recuperado via SQL Fallback. ${tables.length} tabelas, ${functions.length} funções encontradas.`, "success");
        }

        finalReport.summary.total_tables = tables.length;
        finalReport.summary.rpc_functions_count = functions.length;

        // --- STEP 2: Deep Table Inspection ---
        addLog("Iniciando inspeção profunda de tabelas...", "info");
        let tablesProcessed = 0;
        const totalSteps = tables.length + functions.length + 5; // +5 for extra checks
        
        for (const table of tables) {
          if (!isMounted) return;
          setCurrentAction(`Analisando tabela: ${table.name}...`);
          
          let tableInfo = { name: table.name, columns: [], row_count: 0, sample: [] };
          
          try {
            // Get Count
            const countQuery = `SELECT count(*) as count FROM "${table.name}"`;
            const { data: countRes } = await supabase.rpc('execute_sql', { query: countQuery });
            tableInfo.row_count = countRes?.[0]?.count || 0;

            // Get Structure (Lite)
            const colsQuery = `SELECT column_name FROM information_schema.columns WHERE table_name = '${table.name}' LIMIT 50`;
            const { data: cols } = await supabase.rpc('execute_sql', { query: colsQuery });
            tableInfo.columns = cols?.map(c => c.column_name) || [];

            // Get Sample
            if (tableInfo.row_count > 0) {
                const sampleQuery = `SELECT * FROM "${table.name}" LIMIT 3`;
                const { data: sampleRes } = await supabase.rpc('execute_sql', { query: sampleQuery });
                tableInfo.sample = sampleRes || [];
            }

            // Analysis
            if (tableInfo.row_count === 0) {
              // Don't log error for support tables, only main ones
              if (!table.name.startsWith('pg_') && !table.name.startsWith('sql_')) {
                  addLog(`Tabela VAZIA: ${table.name}`, "warning");
                  finalReport.summary.empty_tables++;
              }
            }

            finalReport.tables[table.name] = tableInfo;

          } catch (err) {
            addLog(`Erro ao inspecionar ${table.name}: ${err.message}`, "error");
            finalReport.tables[table.name] = { error: err.message };
          }

          tablesProcessed++;
          setProgress(5 + (tablesProcessed / totalSteps) * 85);
        }

        // --- STEP 3: Critical Table Checks (bd-cl) ---
        if (finalReport.tables['bd-cl'] && finalReport.tables['bd-cl'].row_count > 0) {
          finalReport.summary.critical_tables_ok = true;
          addLog("Tabela crítica 'bd-cl' (Vendas) contém dados. OK.", "success");
          
          // Check for null dates
          const dateCheckQuery = `SELECT count(*) as count FROM "bd-cl" WHERE "DT Emissao" IS NULL`;
          const { data: dateCheck } = await supabase.rpc('execute_sql', { query: dateCheckQuery });
          if (dateCheck?.[0]?.count > 0) {
             finalReport.root_causes.push("Existem registros com 'DT Emissao' NULA na tabela de vendas. Isso afeta filtros de data.");
          }
        } else {
          finalReport.root_causes.push("Tabela crítica 'bd-cl' (Vendas) está VAZIA ou não existe. Dashboards ficarão zerados.");
          finalReport.recommendations.push("Verificar processo de ETL/Sincronização do ERP.");
        }

        // --- STEP 4: RPC Testing ---
        addLog("Testando funções RPC críticas...", "info");
        setStatus('analyzing');
        
        const today = new Date();
        // Common params for most reports
        const defaultParams = {
          p_start_date: format(subDays(today, 30), 'yyyy-MM-dd'),
          p_end_date: format(today, 'yyyy-MM-dd'),
          p_exclude_employees: true,
          p_supervisors: null,
          p_sellers: null,
          p_customer_groups: null,
          p_regions: null,
          p_clients: null,
          p_search_term: null
        };

        const criticalRPCs = ['get_overview_data_v2', 'get_dashboard_and_daily_sales_kpis', 'get_daily_sales_data_v2'];
        
        for (const rpcName of criticalRPCs) {
            if (!functions.some(f => f.name === rpcName)) {
                addLog(`RPC Crítica ausente: ${rpcName}`, "error");
                continue;
            }

            try {
                setCurrentAction(`Testando RPC: ${rpcName}...`);
                const { data, error } = await supabase.rpc(rpcName, defaultParams);
                
                if (error) {
                    addLog(`Falha na RPC ${rpcName}: ${error.message}`, "error");
                    finalReport.functions[rpcName] = { status: "failed", error: error.message };
                    finalReport.summary.rpc_failures++;
                } else {
                    const hasData = Array.isArray(data) ? data.length > 0 : (data && Object.keys(data).length > 0);
                    
                    // Deep check for empty nested data (specific to our structure)
                    let contentEmpty = false;
                    if (rpcName === 'get_overview_data_v2' && data?.kpi?.totalRevenue === 0) {
                        contentEmpty = true;
                    }

                    if (!hasData || contentEmpty) {
                        addLog(`RPC ${rpcName} retornou estrutura VAZIA (zerada).`, "warning");
                        finalReport.functions[rpcName] = { status: "empty_result", data_sample: data };
                    } else {
                        addLog(`RPC ${rpcName} executou com sucesso e retornou dados.`, "success");
                        finalReport.functions[rpcName] = { status: "success" };
                    }
                }
            } catch (e) {
                addLog(`Erro ao chamar RPC ${rpcName}: ${e.message}`, "error");
            }
            tablesProcessed++;
            setProgress(5 + (tablesProcessed / totalSteps) * 85);
        }

        // --- STEP 5: Root Cause Analysis Logic ---
        // 1. Empty Sales Table
        if (!finalReport.summary.critical_tables_ok) {
           // Already handled in step 3
        } 
        // 2. Data exists but RPC returns zero (likely column name mismatch)
        else if (finalReport.summary.rpc_failures === 0) {
           const overviewFunc = finalReport.functions['get_overview_data_v2'];
           if (overviewFunc?.status === 'empty_result') {
              finalReport.root_causes.push("Tabela 'bd-cl' tem dados, mas RPCs retornam zero. Provável erro de lógica SQL ou filtros.");
              finalReport.recommendations.push("Verifique se as colunas 'Cfo', 'DT Emissao' e 'Total' estão preenchidas corretamente no banco.");
              
              // Check CFO specifically
              const cfoCheck = await supabase.rpc('execute_sql', { query: `SELECT count(*) as count FROM "bd-cl" WHERE "Cfo" IS NULL` });
              if (cfoCheck.data?.[0]?.count > 0) {
                  finalReport.root_causes.push("Coluna 'Cfo' (Código Fiscal) contém valores nulos. Isso quebra a categorização de venda/bonificação.");
              }
           }
        }

        // 3. Permissions Check
        const { error: permError } = await supabase.from('user_roles').select('*').limit(1);
        if (permError) {
            finalReport.root_causes.push(`Erro de permissão RLS na tabela user_roles: ${permError.message}`);
            finalReport.recommendations.push("Verifique as Policies (RLS) no Supabase.");
        }

        // Finalize
        setProgress(100);
        setReport(finalReport);
        setStatus('completed');
        addLog("Diagnóstico completo com sucesso!", "success");

      } catch (fatalError) {
        console.error(fatalError);
        setStatus('error');
        addLog(`Erro fatal no diagnóstico: ${fatalError.message}`, "error");
      }
    };

    runDiagnosis();

    return () => { isMounted = false; };
  }, []);

  const downloadReport = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auto_diagnostico_${format(new Date(), 'yyyyMMdd_HHmm')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Helmet>
        <title>Diagnóstico Automático - Costa Lavos</title>
      </Helmet>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-foreground">
              <BrainCircuit className="h-8 w-8 text-primary" />
              Diagnóstico Automático do Sistema
            </h1>
            <p className="text-muted-foreground mt-1">
              Análise autônoma de integridade de banco de dados, RPCs e consistência de dados.
            </p>
          </div>
          {status === 'completed' && (
            <Button onClick={downloadReport} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Download className="mr-2 h-4 w-4" /> Baixar Relatório JSON
            </Button>
          )}
        </div>

        {/* Status Cards */}
        {report && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tabelas Analisadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.summary.total_tables}</div>
                <p className="text-xs text-muted-foreground">
                  {report.summary.empty_tables} tabelas vazias
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Status 'bd-cl'</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {report.summary.critical_tables_ok ? (
                    <Badge variant="success" className="bg-emerald-500 hover:bg-emerald-600">OK - Com Dados</Badge>
                  ) : (
                    <Badge variant="destructive">CRÍTICO - Vazia</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tabela principal de vendas
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Falhas RPC</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${report.summary.rpc_failures > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {report.summary.rpc_failures}
                </div>
                <p className="text-xs text-muted-foreground">Erros de execução detectados</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Diagnóstico Final</CardTitle>
              </CardHeader>
              <CardContent>
                {report.root_causes.length === 0 ? (
                  <div className="text-emerald-600 font-bold flex items-center gap-2"><CheckCircle className="h-5 w-5"/> Saudável</div>
                ) : (
                  <div className="text-red-600 font-bold flex items-center gap-2"><AlertOctagon className="h-5 w-5"/> Atenção Requerida</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Analysis Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          
          {/* Left: Terminal / Logs */}
          <Card className="col-span-2 flex flex-col h-full border-slate-700 bg-slate-950 text-slate-100 font-mono shadow-xl">
            <CardHeader className="border-b border-slate-800 bg-slate-900 py-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
                  <Terminal className="h-4 w-4 text-emerald-400" /> 
                  Console de Diagnóstico
                </CardTitle>
                <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700">
                  {status === 'running' || status === 'analyzing' ? 'EXECUTANDO' : status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative overflow-hidden flex flex-col">
              {status !== 'completed' && status !== 'error' && (
                <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>{currentAction}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-slate-800" indicatorClassName="bg-emerald-500" />
                </div>
              )}
              
              <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs" ref={scrollRef}>
                {logs.map((log) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex gap-2 ${
                      log.type === 'error' ? 'text-red-400' : 
                      log.type === 'warning' ? 'text-amber-400' : 
                      log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'
                    }`}
                  >
                    <span className="text-slate-600 shrink-0">[{log.timestamp.split('T')[1].split('.')[0]}]</span>
                    <span className="shrink-0">{log.type === 'info' ? '>' : log.type === 'success' ? '✔' : log.type === 'error' ? '✖' : '!'}</span>
                    <span className="break-all">{log.message}</span>
                  </motion.div>
                ))}
                {status === 'running' && (
                  <div className="text-xs text-slate-500 animate-pulse flex gap-2">
                    <span>_</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right: Root Cause & Actions */}
          <Card className="flex flex-col h-full overflow-hidden bg-card border-border">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" />
                Análise de Causa Raiz
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-y-auto">
              {report ? (
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" /> Problemas Identificados
                    </h3>
                    {report.root_causes.length > 0 ? (
                      <ul className="space-y-2">
                        {report.root_causes.map((cause, i) => (
                          <li key={i} className="text-sm p-3 bg-destructive/10 text-destructive rounded-md border border-destructive/20 flex gap-2 items-start">
                            <Bug className="h-4 w-4 mt-0.5 shrink-0" />
                            {cause}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-muted-foreground italic p-4 border border-dashed rounded bg-muted/20 text-center">
                        Nenhum problema crítico óbvio detectado automaticamente.
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-emerald-600">
                      <CheckCircle className="h-4 w-4" /> Recomendações
                    </h3>
                    {report.recommendations.length > 0 ? (
                      <ul className="space-y-2">
                        {report.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800">
                            {rec}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-muted-foreground italic">
                        Nenhuma ação específica recomendada no momento.
                      </div>
                    )}
                  </div>
                  
                  {report.tables['bd-cl']?.sample?.length > 0 && (
                    <div className="pt-4 border-t">
                        <h4 className="text-xs font-semibold mb-2 text-muted-foreground flex items-center gap-2">
                            <Database className="h-3 w-3"/> Amostra de Dados (bd-cl)
                        </h4>
                        <div className="bg-slate-950 text-slate-300 rounded p-3 text-[10px] font-mono overflow-x-auto border border-slate-800">
                            <pre>{JSON.stringify(report.tables['bd-cl'].sample[0], null, 2)}</pre>
                        </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                  <Activity className="h-12 w-12 mb-4 opacity-20 animate-pulse text-primary" />
                  <p>Aguardando conclusão do diagnóstico para gerar análise detalhada...</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  );
};

export default AutoDiagnosisPage;