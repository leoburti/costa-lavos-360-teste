import React, { useMemo } from 'react';
import { useFilters } from '@/hooks/useFilters';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState, ErrorState, EmptyState } from '@/components/common';
import { EquipamentosFilters } from './components/EquipamentosFilters';
import { PerformanceChart } from './components/PerformanceChart';

export default function EquipamentosPerformance() {
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

  const { data: performanceData, loading, error, retry } = useAnalyticalData(
    'get_equipment_performance',
    params,
    {
      onError: (err) => {
        toast({
          title: 'Erro ao carregar performance',
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
      <h1 className="text-3xl font-bold tracking-tight">Performance</h1>

      <Card>
        <CardContent className="p-6 space-y-6">
          <EquipamentosFilters />
          
          {!performanceData || performanceData.length === 0 ? (
            <EmptyState description="Sem dados de performance para o período." />
          ) : (
            <PerformanceChart data={performanceData} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}