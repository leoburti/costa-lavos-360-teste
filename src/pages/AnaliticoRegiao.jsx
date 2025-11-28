import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Layers, Map } from 'lucide-react';

import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { Skeleton } from '@/components/ui/skeleton';
import TreeMapChart from '@/components/TreeMapChart';
import DrilldownExplorer from '@/components/DrilldownExplorer';
import ChartCard from '@/components/ChartCard';
import FilterPanel from '@/components/FilterPanel';

const AnaliticoRegiao = () => {
  const { filters } = useFilters();

  const treemapParams = {
    ...filters,
    p_analysis_mode: 'region',
    p_show_defined_groups_only: false
  };

  const { data: treemapData, loading: treemapLoading } = useAnalyticalData(
    'get_treemap_data',
    treemapParams
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Analítico por Região | Costa Lavos</title>
      </Helmet>
      
      <FilterPanel />

      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-3 rounded-full">
          <Map className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analítico por Região</h1>
          <p className="text-muted-foreground">Desempenho de vendas geográfico.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ChartCard title="Hierarquia de Vendas por Região (Treemap)" height={400} childClassName="p-2">
            {treemapLoading ? (
                <div className="flex items-center justify-center h-full">
                    <Skeleton className="h-full w-full" />
                </div>
            ) : (
                <TreeMapChart data={treemapData} />
            )}
        </ChartCard>
      </div>

      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-800 mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-500" />
            Explorador de Vendas
        </h2>
        <DrilldownExplorer analysisMode="region" filters={filters} />
      </div>

    </div>
  );
};

export default AnaliticoRegiao;