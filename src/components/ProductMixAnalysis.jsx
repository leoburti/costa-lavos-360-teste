import React, { useMemo, useState, useEffect } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatPercentage, formatDateForAPI, formatNumber } from '@/lib/utils';
import { AlertTriangle, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProductMixAnalysis = ({ externalData, loading: externalLoading, error: externalError }) => {
  const { filters } = useFilters();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  // Reset page when data or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, externalData]);

  // If no external data is provided, fetch it internally (backward compatibility)
  const params = useMemo(() => {
    if (externalData) return null; // Skip param gen if external data exists
    
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
    };
  }, [filters, externalData]);

  const { data: internalData, loading: internalLoading, error: internalError } = useAnalyticalData(
    'get_product_analysis_data', 
    params, 
    { enabled: !externalData && !!params?.p_start_date }
  );

  const data = externalData || internalData;
  const loading = externalLoading || internalLoading;
  const error = externalError || internalError;

  // Sorting DESC by Strength (Força) as requested
  const sortedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return [...data].sort((a, b) => (Number(b.strength) || 0) - (Number(a.strength) || 0));
  }, [data]);

  const paginatedData = useMemo(() => {
    return sortedData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [sortedData, currentPage]);

  const totalItems = data?.length || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-full bg-slate-100" />
        <Skeleton className="h-12 w-full bg-slate-50" />
        <Skeleton className="h-12 w-full bg-slate-50" />
        <Skeleton className="h-12 w-full bg-slate-50" />
        <Skeleton className="h-12 w-full bg-slate-50" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-destructive">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p>Erro ao carregar análise de mix.</p>
        <p className="text-xs opacity-70">{error.message}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border-2 border-dashed rounded-lg m-4">
        <ShoppingBag className="h-10 w-10 mb-2 opacity-20" />
        <p>Nenhum produto encontrado para os filtros selecionados.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="flex-1 overflow-auto max-h-[600px]">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-600 w-[35%]">Produto</th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-right">
                Qtd. (Kg)
              </th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-center">
                Força (%)
                <span className="block text-[10px] font-normal text-slate-400 font-sans">Participação na Receita</span>
              </th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-center">
                Confiabilidade (%)
                <span className="block text-[10px] font-normal text-slate-400 font-sans">Frequência em Pedidos</span>
              </th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-right">Vendas (R$)</th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-center">Classificação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.map((item, idx) => {
              const strength = Number(item.strength) || 0;
              const reliability = Number(item.reliability) || 0;
              const quantity = Number(item.quantity) || 0;
              
              let classification = 'Produto Padrão';
              let badgeColor = 'secondary';
              
              if (strength > 5 && reliability > 5) {
                classification = 'Estrela';
                badgeColor = 'default'; 
              } else if (strength > 5) {
                classification = 'Gerador de Caixa';
                badgeColor = 'outline';
              } else if (reliability > 10) {
                classification = 'Alto Giro';
                badgeColor = 'secondary';
              }

              return (
                <tr key={`${item.name}-${idx}`} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-4 py-3 font-medium text-slate-700 group-hover:text-primary transition-colors">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-600">
                    {formatNumber(quantity)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center justify-center">
                        <span className="font-bold text-slate-700">{formatPercentage(strength)}</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(strength * 2, 100)}%` }} />
                        </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center justify-center">
                        <span className="font-bold text-slate-700">{formatPercentage(reliability)}</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(reliability * 2, 100)}%` }} />
                        </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-600">
                    {formatCurrency(item.value)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={badgeColor} className="text-[10px]">
                        {classification}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="bg-white border-t px-4 py-3 flex items-center justify-between shrink-0">
          <div className="text-xs text-muted-foreground">
            Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} até {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} de {totalItems}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ProductMixAnalysis);