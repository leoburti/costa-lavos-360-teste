
import React, { useState, useMemo, useEffect } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, RefreshCw, TrendingDown, Minus } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const TendenciaVendas = () => {
  const { filters } = useFilters();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Correct date access and formatting
  const dateRange = filters.dateRange || { from: startOfMonth(new Date()), to: endOfMonth(new Date()) };
  const startDateStr = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const endDateStr = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : format(endOfMonth(new Date()), 'yyyy-MM-dd');

  // Debug Logs
  useEffect(() => {
    console.log('[TendenciaVendas] Filters:', filters);
    console.log('[TendenciaVendas] Dates:', { startDateStr, endDateStr });
  }, [filters, startDateStr, endDateStr]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Para tendência, geralmente queremos ver um período um pouco maior para ver a curva,
      // mas vamos respeitar o filtro do usuário para a análise principal.
      // Se o usuário selecionar 1 mês, mostramos os dias. Se for > 3 meses, mostramos meses.
      
      const diffTime = Math.abs(new Date(endDateStr) - new Date(startDateStr));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      let query = supabase
        .from('bd-cl')
        .select('Total, "DT Emissao", Cfo')
        .gte('DT Emissao', startDateStr)
        .lte('DT Emissao', endDateStr)
        .gt('Total', 0);

      // Filtros adicionais
      if (filters.supervisors?.length > 0) query = query.in('Nome Supervisor', filters.supervisors);
      if (filters.sellers?.length > 0) query = query.in('Nome Vendedor', filters.sellers);
      if (filters.regions?.length > 0) query = query.in('Desc.Regiao', filters.regions);
      if (filters.customerGroups?.length > 0) query = query.in('Nome Grp Cliente', filters.customerGroups);
      if (filters.clients?.length > 0) query = query.in('N Fantasia', filters.clients.map(c => c.label));

      const { data: rawData, error: supabaseError } = await query;

      if (supabaseError) throw supabaseError;

      // Processamento dos dados
      const salesByDate = {};
      
      rawData.forEach(row => {
        if (['5910', '6910', '5908', '6551', '6908', '5551'].includes(String(row.Cfo))) return; // Apenas vendas reais

        const dateKey = diffDays > 90 
          ? row['DT Emissao'].substring(0, 7) // YYYY-MM
          : row['DT Emissao'].substring(0, 10); // YYYY-MM-DD
        
        if (!salesByDate[dateKey]) salesByDate[dateKey] = 0;
        salesByDate[dateKey] += row.Total;
      });

      const chartData = Object.keys(salesByDate).sort().map(key => ({
        period: key,
        total: salesByDate[key],
        // Média móvel simples (placeholder, ideal seria calcular com janelas)
        media: salesByDate[key] // Placeholder para visualização
      }));

      // Calcular média móvel real (3 períodos)
      for(let i = 0; i < chartData.length; i++) {
        let sum = 0;
        let count = 0;
        for(let j = Math.max(0, i - 2); j <= i; j++) {
          sum += chartData[j].total;
          count++;
        }
        chartData[i].media = sum / count;
      }

      setData(chartData);

    } catch (err) {
      console.error("Erro Tendencia:", err);
      setError("Falha ao carregar dados de tendência.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters, startDateStr, endDateStr]);

  const trendInfo = useMemo(() => {
    if (data.length < 2) return { direction: 'neutral', percent: 0 };
    const last = data[data.length - 1].media;
    const first = data[0].media;
    const percent = first !== 0 ? ((last - first) / first) * 100 : 0;
    
    return {
      direction: percent > 5 ? 'up' : percent < -5 ? 'down' : 'neutral',
      percent: Math.abs(percent)
    };
  }, [data]);

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tendência de Vendas</h1>
          <p className="text-muted-foreground mt-1">Análise temporal do faturamento e média móvel.</p>
        </div>
        <Button onClick={fetchData} variant="outline" disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && !data.length ? (
        <div className="h-96 flex items-center justify-center"><LoadingSpinner /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Tendência do Período</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {trendInfo.direction === 'up' && <TrendingUp className="h-8 w-8 text-emerald-500" />}
                  {trendInfo.direction === 'down' && <TrendingDown className="h-8 w-8 text-red-500" />}
                  {trendInfo.direction === 'neutral' && <Minus className="h-8 w-8 text-slate-400" />}
                  <span className="text-2xl font-bold">
                    {trendInfo.percent.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Variação da média móvel (Início vs Fim)</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pico de Vendas</CardTitle></CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">
                  {data.length > 0 ? formatCurrency(Math.max(...data.map(d => d.total))) : 'R$ 0,00'}
                </span>
                <p className="text-xs text-muted-foreground mt-1">Melhor desempenho no período</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Menor Desempenho</CardTitle></CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">
                  {data.length > 0 ? formatCurrency(Math.min(...data.map(d => d.total))) : 'R$ 0,00'}
                </span>
                <p className="text-xs text-muted-foreground mt-1">Pior desempenho no período</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Evolução de Vendas & Média Móvel</CardTitle>
            </CardHeader>
            <CardContent className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="period" 
                    tick={{ fontSize: 12 }} 
                    tickFormatter={(val) => {
                      if (val.length === 7) { // YYYY-MM
                        const [y, m] = val.split('-');
                        return `${m}/${y}`;
                      }
                      // YYYY-MM-DD
                      const [y, m, d] = val.split('-');
                      return `${d}/${m}`;
                    }}
                  />
                  <YAxis tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value, name) => [formatCurrency(value), name === 'total' ? 'Vendas' : 'Média Móvel (3p)']}
                    labelFormatter={(label) => `Período: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="total" name="Vendas" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                  <Line type="monotone" dataKey="media" name="Média Móvel" stroke="#f59e0b" strokeWidth={3} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default TendenciaVendas;
