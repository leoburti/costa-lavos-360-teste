import React, { useMemo } from 'react';
import { useFilters } from '@/hooks/useFilters';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState, ErrorState, EmptyState } from '@/components/common';
import { Download, Mail } from 'lucide-react';
import { CrmFilters } from './components/CrmFilters';

export default function CrmRelatorio() {
  const { filters } = useFilters();
  const { toast } = useToast();

  const dateRange = filters.dateRange || [new Date(), new Date()];

  const params = useMemo(() => ({
    p_start_date: dateRange[0],
    p_end_date: dateRange[1],
    p_supervisors: filters.supervisors,
    p_sellers: filters.sellers,
    p_regions: filters.regions,
  }), [filters, dateRange]);

  const { data: reportData, loading, error, retry } = useAnalyticalData(
    'get_crm_relatorio',
    params,
    {
      onError: (err) => {
        toast({
          title: 'Erro ao carregar relatório',
          description: err.message,
          variant: 'destructive',
        });
      },
    }
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Relatório CRM</h1>
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <CrmFilters />
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" /> PDF
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" /> Excel
              </Button>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" /> Email
              </Button>
            </div>
          </div>

          {!reportData || reportData.length === 0 ? (
            <EmptyState description="Nenhum dado para relatório." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">Total de Clientes</p>
                  <p className="text-3xl font-bold">{reportData.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">Oportunidades Ativas</p>
                  <p className="text-3xl font-bold">
                    {reportData.reduce((sum, r) => sum + (r.oportunidades_count || 0), 0)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="text-3xl font-bold">
                    R$ {reportData.reduce((sum, r) => sum + (r.value || 0), 0).toLocaleString('pt-BR')}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">Ativos</p>
                  <p className="text-3xl font-bold">
                    {reportData.filter(r => r.status === 'active' || r.status === 'ativo').length}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}