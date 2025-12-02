
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useFilters } from '@/contexts/FilterContext';
import { Input } from '@/components/ui/input';
import FilterPanel from '@/components/FilterPanel';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import PeriodSelector from '@/components/PeriodSelector'; 

export default function FilterBar() {
  const { filters, updateFilters, resetFilters, hasActiveFilters } = useFilters();
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Sincroniza termo de busca com debounce
  useEffect(() => {
    if (filters.searchTerm !== debouncedSearchTerm) {
      updateFilters({ searchTerm: debouncedSearchTerm });
    }
  }, [debouncedSearchTerm, updateFilters, filters.searchTerm]);

  // Sincroniza input local quando o filtro é limpo externamente
  useEffect(() => {
    if (filters.searchTerm !== searchTerm) {
      setSearchTerm(filters.searchTerm || '');
    }
  }, [filters.searchTerm]);

  const handleClearAll = () => {
    resetFilters();
    setSearchTerm('');
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-4 border-b transition-all duration-200">
      <div className="relative w-full md:flex-1 md:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          className="pl-10 pr-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            type="button"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end overflow-x-auto pb-1 md:pb-0">
        <PeriodSelector />
        
        <FilterPanel />

        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearAll}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 whitespace-nowrap"
            title="Restaurar filtros padrão"
          >
            <X className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
}
