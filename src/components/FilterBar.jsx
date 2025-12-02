import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { useFilters } from '@/contexts/FilterContext';
import { Input } from '@/components/ui/input';
import FilterPanel from '@/components/FilterPanel';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import PeriodSelector from '@/components/PeriodSelector'; 

export default function FilterBar() {
  const { filters, updateFilters } = useFilters();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (filters.searchTerm !== debouncedSearchTerm) {
      updateFilters({ searchTerm: debouncedSearchTerm });
    }
  }, [debouncedSearchTerm, updateFilters, filters.searchTerm]);

  useEffect(() => {
    if (filters.searchTerm !== searchTerm) {
      setSearchTerm(filters.searchTerm || '');
    }
  }, [filters.searchTerm]);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-4 border-b">
      <div className="relative w-full md:flex-1 md:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto justify-between">
        <PeriodSelector />
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Filtros Avançados</DialogTitle>
              <DialogDescription>
                Refine os dados exibidos no dashboard.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <FilterPanel />
              
              <div className="flex items-center gap-2 p-2 border rounded">
                <input
                  type="checkbox"
                  id="exclude-employees"
                  checked={filters.excludeEmployees || false}
                  onChange={(e) => updateFilters({ excludeEmployees: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="exclude-employees" className="text-sm font-medium cursor-pointer">
                  Excluir Vendas para Funcionários
                </label>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Fechar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}