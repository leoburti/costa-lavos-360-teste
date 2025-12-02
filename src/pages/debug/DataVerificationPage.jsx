import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const rpcList = [
  // Predictive Analysis
  { name: 'get_churn_analysis_data_v3', category: 'Análise Preditiva' },
  { name: 'get_rfm_analysis', category: 'Análise Preditiva' },
  { name: 'get_new_client_trends', category: 'Análise Preditiva' },
  
  // Performance Analysis
  { name: 'get_low_performance_clients', category: 'Análise de Desempenho' },
  { name: 'get_loyalty_analysis', category: 'Análise de Desempenho' },

  // Equipment Analysis
  { name: 'get_equipment_movement', category: 'Análise de Equipamentos' },

  // Managerial Analysis
  { name: 'get_supervisor_analytical_data', category: 'Análise Gerencial' },
  { name: 'get_seller_analytical_data', category: 'Análise Gerencial' },
  { name  : 'get_supervisor_one_on_one_data', category: 'Análise Gerencial' },
  
  // Regional & Group Analysis
  { name: 'get_regional_summary_v2', category: 'Análise Regional e de Grupo' },
  { name: 'get_drilldown_data', category: 'Análise Regional e de Grupo' },
  { name: 'get_group_360_analysis', category: 'Análise Regional e de Grupo' },
  { name: 'get_group_sales_analysis', category: 'Análise Regional e de Grupo' },

  // Product Analysis
  { name: 'get_product_basket_analysis_v2', category: 'Análise de Produtos' },
  { name: 'get_product_mix_analysis', category: 'Análise de Produtos' },
];

const defaultParams = {
  p_start_date: '2024-01-01',
  p_end_date: '2024-03-31',
  p_exclude_employees: true,
  p_supervisors: null,
  p_sellers: null,
  p_customer_groups: null,
  p_regions: null,
  p_clients: null,
  p_search_term: null,
  // Extra parameters for fixed functions
  p_analysis_type: 'new_clients_90',
  p_analysis_mode: 'region',
  p_drilldown_level: 1,
  p_parent_keys: [],
  p_show_defined_groups_only: false,
  p_level: 'root',
  p_parent_key: null,
  p_supervisor_name: null 
};

const getIconForStatus = (status) => {
  switch (status) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'error':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'timeout':
      return <Clock className="h-5 w-5 text-yellow-500" />;
    default:
      return <AlertTriangle className="h-5 w-5 text-gray-500" />;
  }
};

const DataVerificationPage = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const testFunction = useCallback(async (funcName) => {
    setLoading(prev => ({ ...prev, [funcName]: true }));
    const startTime = Date.now();
    try {
      // Adapt params based on function requirements to avoid signature mismatch during test
      let params = { ...defaultParams };
      
      if (funcName === 'get_group_sales_analysis') {
          // Remove params that cause conflict if function expects specific set
          delete params.p_start_date;
          delete params.p_end_date;
      }

      const { data, error } = await supabase.rpc(funcName, params);
      const duration = Date.now() - startTime;

      if (error) {
        if (error.code === '57014' || error.message.includes('timeout')) {
          setResults(prev => ({ ...prev, [funcName]: { status: 'timeout', data: 'Statement timed out', duration } }));
        } else {
          setResults(prev => ({ ...prev, [funcName]: { status: 'error', data: error.message, duration } }));
        }
      } else {
        setResults(prev => ({ ...prev, [funcName]: { status: 'success', data: `Success. Records: ${data?.length ?? 'N/A'}`, duration } }));
      }
    } catch (err) {
      const duration = Date.now() - startTime;
      setResults(prev => ({ ...prev, [funcName]: { status: 'error', data: err.message, duration } }));
    } finally {
      setLoading(prev => ({ ...prev, [funcName]: false }));
    }
  }, []);

  const testAllFunctions = async () => {
    for (const rpc of rpcList) {
      await testFunction(rpc.name);
    }
  };

  const groupedRpcs = rpcList.reduce((acc, rpc) => {
    if (!acc[rpc.category]) {
      acc[rpc.category] = [];
    }
    acc[rpc.category].push(rpc);
    return acc;
  }, {});

  return (
    <>
      <Helmet>
        <title>Verificação de Dados e RPCs</title>
      </Helmet>
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Verificação de Funções RPC</CardTitle>
                <CardDescription>
                  Teste a integridade e o desempenho das principais funções de busca de dados do sistema.
                </CardDescription>
              </div>
              <Button onClick={testAllFunctions}>Testar Tudo</Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[65vh] pr-4">
              <div className="space-y-6">
                {Object.entries(groupedRpcs).map(([category, rpcs]) => (
                  <div key={category}>
                    <h3 className="text-xl font-semibold mb-3">{category}</h3>
                    <div className="space-y-2">
                      {rpcs.map((rpc) => (
                        <div key={rpc.name} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Button
                              onClick={() => testFunction(rpc.name)}
                              disabled={loading[rpc.name]}
                              size="sm"
                              variant="outline"
                            >
                              {loading[rpc.name] ? 'Testando...' : 'Testar'}
                            </Button>
                            <code className="font-mono text-sm">{rpc.name}</code>
                          </div>
                          {results[rpc.name] && (
                            <div className="flex items-center gap-3">
                              <Badge variant={results[rpc.name].status === 'success' ? 'success' : 'destructive'}>
                                {results[rpc.name].status.toUpperCase()}
                              </Badge>
                              <div className="text-sm text-muted-foreground w-64 truncate" title={results[rpc.name].data}>
                                {results[rpc.name].data}
                              </div>
                              <div className="text-sm font-semibold w-24 text-right">
                                {results[rpc.name].duration} ms
                              </div>
                              {getIconForStatus(results[rpc.name].status)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DataVerificationPage;