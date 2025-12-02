
import React, { useMemo, useState } from 'react';
import { useFilters } from '@/hooks/useFilters';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState, ErrorState, EmptyState } from '@/components/common';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { BonificacoesFilters } from './components/BonificacoesFilters';
import { BonificacoesTable } from './components/BonificacoesTable';
import { format } from 'date-fns';

export default function BonificacoesList() {
  const { filters } = useFilters();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);

  const dateRange = filters.dateRange || [new Date(), new Date()];

  // Helper para formatar data de forma segura para RPC
  const formatDateParam = (date) => {
    if (!date) return null;
    try {
      return format(date, 'yyyy-MM-dd');
    } catch (e) {
      console.error('Erro ao formatar data:', e);
      return null;
    }
  };

  const params = useMemo(() => ({
    p_start_date: formatDateParam(dateRange[0]),
    p_end_date: formatDateParam(dateRange[1]),
    p_page: currentPage,
    p_page_size: pageSize,
    p_supervisors: filters.supervisors,
    p_sellers: filters.sellers,
    p_regions: filters.regions,
    p_status: filters.status || null, // Garantindo que status seja passado, mesmo que null
    p_search_term: filters.searchTerm,
  }), [filters, currentPage, pageSize, dateRange]);

  const { data: rawData, loading, error, retry } = useAnalyticalData(
    'get_bonificacoes_list',
    params,
    {
      onError: (err) => {
        toast({
          title: 'Erro ao carregar bonificações',
          description: err.message,
          variant: 'destructive',
        });
      },
    }
  );

  const { items, totalCount, totalPages } = useMemo(() => {
    if (!rawData || !Array.isArray(rawData)) {
      return { items: [], totalCount: 0, totalPages: 0 };
    }

    const totalCount = rawData[0]?.total_count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      items: rawData,
      totalCount,
      totalPages,
    };
  }, [rawData, pageSize]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bonificações</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingState />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bonificações</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState error={error} onRetry={retry} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bonificações</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Bonificação
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <BonificacoesFilters />

          {items.length === 0 ? (
            <EmptyState description="Nenhuma bonificação encontrada." />
          ) : (
            <>
              <BonificacoesTable items={items} />

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Página {currentPage} de {totalPages} ({totalCount} bonificações)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
