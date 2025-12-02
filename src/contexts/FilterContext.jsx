
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { startOfMonth, endOfMonth } from 'date-fns';

// Função auxiliar para gerar o range de data inicial (Este Mês)
// Garante que o 'new Date()' seja executado no momento da chamada, não no carregamento do módulo
const getInitialDateRange = () => ({
  from: startOfMonth(new Date()),
  to: endOfMonth(new Date())
});

const getInitialFilters = () => ({
  dateRange: getInitialDateRange(),
  previousDateRange: null,
  supervisors: null,
  sellers: null,
  regions: null,
  clients: null,
  customerGroups: null,
  products: null,
  excludeEmployees: true, // Mantém a exclusão por padrão para dados mais limpos
  searchTerm: '',
  showDefinedGroupsOnly: false,
});

export const FilterContext = createContext(undefined);

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState(getInitialFilters());

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const setDateRange = useCallback((newDateRange) => {
    updateFilters({ dateRange: newDateRange });
  }, [updateFilters]);

  const resetFilters = useCallback(() => {
    setFilters(getInitialFilters());
  }, []);

  // Verifica se há algum filtro ativo diferente do padrão
  const hasActiveFilters = useMemo(() => {
    const defaults = getInitialFilters();
    
    // Verifica busca textual
    if (filters.searchTerm) return true;
    
    // Verifica toggle de funcionários
    if (filters.excludeEmployees !== defaults.excludeEmployees) return true;
    
    // Verifica arrays de filtro (multiselects)
    const arrayFields = ['supervisors', 'sellers', 'regions', 'clients', 'customerGroups', 'products'];
    for (const field of arrayFields) {
      if (filters[field] && filters[field].length > 0) return true;
    }

    // Verifica data (compara timestamps para evitar problemas de referência de objeto)
    const d1 = filters.dateRange;
    const d2 = defaults.dateRange;
    // Se um é nulo e outro não, ou se tempos diferem
    if (!d1 || !d2) return d1 !== d2;
    if (d1.from?.getTime() !== d2.from?.getTime() || d1.to?.getTime() !== d2.to?.getTime()) {
       return true;
    }

    return false;
  }, [filters]);

  const value = useMemo(() => ({
    filters,
    updateFilters,
    resetFilters,
    dateRange: filters.dateRange,
    setDateRange,
    hasActiveFilters
  }), [filters, updateFilters, resetFilters, setDateRange, hasActiveFilters]);

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters deve ser usado dentro de um FilterProvider');
  }
  return context;
}

export default FilterContext;
