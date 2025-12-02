import React from 'react';
import { useFilters } from '@/hooks/useFilters';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';

export function BonificacoesFilters() {
  const { filters, updateFilters } = useFilters();

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium">Data Inicial</label>
            <Input
              type="date"
              value={filters.dateRange?.[0] ? new Date(filters.dateRange[0]).toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                updateFilters({
                  dateRange: [newDate, filters.dateRange?.[1] || new Date()],
                });
              }}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Data Final</label>
            <Input
              type="date"
              value={filters.dateRange?.[1] ? new Date(filters.dateRange[1]).toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                updateFilters({
                  dateRange: [filters.dateRange?.[0] || new Date(), newDate],
                });
              }}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Buscar</label>
            <Input
              placeholder="Buscar bonificação..."
              value={filters.searchTerm || ''}
              onChange={(e) => updateFilters({ searchTerm: e.target.value })}
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
              onClick={() => updateFilters({ searchTerm: '' })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}