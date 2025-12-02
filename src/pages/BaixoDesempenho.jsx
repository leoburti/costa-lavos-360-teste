import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useFilters } from '@/hooks/useFilters';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import ClientPerformanceTable from '@/components/ClientPerformanceTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DollarSign, Users, TrendingDown } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

const BaixoDesempenho = ({ isTab }) => {
  const { filters } = useFilters();
  
  const { data, loading, error } = useAnalyticalData(
    'get_low_performance_clients',
    filters
  );

  const kpis = data?.kpis || {};
  const hierarchyData = data?.data || [];
  
  const content = (
    <div className="space-y-6">
      {!isTab && (
        <>
          <h1 className="text-3xl font-bold tracking-tight">Clientes de Baixo Desempenho</h1>
          <p className="text-muted-foreground">Identifique clientes com faturamento abaixo do esperado e oportunidades de recuperação.</p>
        </>
      )}

      {loading ? (
        <LoadingSpinner message="Analisando clientes de baixo desempenho..." />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes em Risco</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(kpis.totalClientsInRisk || 0)}</div>
                <p className="text-xs text-muted-foreground">Clientes com faturamento abaixo de R$ 3.000 no período</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Potencial Perdida</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(kpis.potentialLostRevenue || 0)}</div>
                <p className="text-xs text-muted-foreground">Valor necessário para atingir a meta de R$ 3.000</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Performance Média</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercentage(((kpis.totalRevenue || 0) / ((kpis.totalClientsInRisk || 1) * 3000)) * 100)}
                </div>
                <p className="text-xs text-muted-foreground">% da meta de R$ 3.000 atingida por este grupo</p>
              </CardContent>
            </Card>
          </div>
          <ClientPerformanceTable data={hierarchyData} />
        </>
      )}
    </div>
  );

  if (isTab) return content;

  return (
    <>
      <Helmet>
        <title>Baixo Desempenho - Costa Lavos</title>
      </Helmet>
      <div className="p-4 sm:p-6 lg:p-8">
        {content}
      </div>
    </>
  );
};

// Helper for formatting percentage
function formatPercentage(value) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0.00%';
  }
  return value.toFixed(2) + '%';
}

export default BaixoDesempenho;