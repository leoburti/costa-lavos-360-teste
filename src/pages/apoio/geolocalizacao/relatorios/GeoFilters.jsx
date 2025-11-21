import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download } from 'lucide-react';

export default function GeoFilters({ 
  filters, 
  setFilters, 
  profissionais, 
  onSearch, 
  onExportPDF, 
  onExportCSV,
  loading 
}) {
  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/4 space-y-1">
          <label className="text-xs font-medium">Data Início</label>
          <Input 
            type="date" 
            value={filters.dataInicio} 
            onChange={(e) => setFilters({...filters, dataInicio: e.target.value})} 
          />
        </div>
        <div className="w-full md:w-1/4 space-y-1">
          <label className="text-xs font-medium">Data Fim</label>
          <Input 
            type="date" 
            value={filters.dataFim} 
            onChange={(e) => setFilters({...filters, dataFim: e.target.value})} 
          />
        </div>
        <div className="w-full md:w-1/4 space-y-1">
          <label className="text-xs font-medium">Profissional</label>
          <Select 
            value={filters.profissionalId || "todos"} 
            onValueChange={(val) => setFilters({...filters, profissionalId: val === "todos" ? null : val})}
          >
            <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {profissionais.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button onClick={onSearch} disabled={loading}>
            <Search className="w-4 h-4 mr-2" /> Filtrar
          </Button>
          <Button variant="outline" onClick={onExportPDF} disabled={loading} title="Exportar PDF">
            <Download className="w-4 h-4 text-red-600" />
          </Button>
          <Button variant="outline" onClick={onExportCSV} disabled={loading} title="Exportar CSV">
            <Download className="w-4 h-4 text-green-600" />
          </Button>
        </div>
      </div>
    </Card>
  );
}