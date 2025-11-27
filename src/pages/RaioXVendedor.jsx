
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { User, TrendingUp, UserMinus, Award, Users } from 'lucide-react';

import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import KPICard from '@/components/supervisor/KPICard';
import { formatCurrency } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const RaioXVendedor = () => {
  const { filters } = useFilters();
  const [selectedSeller, setSelectedSeller] = useState(null);

  const startDate = filters.dateRange?.from ? format(filters.dateRange.from, 'yyyy-MM-dd') : format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const endDate = filters.dateRange?.to ? format(filters.dateRange.to, 'yyyy-MM-dd') : format(endOfMonth(new Date()), 'yyyy-MM-dd');

  const { filterOptions } = useFilters();
  const sellersList = filterOptions?.sellers || [];

  // Only include specific params required by get_seller_analytical_data
  const params = {
    p_start_date: startDate,
    p_end_date: endDate,
    p_seller_name: selectedSeller,
    p_exclude_employees: true
  };

  const { data, loading } = useAnalyticalData('get_seller_analytical_data', params, { enabled: !!selectedSeller });

  const kpis = data?.kpis || {};
  const clients = data?.client_performance || [];
  const churn = data?.churn_analysis || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Raio-X Vendedor | Costa Lavos</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Raio-X do Vendedor</h1>
          <p className="text-muted-foreground">Análise individual de performance e carteira.</p>
        </div>
        
        <div className="w-full md:w-64">
          <Select value={selectedSeller || ''} onValueChange={setSelectedSeller}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um Vendedor" />
            </SelectTrigger>
            <SelectContent>
              {sellersList.map((name) => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedSeller ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
            <div className="p-4 bg-white rounded-full shadow-sm mb-4">
              <User className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">Nenhum Vendedor Selecionado</h3>
            <p className="text-slate-500 max-w-md mt-2">
              Selecione um vendedor acima para visualizar seus indicadores.
            </p>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
           </div>
           <Skeleton className="h-[400px]" />
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Vendas Totais" value={formatCurrency(kpis.total_revenue)} icon={TrendingUp} color="emerald" />
            <KPICard title="Carteira Ativa" value={kpis.total_clients} icon={Users} color="blue" />
            <KPICard title="Ticket Médio" value={formatCurrency(kpis.average_ticket)} icon={Award} color="amber" />
            <KPICard 
              title="Saldo Clientes" 
              value={kpis.clients_gained - kpis.clients_lost} 
              subValue={`+${kpis.clients_gained} / -${kpis.clients_lost}`}
              icon={UserMinus} 
              color={kpis.clients_gained >= kpis.clients_lost ? "emerald" : "rose"} 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Client Ranking */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Performance por Cliente</CardTitle>
                <CardDescription>Top clientes no período</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead className="text-right">Vendas</TableHead>
                        <TableHead className="text-right">Pedidos</TableHead>
                        <TableHead className="text-center">Tendência</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map((client, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell className="text-right">{formatCurrency(client.total_revenue)}</TableCell>
                          <TableCell className="text-right">{client.sales_count}</TableCell>
                          <TableCell className="text-center">
                            {client.trend !== null ? (
                              <Badge variant={client.trend > 0 ? 'success' : 'destructive'}>
                                {client.trend > 0 ? '+' : ''}{(client.trend * 100).toFixed(1)}%
                              </Badge>
                            ) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Churn Status */}
            <Card>
              <CardHeader>
                <CardTitle>Saúde da Carteira</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {churn.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-700">{item.phase}</span>
                    <Badge variant="secondary">{item.client_count} clientes</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default RaioXVendedor;
