
import React, { useEffect, useState, useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Gift, Award, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const ProdutosBonificados = () => {
  const { filters } = useFilters();
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Correct date access and formatting
  const dateRange = filters.dateRange || { from: startOfMonth(new Date()), to: endOfMonth(new Date()) };
  const startDateStr = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const endDateStr = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : format(endOfMonth(new Date()), 'yyyy-MM-dd');

  // Debug Logs
  useEffect(() => {
    console.log('[ProdutosBonificados] Filters:', filters);
    console.log('[ProdutosBonificados] Dates:', { startDateStr, endDateStr });
  }, [filters, startDateStr, endDateStr]);

  useEffect(() => {
    if (!startDateStr || !endDateStr) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Buscar apenas CFOs de Bonificação
        let query = supabase
          .from('bd-cl')
          .select('Descricao, Total, "Nome Supervisor", Cfo')
          .gte('DT Emissao', startDateStr)
          .lte('DT Emissao', endDateStr)
          .in('Cfo', ['5910', '6910']) // CFOs de Bonificação
          .gt('Total', 0);

        if (filters.supervisors?.length > 0) query = query.in('Nome Supervisor', filters.supervisors);
        
        const { data, error: supabaseError } = await query.abortSignal(controller.signal);

        if (supabaseError) throw supabaseError;
        setRawData(data || []);

      } catch (err) {
        console.error("Erro Bonificacao:", err);
        if (err.name === 'AbortError') setError("Timeout. Tente um período menor.");
        else setError("Erro ao buscar dados de bonificação.");
      } finally {
        setLoading(false);
        clearTimeout(timeoutId);
      }
    };

    fetchData();
    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [filters, startDateStr, endDateStr]);

  const { kpis, topProducts } = useMemo(() => {
    if (!rawData.length) return { kpis: {}, topProducts: [] };

    const products = {};
    const supervisors = {};

    rawData.forEach(row => {
      const prodName = row.Descricao || 'Outros';
      const supName = row['Nome Supervisor'] || 'N/D';
      
      if (!products[prodName]) products[prodName] = 0;
      products[prodName] += row.Total;

      if (!supervisors[supName]) supervisors[supName] = 0;
      supervisors[supName] += row.Total;
    });

    const sortedProducts = Object.entries(products)
      .map(([name, val]) => ({ product_name: name, total_bonified: val }))
      .sort((a, b) => b.total_bonified - a.total_bonified)
      .slice(0, 10);

    const sortedSupervisors = Object.entries(supervisors).sort((a, b) => b[1] - a[1]);
    
    const kpis = {
      mostBonifiedProduct: sortedProducts[0]?.product_name || 'N/A',
      topSupervisor: sortedSupervisors[0] ? `${sortedSupervisors[0][0]} (${formatCurrency(sortedSupervisors[0][1])})` : 'N/A',
      bottomSupervisor: sortedSupervisors.length > 0 ? `${sortedSupervisors[sortedSupervisors.length - 1][0]} (${formatCurrency(sortedSupervisors[sortedSupervisors.length - 1][1])})` : 'N/A'
    };

    return { kpis, topProducts: sortedProducts };
  }, [rawData]);

  if (loading && !rawData.length) return <div className="h-96 flex items-center justify-center"><LoadingSpinner message="Carregando bonificações..." /></div>;
  if (error) return <Alert variant="destructive" className="m-6"><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Produtos Bonificados</h1>
        <p className="text-muted-foreground mt-1">Análise de investimento em bonificações (Consulta Direta)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div><p className="text-sm font-medium text-muted-foreground">Produto + Bonificado</p><h3 className="text-lg font-bold mt-1 line-clamp-2" title={kpis.mostBonifiedProduct}>{kpis.mostBonifiedProduct}</h3></div>
              <Gift className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div><p className="text-sm font-medium text-muted-foreground">Top Supervisor</p><h3 className="text-lg font-bold mt-1">{kpis.topSupervisor}</h3></div>
              <Award className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-green-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div><p className="text-sm font-medium text-muted-foreground">Menor Investimento</p><h3 className="text-lg font-bold mt-1">{kpis.bottomSupervisor}</h3></div>
              <AlertTriangle className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Top 10 Produtos Bonificados (Valor)</CardTitle></CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" tickFormatter={(val) => `R$${val/1000}k`} />
              <YAxis dataKey="product_name" type="category" width={180} tick={{fontSize: 12}} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="total_bonified" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProdutosBonificados;
