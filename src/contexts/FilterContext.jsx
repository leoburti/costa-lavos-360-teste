import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { getDateRange } from '@/lib/utils';

// Define o range de data inicial para "Este Mês"
const defaultDateRange = getDateRange('this_month');

const DEFAULT_FILTERS = {
  dateRange: defaultDateRange,
  previousDateRange: null,
  supervisors: null,
  sellers: null,
  regions: null,
  clients: null,
  customerGroups: null,
  excludeEmployees: true,
  searchTerm: null,
  showDefinedGroupsOnly: false,
};

export const FilterContext = createContext(undefined);

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const setDateRange = useCallback((newDateRange) => {
    updateFilters({ dateRange: newDateRange });
  }, [updateFilters]);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const value = useMemo(() => ({
    filters,
    updateFilters,
    resetFilters,
    dateRange: filters.dateRange,
    setDateRange,
  }), [filters, updateFilters, resetFilters, setDateRange]);

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