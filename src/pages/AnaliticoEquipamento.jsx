import React, { useEffect, useState, useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatNumber } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Package, TrendingUp, Users } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const AnaliticoEquipamento = () => {
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
    console.log('[AnaliticoEquipamento] Filters:', filters);
    console.log('[AnaliticoEquipamento] Dates:', { startDateStr, endDateStr });
  }, [filters, startDateStr, endDateStr]);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Buscar apenas CFOs de Equipamento
        let query = supabase
          .from('bd-cl')
          .select('Descricao, Quantidade, Total, Cliente, Cfo')
          .gte('DT Emissao', startDateStr)
          .lte('DT Emissao', endDateStr)
          .in('Cfo', ['5908', '6551', '6908', '5551']) // CFOs de Equipamento
          .gt('Total', 0);

        if (filters.supervisors?.length > 0) query = query.in('Nome Supervisor', filters.supervisors);
        
        const { data, error: supabaseError } = await query.abortSignal(controller.signal);

        if (supabaseError) throw supabaseError;
        setRawData(data || []);

      } catch (err) {
        console.error("Erro Equipamentos:", err);
        if (err.name === 'AbortError') setError("Timeout. Tente um período menor.");
        else setError("Erro ao buscar dados de equipamentos.");
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

  const { aggregatedData, kpis } = useMemo(() => {
    if (!rawData.length) return { aggregatedData: [], kpis: { totalRevenue: 0, totalCount: 0, uniqueClients: 0 } };

    const items = {};
    const uniqueClients = new Set();
    let totalRevenue = 0;
    let totalCount = 0;

    rawData.forEach(row => {
      const name = row.Descricao || 'Desconhecido';
      if (!items[name]) items[name] = { equipment_name: name, equipment_count: 0, total_revenue: 0, clients: new Set() };
      
      items[name].equipment_count += (row.Quantidade || 0);
      items[name].total_revenue += (row.Total || 0);
      items[name].clients.add(row.Cliente);
      
      uniqueClients.add(row.Cliente);
      totalRevenue += (row.Total || 0);
      totalCount += (row.Quantidade || 0);
    });

    const aggregatedData = Object.values(items).map(item => ({
      ...item,
      client_count: item.clients.size
    })).sort((a, b) => b.total_revenue - a.total_revenue);

    return { 
      aggregatedData, 
      kpis: { totalRevenue, totalCount, uniqueClients: uniqueClients.size } 
    };
  }, [rawData]);

  if (loading && !rawData.length) return <div className="h-96 flex items-center justify-center"><LoadingSpinner message="Analisando equipamentos..." /></div>;
  if (error) return <Alert variant="destructive" className="m-6"><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Análise de Equipamentos</h1>
        <p className="text-muted-foreground mt-1">Performance detalhada por tipo (Consulta Direta)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600"><TrendingUp className="h-6 w-6" /></div>
            <div><p className="text-sm font-medium text-muted-foreground">Receita Gerada</p><h3 className="text-2xl font-bold">{formatCurrency(kpis.totalRevenue)}</h3></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600"><Package className="h-6 w-6" /></div>
            <div><p className="text-sm font-medium text-muted-foreground">Total Movimentado</p><h3 className="text-2xl font-bold">{formatNumber(kpis.totalCount)} un.</h3></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600"><Users className="h-6 w-6" /></div>
            <div><p className="text-sm font-medium text-muted-foreground">Clientes Envolvidos</p><h3 className="text-2xl font-bold">{formatNumber(kpis.uniqueClients)}</h3></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Desempenho por Equipamento</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipamento</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Clientes</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-right">Ticket Médio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aggregatedData.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{item.equipment_name}</TableCell>
                  <TableCell className="text-right">{formatNumber(item.equipment_count)}</TableCell>
                  <TableCell className="text-right">{formatNumber(item.client_count)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.total_revenue)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.total_revenue / (item.equipment_count || 1))}</TableCell>
                </TableRow>
              ))}
              {aggregatedData.length === 0 && <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Nenhum dado encontrado.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnaliticoEquipamento;