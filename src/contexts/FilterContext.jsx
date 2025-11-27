
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { startOfMonth, endOfMonth } from 'date-fns';

const FilterContext = createContext();

const INITIAL_FILTERS = {
  dateRange: {
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  },
  supervisors: null,
  sellers: null,
  customerGroups: null,
  regions: null,
  clients: null,
  products: null,
  searchTerm: '',
  status: 'all',
  viewMode: 'table',
  excludeEmployees: true
};

export const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Stable update function using functional state update to avoid dependencies
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => {
      // Deep comparison for critical fields to prevent unnecessary re-renders
      const hasChanges = Object.entries(newFilters).some(([key, val]) => {
        // Use JSON.stringify for deep comparison of objects/arrays/dates
        return JSON.stringify(prev[key]) !== JSON.stringify(val);
      });
      
      if (!hasChanges) return prev;
      return { ...prev, ...newFilters };
    });
  }, []);

  // Helper specifically for date range to maintain API compatibility
  const setDateRange = useCallback((range) => {
    updateFilters({ dateRange: range });
  }, [updateFilters]);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const refreshData = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const toggleFilterPanel = useCallback(() => {
    setIsFilterPanelOpen(prev => !prev);
  }, []);

  const contextValue = useMemo(() => ({
    filters,
    updateFilters,
    setDateRange,
    resetFilters,
    refreshKey,
    refreshData,
    isFilterPanelOpen,
    toggleFilterPanel,
    loading: false
  }), [filters, refreshKey, isFilterPanelOpen, updateFilters, setDateRange, resetFilters, refreshData, toggleFilterPanel]);

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

// Aliases for backward compatibility
export const useFilter = useFilters;
export const useFilterContext = useFilters;
