import React, { useMemo, useState } from 'react';
import { useFilters } from '@/hooks/useFilters';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState, ErrorState, EmptyState } from '@/components/common';
import { Plus } from 'lucide-react';
import { MaintenanceCalendar } from './components/MaintenanceCalendar';
import { EquipamentosFilters } from './components/EquipamentosFilters';

export default function EquipamentosManutencao() {
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

  const { data: maintenanceData, loading, error, retry } = useAnalyticalData(
    'get_maintenance_schedule',
    params,
    {
      onError: (err) => {
        toast({
          title: 'Erro ao carregar manutenção',
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Manutenção</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Agendar
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <EquipamentosFilters />
          
          {!maintenanceData || maintenanceData.length === 0 ? (
            <EmptyState description="Nenhuma manutenção agendada para o período." />
          ) : (
            <MaintenanceCalendar data={maintenanceData} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}