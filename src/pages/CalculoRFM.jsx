
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useFilters } from '@/contexts/FilterContext';
import DashboardHeader from '@/components/DashboardHeader';
import { PageActionProvider } from '@/contexts/PageActionContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Crown, Heart, Sparkles, UserX, UserCheck, HelpCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { formatDateForAPI } from '@/lib/utils';

const rfmSegments = {
  'Campeões': { icon: Crown, color: 'bg-yellow-400', description: 'Compram com frequência, recentemente e gastam muito. Recompense-os.' },
  'Clientes Fiéis': { icon: Heart, color: 'bg-red-500', description: 'Compram com frequência, mas podem precisar de um incentivo para gastar mais.' },
  'Potenciais Fiéis': { icon: Sparkles, color: 'bg-sky-500', description: 'Compraram recentemente, mas com frequência e valores medianos. Incentive a repetição.' },
  'Novos Clientes': { icon: UserCheck, color: 'bg-green-500', description: 'Primeiras compras recentes. Ofereça uma ótima experiência inicial.' },
  'Hibernando': { icon: UserX, color: 'bg-slate-400', description: 'Não compram há muito tempo e com baixa frequência. Reative com ofertas especiais.' },
  'Em Risco': { icon: AlertTriangle, color: 'bg-orange-500', description: 'Compraram bastante no passado, mas não retornam há algum tempo. Risco de churn.' },
  'Precisam de Atenção': { icon: HelpCircle, color: 'bg-purple-500', description: 'Recência e valor monetário acima da média, mas baixa frequência.' },
  'Promissores': { icon: UserCheck, color: 'bg-blue-400', description: 'Recentes, mas com baixa frequência ou valor. Potencial para se tornarem fiéis.' },
};

const CalculoRFM = ({ isTab }) => {
  const { filters } = useFilters();
  
  // Mapeamento correto de parâmetros para a RPC unificada
  const params = useMemo(() => ({
    p_start_date: formatDateForAPI(filters.dateRange?.from),
    p_end_date: formatDateForAPI(filters.dateRange?.to),
    p_exclude_employees: filters.excludeEmployees,
    p_supervisors: filters.supervisors?.length > 0 ? filters.supervisors : null,
    p_sellers: filters.sellers?.length > 0 ? filters.sellers : null,
    p_customer_groups: filters.customerGroups?.length > 0 ? filters.customerGroups : null,
    p_regions: filters.regions?.length > 0 ? filters.regions : null,
    p_clients: filters.clients?.length > 0 ? filters.clients : null,
    p_search_term: filters.searchTerm || null,
  }), [filters]);

  const { data, loading, error } = useAnalyticalData('get_rfm_analysis', params);

  const segmentSummary = useMemo(() => {
    if (!data || !Array.isArray(data)) return {};
    return data.reduce((acc, client) => {
      const segment = client.segment || 'Outros';
      if (!acc[segment]) {
        acc[segment] = { count: 0, totalMonetary: 0, clients: [] };
      }
      acc[segment].count++;
      acc[segment].totalMonetary += client.monetary;
      acc[segment].clients.push(client);
      return acc;
    }, {});
  }, [data]);
  
  const content = (
    <div className="space-y-6">
      {loading && <LoadingSpinner message="Calculando segmentos RFM..." />}
      {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Erro na Análise RFM</AlertTitle><AlertDescription>{error.message || 'Erro desconhecido'}</AlertDescription></Alert>}

      {!loading && !error && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(segmentSummary).sort(([a], [b]) => a.localeCompare(b)).map(([segment, summary]) => {
              const config = rfmSegments[segment] || { icon: HelpCircle, color: 'bg-gray-400' };
              const Icon = config.icon;
              return (
                <Card key={segment}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{segment}</CardTitle>
                    <Icon className={`h-4 w-4 text-muted-foreground ${config.color.replace('bg-', 'text-')}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary.count.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      Clientes neste segmento
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes dos Segmentos</CardTitle>
              <CardDescription>Análise detalhada de cada cliente classificado por Recência, Frequência e Valor Monetário.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Segmento</TableHead>
                    <TableHead className="text-right">Recência (dias)</TableHead>
                    <TableHead className="text-right">Frequência</TableHead>
                    <TableHead className="text-right">Valor Monetário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data && data.slice(0, 500).map((client, index) => {
                     const config = rfmSegments[client.segment] || { color: 'bg-gray-400' };
                     return (
                        <TableRow key={index}>
                            <TableCell className="font-medium">{client.clientName}</TableCell>
                            <TableCell>
                            <Badge className={`${config.color} text-white hover:${config.color} opacity-90`}>{client.segment}</Badge>
                            </TableCell>
                            <TableCell className="text-right">{client.recency}</TableCell>
                            <TableCell className="text-right">{client.frequency}</TableCell>
                            <TableCell className="text-right">{client.monetary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                        </TableRow>
                     )
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
    <PageActionProvider>
      <Helmet>
        <title>Análise RFM - Lavos 360</title>
        <meta name="description" content="Segmentação de clientes por Recência, Frequência e Valor Monetário." />
      </Helmet>
      <DashboardHeader title="Análise RFM" description="Segmentação de clientes por Recência, Frequência e Valor Monetário." />
      <div className="p-4 sm:p-6 lg:p-8">
        {content}
      </div>
    </PageActionProvider>
  );
};

export default CalculoRFM;
