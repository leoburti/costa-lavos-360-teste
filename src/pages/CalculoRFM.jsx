
import React, { useEffect, useState, useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const SEGMENT_COLORS = {
  'Campeões': '#15803d',
  'Clientes Fiéis': '#22c55e',
  'Potenciais Fiéis': '#84cc16',
  'Novos Clientes': '#3b82f6',
  'Promissores': '#a855f7',
  'Precisam de Atenção': '#f97316',
  'Em Risco': '#ef4444',
  'Hibernando': '#64748b'
};

const CalculoRFM = () => {
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
    console.log('[CalculoRFM] Filters:', filters);
    console.log('[CalculoRFM] Dates:', { startDateStr, endDateStr });
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
          .select('Cliente, Nome, "N Fantasia", Total, "DT Emissao", Pedido, Cfo')
          .gte('DT Emissao', startDateStr)
          .lte('DT Emissao', endDateStr)
          .gt('Total', 0);

        if (filters.supervisors?.length > 0) query = query.in('Nome Supervisor', filters.supervisors);
        
        const { data, error: supabaseError } = await query.abortSignal(controller.signal);

        if (supabaseError) throw supabaseError;
        setRawData(data || []);

      } catch (err) {
        console.error("Erro RFM:", err);
        if (err.name === 'AbortError') setError("Timeout na consulta. Tente um intervalo menor.");
        else setError("Erro ao calcular RFM.");
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

  const chartData = useMemo(() => {
    if (!rawData.length) return [];

    const clients = {};
    const today = new Date();

    rawData.forEach(row => {
      if (['5910', '6910', '5908', '6551', '6908', '5551'].includes(String(row.Cfo))) return;

      const id = row.Cliente;
      if (!clients[id]) {
        clients[id] = {
          id,
          clientName: row['N Fantasia'] || row.Nome,
          total: 0,
          orders: new Set(),
          lastDate: new Date(0) // epoch
        };
      }
      clients[id].total += row.Total;
      clients[id].orders.add(row.Pedido);
      const date = new Date(row['DT Emissao']);
      if (date > clients[id].lastDate) clients[id].lastDate = date;
    });

    const processed = Object.values(clients).map(c => {
      const recency = Math.ceil(Math.abs(today - c.lastDate) / (1000 * 60 * 60 * 24));
      const frequency = c.orders.size;
      const monetary = c.total;

      // Simple segmentation logic (simplified RFM)
      let segment = 'Promissores';
      if (frequency >= 4 && monetary > 10000) segment = 'Campeões';
      else if (frequency >= 3) segment = 'Clientes Fiéis';
      else if (recency <= 30 && frequency === 1) segment = 'Novos Clientes';
      else if (recency > 90) segment = 'Hibernando';
      else if (recency > 60) segment = 'Em Risco';
      else if (monetary > 5000) segment = 'Potenciais Fiéis';
      else if (recency > 30 && frequency < 2) segment = 'Precisam de Atenção';

      return { ...c, recency, frequency, monetary, segment };
    });

    // Group by segment for chart
    const grouped = {};
    processed.forEach(p => {
      if (!grouped[p.segment]) grouped[p.segment] = [];
      grouped[p.segment].push(p);
    });

    return Object.entries(grouped).map(([key, value]) => ({
      name: key,
      data: value,
      color: SEGMENT_COLORS[key] || '#888'
    }));
  }, [rawData]);

  if (loading && !rawData.length) return <div className="h-96 flex items-center justify-center"><LoadingSpinner message="Calculando Matriz RFM..." /></div>;
  
  if (error) return <Alert variant="destructive" className="m-6"><AlertTriangle className="h-4 w-4"/><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Matriz RFM</h1>
        <p className="text-muted-foreground mt-1">Recência, Frequência e Valor Monetário (Consulta Direta)</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Distribuição de Clientes</CardTitle></CardHeader>
        <CardContent className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="recency" name="Recência" label={{ value: 'Dias sem compra', position: 'insideBottom', offset: -10 }} reversed />
              <YAxis type="number" dataKey="monetary" name="Valor" unit="R$" label={{ value: 'Valor Total', angle: -90, position: 'insideLeft' }} />
              <ZAxis type="number" dataKey="frequency" range={[50, 400]} name="Frequência" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
                if (payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border rounded shadow-lg text-sm">
                      <p className="font-bold">{d.clientName}</p>
                      <p>Seg: {d.segment}</p>
                      <p>Rec: {d.recency} dias</p>
                      <p>Val: {formatCurrency(d.monetary)}</p>
                      <p>Freq: {d.frequency} pedidos</p>
                    </div>
                  );
                }
                return null;
              }} />
              <Legend />
              {chartData.map((s) => (
                <Scatter key={s.name} name={s.name} data={s.data} fill={s.color} />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalculoRFM;
