import React, { useState, useMemo, useEffect } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { formatDateForAPI, formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';
import { 
  ShoppingBasket, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const CestaDeProdutos = () => {
  const { filters } = useFilters();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Build API parameters
  const params = useMemo(() => {
    const startDate = filters.dateRange?.from || filters.dateRange?.[0];
    const endDate = filters.dateRange?.to || filters.dateRange?.[1];

    return {
      p_start_date: formatDateForAPI(startDate),
      p_end_date: formatDateForAPI(endDate),
      p_exclude_employees: filters.excludeEmployees,
      p_supervisors: filters.supervisors,
      p_sellers: filters.sellers,
      p_customer_groups: filters.customerGroups,
      p_regions: filters.regions,
      p_clients: filters.clients,
      p_search_term: filters.searchTerm,
      p_page: currentPage,
      p_limit: ITEMS_PER_PAGE
    };
  }, [filters, currentPage]);

  const { data, loading, error } = useAnalyticalData(
    'get_product_basket_data',
    params,
    { enabled: !!params.p_start_date }
  );

  const baskets = data?.data || [];
  const totalCount = data?.total_count || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-destructive bg-red-50 rounded-xl border border-red-100">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p className="font-semibold">Erro ao carregar cestas de produtos.</p>
        <p className="text-xs opacity-70 mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm bg-white h-full flex flex-col">
      <CardHeader className="pb-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <ShoppingBasket className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-800">Explorador de Cestas</CardTitle>
              <CardDescription>
                Análise de combinações de produtos mais frequentes nos pedidos.
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="font-mono">
            {totalCount} Cestas Encontradas
          </Badge>
        </div>
      </CardHeader>

      <div className="flex-1 overflow-auto relative min-h-[400px]">
        {loading ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-16 w-full rounded-lg bg-slate-50" />
              </div>
            ))}
          </div>
        ) : baskets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
            <ShoppingBasket className="h-12 w-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">Nenhuma cesta encontrada para os filtros.</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600 w-16 text-center">#</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Produtos na Cesta</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-right">Frequência</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-right">Qtd. Total (Kg)</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-right">Faturamento</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-center">Margem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {baskets.map((basket, idx) => {
                const rank = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                return (
                  <tr key={basket.basket_id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3 text-center font-mono text-slate-400 font-medium">
                      {rank}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {basket.products?.map((prod, i) => (
                          <Badge 
                            key={i} 
                            variant="outline" 
                            className="bg-white hover:bg-slate-100 border-slate-200 text-slate-700 font-normal"
                          >
                            <Package className="h-3 w-3 mr-1 text-blue-400" />
                            {prod}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-slate-700">
                          {formatPercentage(basket.frequency_percentage)}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatNumber(basket.frequency_count)} pedidos
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600">
                      {formatNumber(basket.total_quantity)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600 font-medium">
                      {formatCurrency(basket.total_revenue)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge 
                        variant={basket.margin_percentage > 30 ? 'success' : basket.margin_percentage < 15 ? 'destructive' : 'secondary'}
                        className="font-mono text-xs"
                      >
                        {formatPercentage(basket.margin_percentage)}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="bg-white border-t px-4 py-3 flex items-center justify-between shrink-0">
        <div className="text-xs text-muted-foreground">
          Página {currentPage} de {totalPages || 1}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CestaDeProdutos;