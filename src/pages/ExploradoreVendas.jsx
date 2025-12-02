import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Compass, ChevronDown } from 'lucide-react';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { Skeleton } from '@/components/ui/skeleton';
import TreeMapChart from '@/components/TreeMapChart';
import FilterBar from '@/components/FilterBar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

const analysisModes = [
  { id: 'region', label: 'Por Região' },
  { id: 'supervisor', label: 'Por Supervisor' },
  { id: 'seller', label: 'Por Vendedor' },
  { id: 'customerGroup', label: 'Por Grupo de Clientes' },
  { id: 'product', label: 'Por Produto' },
];

const ExploradoreVendas = () => {
  const { filters } = useFilters();
  const [analysisMode, setAnalysisMode] = useState('region');

  const { data, loading, error } = useAnalyticalData(
    'get_sales_explorer_treemap',
    {
      ...filters,
      p_analysis_mode: analysisMode,
    }
  );

  const currentModeLabel = analysisModes.find(m => m.id === analysisMode)?.label;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Explorador de Vendas | Costa Lavos</title>
      </Helmet>

      <FilterBar />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-3">
          <div className="bg-teal-100 p-3 rounded-full">
            <Compass className="h-6 w-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Explorador de Vendas</h1>
            <p className="text-muted-foreground">Análise dinâmica multidimensional.</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[200px] justify-between">
              {currentModeLabel}
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            {analysisModes.map((mode) => (
              <DropdownMenuItem 
                key={mode.id} 
                onClick={() => setAnalysisMode(mode.id)}
                className={analysisMode === mode.id ? "bg-slate-100 font-medium" : ""}
              >
                {mode.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
            <Skeleton className="h-[500px] w-full rounded-xl" />
        ) : error ? (
            <div className="flex items-center justify-center h-[400px] bg-red-50 rounded-xl border border-red-100 text-red-600">
                Erro ao carregar dados: {error}
            </div>
        ) : (
            <TreeMapChart 
                title={`Vendas ${currentModeLabel}`}
                description={`Distribuição do volume de vendas agrupado por ${currentModeLabel.toLowerCase().replace('por ', '')}.`}
                data={data} 
            />
        )}
      </div>
    </div>
  );
};

export default ExploradoreVendas;