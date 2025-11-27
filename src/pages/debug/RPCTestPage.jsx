import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Database, Terminal, AlertTriangle, CheckCircle2 } from 'lucide-react';

const RPCTestPage = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const testResults = {};
    
    // Parâmetros de Teste
    const startDate = '2025-01-01';
    const endDate = '2025-11-26'; // Data atual do sistema

    // --- Teste 1: get_overview_data_v2 ---
    const rpc1Name = 'get_overview_data_v2';
    testResults.rpc1 = {
        title: 'RPC: get_overview_data_v2',
        type: 'rpc',
        params: { 
            p_start_date: startDate, 
            p_end_date: endDate, 
            p_exclude_employees: true,
            p_supervisors: null,
            p_sellers: null,
            p_customer_groups: null,
            p_regions: null,
            p_clients: null,
            p_search_term: null
        },
        status: 'pending'
    };
    try {
        const { data, error } = await supabase.rpc(rpc1Name, testResults.rpc1.params);
        testResults.rpc1.result = data;
        testResults.rpc1.error = error;
        testResults.rpc1.status = error ? 'error' : 'success';
    } catch (e) {
        testResults.rpc1.error = { message: e.message };
        testResults.rpc1.status = 'error';
    }

    // --- Teste 2: get_daily_sales_data_v2 ---
    const rpc2Name = 'get_daily_sales_data_v2';
    testResults.rpc2 = {
        title: 'RPC: get_daily_sales_data_v2',
        type: 'rpc',
        params: { 
            p_start_date: startDate, 
            p_end_date: endDate 
        },
        status: 'pending'
    };
    try {
        const { data, error } = await supabase.rpc(rpc2Name, testResults.rpc2.params);
        testResults.rpc2.result = data;
        testResults.rpc2.error = error;
        testResults.rpc2.status = error ? 'error' : 'success';
    } catch (e) {
        testResults.rpc2.error = { message: e.message };
        testResults.rpc2.status = 'error';
    }

    // --- Teste 3: SQL Count Query ---
    // Usando a função execute_sql para rodar query direta
    // Nota: Usando "DT Emissao" conforme schema, não "DT_Emissao"
    const sqlQuery1 = `SELECT COUNT(*) as total_registros FROM "bd-cl" WHERE "DT Emissao" >= '${startDate}'`;
    testResults.sql1 = {
        title: 'SQL Direto: Contagem de Registros',
        type: 'sql',
        query: sqlQuery1,
        status: 'pending'
    };
    try {
        const { data, error } = await supabase.rpc('execute_sql', { query: sqlQuery1 });
        testResults.sql1.result = data;
        testResults.sql1.error = error;
        testResults.sql1.status = error ? 'error' : 'success';
    } catch (e) {
        testResults.sql1.error = { message: e.message };
        testResults.sql1.status = 'error';
    }

    // --- Teste 4: SQL Supervisors Query ---
    const sqlQuery2 = `SELECT DISTINCT "Nome Supervisor" FROM "bd-cl" WHERE "Nome Supervisor" IS NOT NULL LIMIT 10`;
    testResults.sql2 = {
        title: 'SQL Direto: Amostra de Supervisores',
        type: 'sql',
        query: sqlQuery2,
        status: 'pending'
    };
    try {
        const { data, error } = await supabase.rpc('execute_sql', { query: sqlQuery2 });
        testResults.sql2.result = data;
        testResults.sql2.error = error;
        testResults.sql2.status = error ? 'error' : 'success';
    } catch (e) {
        testResults.sql2.error = { message: e.message };
        testResults.sql2.status = 'error';
    }

    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 bg-slate-50 min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Terminal className="h-6 w-6 text-primary" />
                    Diagnóstico de RPC e Dados
                </h1>
                <p className="text-slate-500 mt-1">
                    Ferramenta de debug para verificar integridade das funções do banco de dados e retorno de queries.
                </p>
            </div>
            <Button onClick={runTests} disabled={loading} size="lg" className="shadow-md hover:shadow-lg transition-all">
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Play className="mr-2 h-5 w-5" />}
                Executar Bateria de Testes
            </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Renderizar Cards de Resultado */}
            {Object.entries(results).length === 0 && !loading && (
                <div className="col-span-full text-center py-20 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Clique em "Executar Bateria de Testes" para iniciar o diagnóstico.</p>
                </div>
            )}

            {Object.entries(results).map(([key, test]) => (
                <Card key={key} className={`shadow-sm transition-all duration-300 ${test.status === 'error' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-emerald-500'}`}>
                    <CardHeader className="pb-3 border-b bg-slate-50/50">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    {test.type === 'rpc' ? <Database className="h-4 w-4 text-blue-500" /> : <Terminal className="h-4 w-4 text-purple-500" />}
                                    {test.title}
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Badge variant="outline" className="text-[10px] font-mono">
                                        {test.status === 'success' ? 'SUCESSO' : 'FALHA'}
                                    </Badge>
                                </div>
                            </div>
                            {test.status === 'success' ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            ) : (
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        {/* Parâmetros Enviados */}
                        <div>
                            <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Input (Parâmetros/Query)</h4>
                            <div className="bg-slate-100 p-3 rounded-md border border-slate-200 font-mono text-xs text-slate-700 overflow-x-auto whitespace-pre-wrap break-all">
                                {test.params ? JSON.stringify(test.params, null, 2) : test.query}
                            </div>
                        </div>

                        {/* Resultado Recebido */}
                        <div>
                            <h4 className="text-xs font-bold uppercase text-slate-500 mb-2 flex justify-between">
                                <span>Output (Retorno JSON)</span>
                                {test.result && Array.isArray(test.result) && (
                                    <span className="text-xs normal-case font-normal bg-blue-100 text-blue-700 px-2 rounded-full">
                                        {test.result.length} itens
                                    </span>
                                )}
                            </h4>
                            <ScrollArea className="h-[300px] w-full rounded-md border bg-slate-950 text-slate-50 font-mono text-xs">
                                <div className="p-4">
                                    {test.error ? (
                                        <span className="text-red-400 font-bold">
                                            ERRO: {JSON.stringify(test.error, null, 2)}
                                        </span>
                                    ) : (
                                        <pre>{JSON.stringify(test.result, null, 2)}</pre>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );
};

export default RPCTestPage;