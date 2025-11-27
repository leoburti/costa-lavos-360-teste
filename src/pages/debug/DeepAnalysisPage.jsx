import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Database, Server, AlertTriangle, CheckCircle2, FileText, RefreshCw, ShieldAlert } from 'lucide-react';

const DeepAnalysisPage = () => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const runDeepAnalysis = async () => {
    setLoading(true);
    const results = {
      timestamp: new Date().toISOString(),
      steps: []
    };

    // Helper to push results safely
    const pushResult = (step) => results.steps.push(step);

    try {
      // --- TEST 1 & 2 & 3 & 4: Connection, Sample, Columns, Types ---
      // Query: SELECT * FROM bd-cl LIMIT 5
      let step1 = { 
        id: 1,
        title: "Conexão Direta & Amostra Real (SELECT * LIMIT 5)", 
        description: "Verifica se a tabela 'bd-cl' existe e recupera registros brutos.",
        status: "pending" 
      };
      
      try {
        const { data, error } = await supabase
          .from('bd-cl')
          .select('*')
          .limit(5);
        
        if (error) throw error;
        
        step1.status = "success";
        step1.data = data;
        
        // Analysis of structure based on data
        if (data && data.length > 0) {
            const sample = data[0];
            const columns = Object.keys(sample).map(key => ({
                name: key,
                type: sample[key] === null ? 'null (indefinido)' : typeof sample[key],
                sampleValue: String(sample[key]).substring(0, 50)
            }));
            step1.structure = columns;
        } else {
            step1.structure = [];
            step1.message = "Tabela acessível mas vazia.";
        }
      } catch (e) {
        step1.status = "error";
        step1.error = e;
      }
      pushResult(step1);

      // --- TEST 5: Total Count ---
      // Query: SELECT COUNT(*) FROM bd-cl
      let step2 = {
        id: 2,
        title: "Contagem Total (SELECT COUNT(*))",
        description: "Total absoluto de registros na tabela.",
        status: "pending"
      };
      try {
        const { count, error } = await supabase
          .from('bd-cl')
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        step2.status = "success";
        step2.data = { count };
      } catch (e) {
        step2.status = "error";
        step2.error = e;
      }
      pushResult(step2);

      // --- TEST 6: Count 2025 ---
      // Query: SELECT COUNT(*) FROM bd-cl WHERE DT_Emissao >= '2025-01-01'
      let step3 = {
        id: 3,
        title: "Registros Recentes (2025)",
        description: "Valida se existem dados com data de emissão em 2025.",
        status: "pending"
      };
      try {
        // Using string formatting for column with space if needed, though Supabase usually handles it.
        // Assuming column name is "DT Emissao" based on typical export, or "DT_Emissao". 
        // We try "DT Emissao" first based on previous context.
        const { count, error } = await supabase
          .from('bd-cl')
          .select('*', { count: 'exact', head: true })
          .gte('"DT Emissao"', '2025-01-01');
        
        if (error) throw error;
        step3.status = "success";
        step3.data = { count };
      } catch (e) {
        step3.status = "error";
        step3.error = e;
      }
      pushResult(step3);

      // --- TEST 7: Supervisores ---
      // Query: SELECT DISTINCT Supervisor FROM bd-cl LIMIT 20
      let step4 = {
        id: 4,
        title: "Amostra de Supervisores",
        description: "Busca lista de supervisores para validar integridade dos dados.",
        status: "pending"
      };
      try {
        // JS-side Distinct simulation since standard SDK client doesn't support SELECT DISTINCT easily without RPC
        const { data, error } = await supabase
          .from('bd-cl')
          .select('"Nome Supervisor"') // Quoted for space safety
          .not('"Nome Supervisor"', 'is', null)
          .limit(200); // Fetch more to get better sample

        if (error) throw error;
        
        const unique = [...new Set(data.map(item => item['Nome Supervisor']))].slice(0, 20);
        step4.status = "success";
        step4.data = unique;
      } catch (e) {
        step4.status = "error";
        step4.error = e;
      }
      pushResult(step4);

      // --- TEST 8: Vendedores ---
      // Query: SELECT DISTINCT Vendedor FROM bd-cl LIMIT 20
      let step5 = {
        id: 5,
        title: "Amostra de Vendedores",
        description: "Busca lista de vendedores para validar integridade dos dados.",
        status: "pending"
      };
      try {
        const { data, error } = await supabase
          .from('bd-cl')
          .select('"Nome Vendedor"') // Quoted for space safety
          .not('"Nome Vendedor"', 'is', null)
          .limit(200);

        if (error) throw error;
        
        const unique = [...new Set(data.map(item => item['Nome Vendedor']))].slice(0, 20);
        step5.status = "success";
        step5.data = unique;
      } catch (e) {
        step5.status = "error";
        step5.error = e;
      }
      pushResult(step5);

      // --- TEST 9: RPC get_overview_data_v2 ---
      let step6 = {
        id: 6,
        title: "Teste RPC: get_overview_data_v2",
        description: "Tenta executar a função do dashboard geral.",
        status: "pending"
      };
      try {
        const { data, error } = await supabase.rpc('get_overview_data_v2', {
            p_start_date: '2025-01-01',
            p_end_date: '2025-12-31',
            p_exclude_employees: true
        });
        
        if (error) throw error;
        step6.status = "success";
        step6.data = { 
            has_kpi: !!data?.kpi,
            sales_count: data?.kpi?.salesCount || 0,
            rankings_keys: Object.keys(data?.rankings || {})
        };
      } catch (e) {
        step6.status = "error";
        step6.error = {
            message: e.message,
            details: e.details,
            hint: e.hint,
            code: e.code
        };
      }
      pushResult(step6);

      // --- TEST 10: RPC get_daily_sales_data_v2 ---
      let step7 = {
        id: 7,
        title: "Teste RPC: get_daily_sales_data_v2",
        description: "Tenta executar a função de vendas diárias.",
        status: "pending"
      };
      try {
        const { data, error } = await supabase.rpc('get_daily_sales_data_v2', {
            p_start_date: '2025-01-01',
            p_end_date: '2025-12-31',
            p_exclude_employees: true
        });
        
        if (error) throw error;
        step7.status = "success";
        step7.data = { 
            days_returned: data?.length || 0,
            first_day: data?.[0]
        };
      } catch (e) {
        step7.status = "error";
        step7.error = {
            message: e.message,
            details: e.details,
            hint: e.hint,
            code: e.code
        };
      }
      pushResult(step7);

    } catch (globalError) {
      console.error("Fatal error in analysis:", globalError);
    } finally {
      setReport(results);
      setLoading(false);
    }
  };

  useEffect(() => {
    runDeepAnalysis();
  }, []);

  return (
    <div className="p-6 max-w-[1600px] mx-auto bg-slate-50 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-red-700" />
            Relatório de Análise Profunda
          </h1>
          <p className="text-slate-500 mt-2">
            Diagnóstico forense da tabela <code>bd-cl</code> e integridade das funções RPC.
          </p>
        </div>
        <Button onClick={runDeepAnalysis} disabled={loading} size="lg" className="shadow-md bg-blue-700 hover:bg-blue-800 text-white">
          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <RefreshCw className="mr-2 h-5 w-5" />}
          Reexecutar Testes
        </Button>
      </div>

      {!report && loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
            <p className="text-lg font-medium text-slate-700">Executando varredura no banco de dados...</p>
            <p className="text-sm text-slate-500">Isso pode levar alguns segundos.</p>
        </div>
      )}

      {report && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Status Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase text-slate-500">Conexão BD</CardTitle></CardHeader>
                    <CardContent>
                        {report.steps[0]?.status === 'success' ? 
                            <span className="flex items-center text-green-600 font-bold"><CheckCircle2 className="w-4 h-4 mr-2"/> ESTABELECIDA</span> : 
                            <span className="flex items-center text-red-600 font-bold"><AlertTriangle className="w-4 h-4 mr-2"/> FALHA</span>
                        }
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase text-slate-500">Total Registros</CardTitle></CardHeader>
                    <CardContent>
                        <span className="text-2xl font-bold text-slate-800">
                            {report.steps[1]?.data?.count?.toLocaleString('pt-BR') || 'Erro'}
                        </span>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase text-slate-500">Registros 2025</CardTitle></CardHeader>
                    <CardContent>
                        <span className="text-2xl font-bold text-blue-700">
                            {report.steps[2]?.data?.count?.toLocaleString('pt-BR') || 'Erro'}
                        </span>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-bold uppercase text-slate-500">Integridade RPC</CardTitle></CardHeader>
                    <CardContent>
                        {report.steps[5]?.status === 'success' && report.steps[6]?.status === 'success' ? 
                            <Badge className="bg-green-500 hover:bg-green-600">100% OPERACIONAL</Badge> : 
                            <Badge variant="destructive">ERROS ENCONTRADOS</Badge>
                        }
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Steps */}
            <div className="space-y-6">
                {report.steps.map((step) => (
                    <Card key={step.id} className={`shadow-md border transition-all duration-200 ${step.status === 'error' ? 'border-red-300 bg-red-50/30' : 'border-slate-200 hover:border-blue-300'}`}>
                        <CardHeader className="bg-white border-b px-6 py-4 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                    step.status === 'success' ? 'bg-green-100 text-green-700' : 
                                    step.status === 'error' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {step.id}
                                </div>
                                <div>
                                    <CardTitle className={`text-lg ${step.status === 'error' ? 'text-red-800' : 'text-slate-800'}`}>{step.title}</CardTitle>
                                    <CardDescription>{step.description}</CardDescription>
                                </div>
                            </div>
                            <div>
                                {step.status === 'success' && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Sucesso</Badge>}
                                {step.status === 'error' && <Badge variant="destructive">Falha</Badge>}
                            </div>
                        </CardHeader>
                        
                        <CardContent className="p-6">
                            {/* ERROR DISPLAY */}
                            {step.status === 'error' && (
                                <Alert variant="destructive" className="bg-white border-red-200">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Erro Reportado</AlertTitle>
                                    <AlertDescription className="mt-2">
                                        <div className="font-mono text-xs bg-red-50 p-3 rounded border border-red-100 overflow-x-auto">
                                            <strong>Mensagem:</strong> {step.error?.message || JSON.stringify(step.error)}<br/>
                                            {step.error?.hint && <><br/><strong>Hint:</strong> {step.error.hint}</>}
                                            {step.error?.details && <><br/><strong>Details:</strong> {step.error.details}</>}
                                            {step.error?.code && <><br/><strong>PG Code:</strong> {step.error.code}</>}
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* STRUCTURE DISPLAY (Step 1) */}
                            {step.id === 1 && step.structure && (
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <Database size={14} /> Estrutura da Tabela (Detectada via JS)
                                    </h4>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-100 text-slate-600 font-medium">
                                                <tr>
                                                    <th className="p-2 border-b">Nome da Coluna (Key)</th>
                                                    <th className="p-2 border-b">Tipo Detectado</th>
                                                    <th className="p-2 border-b">Exemplo de Valor</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-slate-100">
                                                {step.structure.map((col, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50">
                                                        <td className="p-2 font-mono text-blue-700 font-medium">{col.name}</td>
                                                        <td className="p-2 text-slate-500">{col.type}</td>
                                                        <td className="p-2 text-slate-600 truncate max-w-[300px]" title={col.sampleValue}>
                                                            {col.sampleValue}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    <h4 className="text-sm font-semibold text-slate-700 mt-4 mb-2">JSON Bruto do 1º Registro</h4>
                                    <ScrollArea className="h-48 w-full rounded-md border bg-slate-900 p-4">
                                        <pre className="text-xs font-mono text-green-400">
                                            {JSON.stringify(step.data?.[0], null, 2)}
                                        </pre>
                                    </ScrollArea>
                                </div>
                            )}

                            {/* GENERIC DATA DISPLAY (Lists) */}
                            {Array.isArray(step.data) && step.id !== 1 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Valores Encontrados ({step.data.length})</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {step.data.map((val, i) => (
                                            <Badge key={i} variant="secondary" className="font-normal">
                                                {val}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* RPC OUTPUT DISPLAY */}
                            {(step.id === 6 || step.id === 7) && step.status === 'success' && (
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Retorno da Função (Resumo)</h4>
                                    <div className="bg-slate-100 p-4 rounded-md font-mono text-xs text-slate-700 overflow-x-auto">
                                        <pre>{JSON.stringify(step.data, null, 2)}</pre>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default DeepAnalysisPage;