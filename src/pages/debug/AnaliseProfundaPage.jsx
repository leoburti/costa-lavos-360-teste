import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, Database, AlertTriangle, CheckCircle2, Users, User } from 'lucide-react';
import { getSupervisors, getVendedores } from '@/services/apoioSyncService';

const AnaliseProfundaPage = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [supervisors, setSupervisors] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Basic Stats
      const { count, error: countError } = await supabase
        .from('bd-cl')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;

      // 2. Last Update
      const { data: lastUpdateData, error: dateError } = await supabase
        .from('bd-cl')
        .select('"DT Emissao"')
        .order('"DT Emissao"', { ascending: false })
        .limit(1);

      if (dateError) throw dateError;

      // 3. Fetch Supervisors (using robust service)
      const sups = await getSupervisors();
      
      // 4. Fetch Sellers (using robust service)
      const vends = await getVendedores();

      setStats({
        totalRows: count,
        lastUpdate: lastUpdateData?.[0]?.['DT Emissao'] || 'N/A'
      });
      setSupervisors(sups);
      setSellers(vends);

    } catch (err) {
      console.error("Deep Analysis Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-primary">
            <Database className="h-8 w-8" />
            Análise Profunda: bd-cl
          </h1>
          <p className="text-muted-foreground mt-1">
            Diagnóstico detalhado da tabela principal de vendas e estrutura comercial.
          </p>
        </div>
        <Button onClick={fetchData} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Atualizar Dados
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro na Análise</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? stats.totalRows.toLocaleString() : '-'}</div>
            <p className="text-xs text-muted-foreground">Linhas na tabela bd-cl</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Última Venda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? new Date(stats.lastUpdate).toLocaleDateString() : '-'}
            </div>
            <p className="text-xs text-muted-foreground">Data de emissão mais recente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status da Estrutura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {supervisors.length > 0 ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
              <span className="font-bold">
                {supervisors.length > 0 ? 'Operacional' : 'Verificar Dados'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {supervisors.length} supervisores identificados
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-[500px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Supervisores ({supervisors.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
            ) : (
              <ul className="space-y-2">
                {supervisors.map((sup, i) => (
                  <li key={i} className="p-2 bg-secondary/20 rounded text-sm font-mono border border-transparent hover:border-primary/20 transition-colors">
                    {sup}
                  </li>
                ))}
                {supervisors.length === 0 && !loading && (
                  <li className="text-muted-foreground italic">Nenhum supervisor encontrado. Verifique a coluna "Nome Supervisor".</li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="h-[500px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Vendedores ({sellers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
            ) : (
              <ul className="space-y-2">
                {sellers.map((vend, i) => (
                  <li key={i} className="p-2 bg-secondary/20 rounded text-sm font-mono border border-transparent hover:border-primary/20 transition-colors">
                    {vend}
                  </li>
                ))}
                {sellers.length === 0 && !loading && (
                  <li className="text-muted-foreground italic">Nenhum vendedor encontrado. Verifique a coluna "Nome Vendedor".</li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnaliseProfundaPage;