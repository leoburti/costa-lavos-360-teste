import React from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';

export function RelatoriFilters() {
  const { filters, updateFilters } = useFilters();

  const startDate = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date();
  const endDate = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">Data Inicial</label>
            <Input
              type="date"
              value={startDate.toISOString().split('T')[0]}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                updateFilters({
                  dateRange: { from: newDate, to: endDate },
                });
              }}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Data Final</label>
            <Input
              type="date"
              value={endDate.toISOString().split('T')[0]}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                updateFilters({
                  dateRange: { from: startDate, to: newDate },
                });
              }}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Supervisor</label>
            <Input
              placeholder="Filtrar supervisor..."
              value={filters.searchTerm || ''}
              onChange={(e) => updateFilters({ searchTerm: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Região</label>
            <Input
              placeholder="Filtrar região..."
              value={filters.regions?.[0] || ''}
              onChange={(e) => updateFilters({ regions: e.target.value ? [e.target.value] : null })}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateFilters({ 
                searchTerm: '', 
                regions: null 
              })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}