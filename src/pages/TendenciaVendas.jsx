import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ChevronsRight, UserPlus, AlertCircle, BarChart } from "lucide-react";
import LoadingSpinner from '@/components/LoadingSpinner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const reasonConfig = {
  'AUMENTO_EXPRESSIVO': { text: 'Aumento Expressivo', color: 'bg-green-500', icon: <TrendingUp className="h-4 w-4" /> },
  'AUMENTO': { text: 'Aumento', color: 'bg-emerald-500', icon: <TrendingUp className="h-4 w-4" /> },
  'PROMISSOR': { text: 'Promissor', color: 'bg-sky-500', icon: <UserPlus className="h-4 w-4" /> },
  'ESTABILIDADE': { text: 'Estabilidade', color: 'bg-slate-500', icon: <ChevronsRight className="h-4 w-4" /> },
  'QUEDA_ACENTUADA': { text: 'Queda Acentuada', color: 'bg-yellow-500', icon: <TrendingDown className="h-4 w-4" /> },
  'RISCO_CHURN': { text: 'Risco de Churn', color: 'bg-red-500', icon: <TrendingDown className="h-4 w-4" /> },
  'INDEFINIDO': { text: 'Indefinido', color: 'bg-gray-400', icon: <BarChart className="h-4 w-4" /> },
};

const TendenciaVendas = ({ isTab = false }) => {
  const { filters } = useFilters();
  
  const dateRange = useMemo(() => filters.dateRange || { from: startOfMonth(new Date()), to: endOfMonth(new Date()) }, [filters.dateRange]);

  const params = useMemo(() => {
    const selectedClients = filters.clients ? filters.clients.map(c => c.value) : null;
    return {
      p_start_date: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null,
      p_end_date: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null,
      p_exclude_employees: filters.excludeEmployees,
      p_supervisors: filters.supervisors,
      p_sellers: filters.sellers,
      p_customer_groups: filters.customerGroups,
      p_regions: filters.regions,
      p_clients: selectedClients,
      p_search_term: filters.searchTerm,
      p_analysis_type: 'new_clients_90', 
    };
  }, [filters, dateRange]);

  const { data, loading, error } = useAnalyticalData('get_new_client_trends', params, { enabled: !!params.p_start_date && !!params.p_end_date });

  const summary = useMemo(() => {
    if (!data) return {};
    return data.reduce((acc, item) => {
      const reason = item.reason || 'INDEFINIDO';
      if (!acc[reason]) {
        acc[reason] = 0;
      }
      acc[reason]++;
      return acc;
    }, {});
  }, [data]);

  const content = (
     <div className="space-y-6">
      {!isTab && (
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tendência de Novos Clientes</h1>
          <p className="text-muted-foreground">Análise de comportamento de clientes nos últimos 90 dias.</p>
        </div>
      )}

      {loading && <LoadingSpinner message="Analisando tendências..." />}
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Erro na Análise</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

      {!loading && !error && data && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(summary).sort(([a], [b]) => a.localeCompare(b)).map(([reason, count]) => {
              const config = reasonConfig[reason] || reasonConfig['INDEFINIDO'];
              return (
                <Card key={reason}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{config.text}</CardTitle>
                    <div className={`${config.color} p-1.5 rounded-full text-white`}>{config.icon}</div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{count}</div>
                    <p className="text-xs text-muted-foreground">Clientes</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes dos Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead className="text-right">Variação de Receita</TableHead>
                    <TableHead>Tendência</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => {
                    const config = reasonConfig[item.reason] || reasonConfig['INDEFINIDO'];
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.clientName}</TableCell>
                        <TableCell>{item.seller}</TableCell>
                        <TableCell className={`text-right font-semibold ${item.trendChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.trendChange.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${config.color} text-white`}>{config.text}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  if (isTab) return content;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Helmet>
        <title>Tendência de Vendas - Costa Lavos</title>
      </Helmet>
      {content}
    </div>
  );
};

export default TendenciaVendas;