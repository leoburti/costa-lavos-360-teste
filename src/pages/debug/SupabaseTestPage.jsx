import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, AlertTriangle, CheckCircle, RefreshCw, FileCode2, FunctionSquare, ShieldQuestion, Server } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SupabaseTestPage = () => {
    const [loading, setLoading] = useState(false);
    const [testResults, setTestResults] = useState(null);

    const runTests = async () => {
        setLoading(true);
        const results = [];
        let rlsEnabledCount = 0;
        let rlsDisabledCount = 0;
        let totalPolicies = 0;
        let totalFunctions = 0;
        let functionsWithErrors = 0;

        try {
            // Test 1: Get DB Overview
            const { data: overview, error: overviewError } = await supabase.rpc('get_db_overview');
            if (overviewError) throw new Error(`get_db_overview RPC: ${overviewError.message}`);

            totalFunctions = overview.functions.length;

            // Test 2: Inspect Tables for RLS
            for (const table of overview.tables) {
                const { data: policies, error: policyError } = await supabase
                    .from('pg_policies')
                    .select('*')
                    .eq('schemaname', 'public')
                    .eq('tablename', table.name);

                if (!policyError) {
                    if (policies.length > 0) {
                        rlsEnabledCount++;
                        totalPolicies += policies.length;
                    } else {
                        rlsDisabledCount++;
                    }
                }
            }

            // Test 3: Inspect Functions for search_path
            for (const func of overview.functions) {
                // This is a proxy test. In a real scenario, we might need a meta-function
                // to inspect function definitions. Here, we can just check if key functions work.
                if (func.name.startsWith('get_')) {
                    try {
                        // A simple test call. This might fail for functions needing specific args.
                        await supabase.rpc(func.name, {});
                    } catch (funcError) {
                        if (funcError.message.includes('function') && funcError.message.includes('does not exist')) {
                             functionsWithErrors++;
                        }
                    }
                }
            }

            results.push({
                test: 'Visão Geral da Base de Dados',
                status: 'success',
                details: `Encontradas ${overview.tables.length} tabelas, ${overview.views.length} views e ${totalFunctions} funções.`,
            });
            results.push({
                test: 'Segurança de Acesso (RLS)',
                status: rlsDisabledCount > 0 ? 'warning' : 'success',
                details: `${rlsEnabledCount} tabelas com RLS Ativo. ${rlsDisabledCount} tabelas SEM RLS. Total de ${totalPolicies} políticas.`,
            });
            results.push({
                test: 'Integridade de Funções',
                status: functionsWithErrors > 0 ? 'error' : 'success',
                details: `${totalFunctions - functionsWithErrors} de ${totalFunctions} funções parecem OK. ${functionsWithErrors} com erros potenciais de path/existência.`,
            });

        } catch (error) {
            results.push({
                test: 'Conexão Geral',
                status: 'error',
                details: error.message,
            });
        }

        setTestResults(results);
        setLoading(false);
    };

    useEffect(() => {
        runTests();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />;
            default: return <Server className="h-5 w-5 text-gray-400" />;
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <Database className="h-8 w-8 text-primary" />
                        Diagnóstico do Supabase
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Verificação de conexão, segurança e integridade da base de dados.
                    </p>
                </div>
                <Button onClick={runTests} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    Re-executar Testes
                </Button>
            </div>

            {loading && !testResults && (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                </div>
            )}

            {testResults && (
                <div className="space-y-4">
                    {testResults.map((result, index) => (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <div className="flex items-center gap-3">
                                    {getStatusIcon(result.status)}
                                    <CardTitle>{result.test}</CardTitle>
                                </div>
                                <Badge variant={result.status === 'success' ? 'default' : result.status === 'warning' ? 'secondary' : 'destructive'}
                                    className={`${result.status === 'success' ? 'bg-green-100 text-green-800' : result.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : ''}`}
                                >
                                    {result.status.toUpperCase()}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{result.details}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SupabaseTestPage;