
import React, { useMemo } from 'react';
import { useFilters } from '@/hooks/useFilters';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState, ErrorState, EmptyState } from '@/components/common';
import { Download, Mail } from 'lucide-react';
import { BonificacoesFilters } from './components/BonificacoesFilters';
import { formatDateForAPI } from '@/lib/utils';

export default function BonificacoesRelatorio() {
  const { filters } = useFilters();
  const { toast } = useToast();

  const dateRange = filters.dateRange || { from: new Date(), to: new Date() };

  const params = useMemo(() => ({
    p_start_date: formatDateForAPI(dateRange.from || new Date()),
    p_end_date: formatDateForAPI(dateRange.to || new Date()),
    p_supervisors: filters.supervisors,
    p_sellers: filters.sellers,
    p_regions: filters.regions,
  }), [filters, dateRange]);

  const { data: reportData, loading, error, retry } = useAnalyticalData(
    'get_bonificacoes_report',
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
      <h1 className="text-3xl font-bold tracking-tight">Relatório de Bonificações</h1>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <BonificacoesFilters />
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" /> Exportar PDF
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" /> Exportar Excel
              </Button>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" /> Email
              </Button>
            </div>
          </div>

          {!reportData || reportData.length === 0 ? (
            <EmptyState description="Nenhum dado encontrado para relatório." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">Total de Bonificações</p>
                  <p className="text-3xl font-bold">{reportData.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">Ativas</p>
                  <p className="text-3xl font-bold">
                    {reportData.filter(b => b.status === 'ativa').length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">Pausadas</p>
                  <p className="text-3xl font-bold">
                    {reportData.filter(b => b.status === 'pausada').length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">Inativas</p>
                  <p className="text-3xl font-bold">
                    {reportData.filter(b => b.status === 'inativa').length}
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
