
import React, { useEffect, useState, useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency, formatNumber } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Activity } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const COLORS = {
  'A+': '#15803d', // green-700
  'A': '#22c55e',  // green-500
  'B': '#eab308',  // yellow-500
  'C': '#f97316',  // orange-500
  'D': '#ef4444',  // red-500
  'E': '#94a3b8'   // slate-400
};

const CurvaABC = () => {
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
    console.log('[CurvaABC] Filters:', filters);
    console.log('[CurvaABC] Dates:', { startDateStr, endDateStr });
  }, [filters, startDateStr, endDateStr]);

  useEffect(() => {
    if (!startDateStr || !endDateStr) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let query = supabase
          .from('bd-cl')
          .select('Cliente, Nome, "N Fantasia", Total, Cfo')
          .gte('DT Emissao', startDateStr)
          .lte('DT Emissao', endDateStr)
          .gt('Total', 0);

        if (filters.supervisors?.length > 0) query = query.in('Nome Supervisor', filters.supervisors);
        if (filters.sellers?.length > 0) query = query.in('Nome Vendedor', filters.sellers);
        
        const { data, error: supabaseError } = await query.abortSignal(controller.signal);

        if (supabaseError) throw supabaseError;
        setRawData(data || []);

      } catch (err) {
        console.error("Erro CurvaABC:", err);
        if (err.name === 'AbortError') setError("Tempo limite excedido. Reduza o período.");
        else setError("Erro ao calcular Curva ABC.");
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

  const analysis = useMemo(() => {
    if (!rawData.length) return {};

    const clientTotals = {};
    let grandTotal = 0;

    rawData.forEach(row => {
      if (['5910', '6910', '5908', '6551', '6908', '5551'].includes(String(row.Cfo))) return;
      
      const id = row.Cliente;
      if (!clientTotals[id]) {
        clientTotals[id] = {
          name: row['N Fantasia'] || row.Nome || `Client ${id}`,
          revenue: 0
        };
      }
      clientTotals[id].revenue += row.Total;
      grandTotal += row.Total;
    });

    const grouped = { 'A+': [], 'A': [], 'B': [], 'C': [], 'D': [], 'E': [] };
    const kpis = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0 };
    const revenues = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0 };

    Object.values(clientTotals).forEach(client => {
      let category = 'E';
      if (client.revenue > 40000) category = 'A+';
      else if (client.revenue > 25000) category = 'A';
      else if (client.revenue > 15000) category = 'B';
      else if (client.revenue > 8000) category = 'C';
      else if (client.revenue > 4000) category = 'D';

      grouped[category].push(client);
      kpis[category]++;
      revenues[category] += client.revenue;
    });

    // Sort clients within groups
    Object.keys(grouped).forEach(key => {
      grouped[key] = grouped[key].sort((a, b) => b.revenue - a.revenue);
    });

    const chartData = Object.entries(revenues)
      .map(([key, value]) => ({
        name: `Classe ${key}`,
        value: value,
        count: kpis[key],
        key
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);

    return { grouped, revenues, kpis, chartData, grandTotal };
  }, [rawData]);

  if (loading && !rawData.length) return <div className="h-96 flex items-center justify-center"><LoadingSpinner message="Calculando ABC..." /></div>;

  if (error) return <Alert variant="destructive" className="m-6"><AlertTriangle className="h-4 w-4"/><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Curva ABC Projetada</h1>
          <p className="text-muted-foreground mt-1">
            Classificação baseada em receita (Consulta Direta)
          </p>
        </div>
        {loading && <Activity className="h-5 w-5 animate-spin text-blue-600" />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Distribuição de Receita</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analysis.chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {analysis.chartData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.key] || '#ccc'} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {['A+', 'A', 'B', 'C', 'D', 'E'].map(cls => {
            if (!analysis.kpis || analysis.kpis[cls] === 0) return null;
            const percentage = analysis.grandTotal > 0 ? (analysis.revenues[cls] / analysis.grandTotal * 100) : 0;

            return (
              <Card key={cls}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Badge style={{ backgroundColor: COLORS[cls] }} className="text-white border-none">Classe {cls}</Badge>
                      <span className="text-base font-normal text-muted-foreground">
                        {formatNumber(analysis.kpis[cls])} clientes ({formatNumber(percentage)}% da receita)
                      </span>
                    </CardTitle>
                    <span className="font-bold text-lg">{formatCurrency(analysis.revenues[cls])}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {analysis.grouped[cls]?.slice(0, 100).map((client, idx) => ( // Limit to 100 to prevent lag
                        <div key={idx} className="flex justify-between items-center p-2 rounded bg-slate-50 text-sm border border-slate-100">
                          <span className="font-medium truncate max-w-[200px]" title={client.name}>{client.name}</span>
                          <span className="text-muted-foreground">{formatCurrency(client.revenue)}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CurvaABC;
