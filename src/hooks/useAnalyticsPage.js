import { useMemo } from 'react';
import { analyticsMenuStructure } from '@/config/analyticsMenuStructure';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { useFilters } from '@/contexts/FilterContext';

/**
 * Hook para resolver a configuração da página de analytics e buscar os dados correspondentes.
 * Atualizado para usar o novo useAnalyticsData com suporte a mock.
 */
export function useAnalyticsPage(pageSlug) {
  const { filters } = useFilters();

  // 1. Encontrar Configuração da Página na estrutura do menu
  const config = useMemo(() => {
    if (!pageSlug) return null;
    
    const search = (groups) => {
      for (const group of groups) {
        // Busca em páginas diretas do grupo
        if (group.pages) {
          const page = group.pages.find(p => p.path === pageSlug);
          if (page) return page;
        }
        // Busca em subgrupos
        if (group.subgroups) {
          for (const subgroup of group.subgroups) {
            if (subgroup.pages) {
              const page = subgroup.pages.find(p => p.path === pageSlug);
              if (page) return page;
            }
          }
        }
      }
      return null;
    };

    return search(analyticsMenuStructure);
  }, [pageSlug]);

  // 2. Parâmetros Específicos (se houver necessidade de override)
  // O hook useAnalyticsData já pega os filtros globais automaticamente.
  const params = useMemo(() => ({}), []);

  // 3. Fetch Data com Hook Atualizado
  // Assinatura: (rpc, mockData, params)
  const { data, loading, error, retry, isMock } = useAnalyticsData(
    config?.rpc, 
    config?.mockData, 
    params
  );

  return {
    config,
    data,
    loading,
    error,
    refetch: retry,
    isMock
  };
}