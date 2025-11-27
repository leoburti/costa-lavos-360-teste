
import React, { useState, useEffect } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { Input } from '@/components/ui/input';
import { DateRangePicker } from '@/components/DateRangePicker';
import FilterPanel from '@/components/FilterPanel';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import QuickPeriodSelector from '@/components/QuickPeriodSelector';

const FilterBar = () => {
  const { filters, updateFilters } = useFilters();
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Effect 1: Sync local debounced term to Global Context
  useEffect(() => {
    // Only update if different to avoid loop
    if (filters.searchTerm !== debouncedSearchTerm) {
      updateFilters({ searchTerm: debouncedSearchTerm });
    }
  }, [debouncedSearchTerm, updateFilters, filters.searchTerm]);

  // Effect 2: Sync Global Context changes back to local state (e.g. "Clear All" button)
  useEffect(() => {
    // Check if filters.searchTerm is defined and different from local state
    // We use a check against debouncedSearchTerm to avoid overwriting user typing
    if (filters.searchTerm !== undefined && filters.searchTerm !== searchTerm) {
       if (filters.searchTerm !== debouncedSearchTerm) {
         setSearchTerm(filters.searchTerm || '');
       }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.searchTerm]); 

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-4 px-4 sm:px-6 lg:px-8 border-b">
      <div className="relative w-full md:flex-1 md:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="hidden md:flex flex-1 justify-center">
        <QuickPeriodSelector />
      </div>
      
      <div className="flex items-center gap-4 w-full md:w-auto">
        <DateRangePicker />
        <FilterPanel />
      </div>

      <div className="w-full md:hidden">
        <QuickPeriodSelector />
      </div>
    </div>
  );
};

export default FilterBar;
