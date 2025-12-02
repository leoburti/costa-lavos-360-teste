import React, { useMemo } from 'react';
import { useFilters } from '@/hooks/useFilters';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState, ErrorState, EmptyState } from '@/components/common';
import { CrmFilters } from './components/CrmFilters';
import { CrmKanban } from './components/CrmKanban';

export default function CrmOportunidades() {
  const { filters } = useFilters();
  const { toast } = useToast();

  const dateRange = filters.dateRange || [new Date(), new Date()];

  const params = useMemo(() => ({
    p_start_date: dateRange[0],
    p_end_date: dateRange[1],
    p_supervisors: filters.supervisors,
    p_sellers: filters.sellers,
    p_regions: filters.regions,
    p_status: filters.status,
  }), [filters, dateRange]);

  const { data: opportunities, loading, error, retry } = useAnalyticalData(
    'get_crm_oportunidades',
    params,
    {
      onError: (err) => {
        toast({
          title: 'Erro ao carregar oportunidades',
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
      <h1 className="text-3xl font-bold tracking-tight">Oportunidades</h1>
      <Card>
        <CardContent className="p-6 space-y-6">
          <CrmFilters />
          {!opportunities || opportunities.length === 0 ? (
            <EmptyState description="Nenhuma oportunidade encontrada." />
          ) : (
            <CrmKanban items={opportunities} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}