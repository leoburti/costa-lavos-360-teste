import React, { useEffect, useState, useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext'; // Import Context
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import DashboardLoading from '@/components/DashboardLoading';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const DashboardAnalytico = () => {
  const { filters } = useFilters(); // Use global filters
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Correct date access and formatting
  const dateRange = filters.dateRange || { from: startOfMonth(new Date()), to: endOfMonth(new Date()) };
  const startDateStr = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const endDateStr = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : format(endOfMonth(new Date()), 'yyyy-MM-dd');

  // Debug Logs
  useEffect(() => {
    console.log('[DashboardAnalytico] Filters:', filters);
    console.log('[DashboardAnalytico] Dates:', { startDateStr, endDateStr });
  }, [filters, startDateStr, endDateStr]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased timeout for analytics

    try {
      let query = supabase
        .from('bd-cl')
        .select('Total, "Cond. Pagto", "Desc.Regiao", Cfo, "Nome Supervisor"')
        .gte('DT Emissao', startDateStr)
        .lte('DT Emissao', endDateStr)
        .gt('Total', 0);

      // Apply additional filters
      if (filters.supervisors?.length > 0) query = query.in('Nome Supervisor', filters.supervisors);
      if (filters.sellers?.length > 0) query = query.in('Nome Vendedor', filters.sellers);
      if (filters.regions?.length > 0) query = query.in('Desc.Regiao', filters.regions);
      
      const { data: rawData, error: supabaseError } = await query.limit(5000).abortSignal(controller.signal);

      if (supabaseError) throw supabaseError;
      setData(rawData || []);

    } catch (err) {
      console.error("Analytico Load Error:", err);
      if (err.name === 'AbortError') {
        setError("Timeout na consulta.");
      } else {
        setError("Falha ao carregar dados analíticos.");
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters, startDateStr, endDateStr]);

  const chartsData = useMemo(() => {
    if (!data || data.length === 0) return { payment: [], supervisor: [], cfo: [] };

    const paymentMap = {};
    const supervisorMap = {};
    const cfoMap = {};

    data.forEach(item => {
      const val = item.Total || 0;
      
      // Payment Methods
      const payment = item['Cond. Pagto'] || 'Outros';
      paymentMap[payment] = (paymentMap[payment] || 0) + val;

      // Supervisor
      const sup = item['Nome Supervisor'] || 'N/D';
      supervisorMap[sup] = (supervisorMap[sup] || 0) + val;

      // CFO (Operation Type)
      const cfo = String(item.Cfo);
      let type = 'Venda';
      if (['5910', '6910'].includes(cfo)) type = 'Bonificação';
      if (['5908', '6551', '6908', '5551'].includes(cfo)) type = 'Equipamento';
      cfoMap[type] = (cfoMap[type] || 0) + val;
    });

    const toChartData = (map) => Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      payment: toChartData(paymentMap).slice(0, 6), // Top 6
      supervisor: toChartData(supervisorMap).slice(0, 10), // Top 10
      cfo: toChartData(cfoMap)
    };
  }, [data]);

  if (loading || (error && (!data || data.length === 0))) {
    return <DashboardLoading loading={loading} error={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Análise de Distribuição</h1>
          <p className="text-muted-foreground mt-1">
            Distribuição de vendas por canal, pagamento e tipo.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {error && (
        <Alert variant="warning" className="bg-orange-50 border-orange-200 text-orange-800">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle>Status da Conexão</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Method Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Condição de Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartsData.payment}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartsData.payment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Operation Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Tipo de Operação (Valor)</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartsData.cfo}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartsData.cfo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#2563eb' : index === 1 ? '#9333ea' : '#16a34a'} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => formatCurrency(val)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Supervisor Distribution */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Top 10 Supervisores por Volume</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartsData.supervisor} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} height={60} angle={-15} textAnchor="end" />
                <YAxis tickFormatter={(val) => `R$${formatNumber(val/1000)}k`} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [formatCurrency(value), 'Volume']}
                />
                <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardAnalytico;