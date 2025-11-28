import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Users, Layers } from 'lucide-react';

import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { Skeleton } from '@/components/ui/skeleton';
import TreeMapChart from '@/components/TreeMapChart';
import CustomerGroupDrilldownExplorer from '@/components/CustomerGroupDrilldownExplorer';

const AnaliticoGrupoClientes = () => {
  const { filters } = useFilters();

  const { data: treemapData, loading: treemapLoading } = useAnalyticalData(
    'get_treemap_data',
    {
      ...filters,
      analysisMode: 'customerGroup',
      showDefinedGroupsOnly: true, // Specific to this page
    }
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Analítico por Grupo de Clientes | Costa Lavos</title>
      </Helmet>

      <div className="flex items-center gap-3">
        <div className="bg-purple-100 p-3 rounded-full">
          <Users className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analítico por Grupo de Clientes</h1>
          <p className="text-muted-foreground">Desempenho de vendas por agrupamento de clientes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {treemapLoading ? (
            <Skeleton className="h-[485px] w-full" />
        ) : (
            <TreeMapChart 
                title="Hierarquia de Vendas por Grupo de Clientes"
                description="Visão geral do faturamento por grupo. Passe o mouse para detalhes."
                data={treemapData} 
            />
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-800 mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-500" />
            Explorador de Vendas por Grupo
        </h2>
        <CustomerGroupDrilldownExplorer filters={filters} />
      </div>

    </div>
  );
};

export default AnaliticoGrupoClientes;