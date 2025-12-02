import React, { useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState, ErrorState, EmptyState } from '@/components/common';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatDateForAPI } from '@/lib/utils';

/**
 * AnaliticoSupervisor Component
 */
export function AnaliticoSupervisor() {
  const { filters } = useFilters();
  const { toast } = useToast();

  // ===== CONSTRUIR PARÂMETROS =====
  const params = useMemo(() => ({
    // CORREÇÃO: Usar formatDateForAPI para evitar problemas de UTC/Timezone
    p_start_date: formatDateForAPI(filters.dateRange[0]),
    p_end_date: formatDateForAPI(filters.dateRange[1]),
    p_exclude_employees: filters.excludeEmployees || false,
    p_supervisors: filters.supervisors?.map(id => String(id)) || null,
    p_sellers: filters.sellers?.map(id => String(id)) || null,
    p_regions: filters.regions?.map(id => String(id)) || null,
    p_clients: filters.clients?.map(id => String(id)) || null,
    p_customer_groups: filters.customerGroups?.map(id => String(id)) || null,
    p_search_term: filters.searchTerm || null,
  }), [filters]);

  // ===== CHAMAR RPC =====
  const { data: rawData, loading, error, retry } = useAnalyticalData(
    'get_supervisor_summary_v2',
    params,
    {
      onError: (err) => {
        toast({
          title: 'Erro ao carregar dados',
          description: err.message,
          variant: 'destructive',
        });
      },
    }
  );

  // ===== PROCESSAR DADOS =====
  const chartData = useMemo(() => {
    if (!rawData || !Array.isArray(rawData)) {
      return [];
    }

    return rawData.map(item => ({
      name: item.name,
      sales: Number(item.sales),
    }));
  }, [rawData]);

  // ===== RENDERIZAR: Loading =====
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analítico Supervisor</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingState message="Carregando dados de supervisores..." />
        </CardContent>
      </Card>
    );
  }

  // ===== RENDERIZAR: Erro =====
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analítico Supervisor</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState error={error} onRetry={retry} />
        </CardContent>
      </Card>
    );
  }

  // ===== RENDERIZAR: Sem dados =====
  if (!rawData || rawData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analítico Supervisor</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState message="Nenhum dado disponível para o período selecionado" />
        </CardContent>
      </Card>
    );
  }

  // ===== RENDERIZAR: Gráfico =====
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analítico Supervisor</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(val) => `R$${(val / 1000).toFixed(0)}k`} width={80} />
            <Tooltip 
              formatter={(value) => [formatCurrency(value), 'Vendas']}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend />
            <Bar dataKey="sales" fill="#6366f1" name="Vendas" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default AnaliticoSupervisor;