import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, Calendar } from 'lucide-react';

export default function ApoioFilters({ 
  filters, 
  setFilters, 
  onSearch, 
  onExport,
  loading 
}) {
  return (
    <Card className="p-4 mb-6 bg-white shadow-sm">
      <div className="flex flex-col lg:flex-row gap-4 items-end">
        <div className="w-full lg:w-1/4 space-y-1">
          <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Data Início
          </label>
          <Input 
            type="date" 
            value={filters.dataInicio} 
            onChange={(e) => setFilters({...filters, dataInicio: e.target.value})} 
            className="h-9"
          />
        </div>
        <div className="w-full lg:w-1/4 space-y-1">
          <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Data Fim
          </label>
          <Input 
            type="date" 
            value={filters.dataFim} 
            onChange={(e) => setFilters({...filters, dataFim: e.target.value})} 
            className="h-9"
          />
        </div>
        
        <div className="flex gap-2 w-full lg:w-auto ml-auto">
          <Button onClick={onSearch} disabled={loading} className="h-9 bg-blue-600 hover:bg-blue-700 text-white">
            <Search className="w-4 h-4 mr-2" /> Filtrar
          </Button>
          <Button variant="outline" onClick={onExport} disabled={loading} className="h-9 border-gray-300 text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" /> Exportar
          </Button>
        </div>
      </div>
    </Card>
  );
}