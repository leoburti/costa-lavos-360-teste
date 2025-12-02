import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import DrilldownExplorer from '@/components/DrilldownExplorer';
import { useFilters } from '@/contexts/FilterContext';
import FilterBar from '@/components/FilterBar';
import { Users, TrendingUp } from 'lucide-react';

/**
 * PÁGINA: Analítico de Grupos de Clientes
 * Localização: src/pages/dashboard/AnaliticoGrupos.jsx
 */
const AnaliticoGrupos = () => {
  const { filters } = useFilters();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Analítico por Grupo | Costa Lavos</title>
        <meta name="description" content="Análise de desempenho por grupos econômicos e redes de clientes." />
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Analítico de Grupos
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhamento de performance por redes e grupos de clientes.
          </p>
        </div>
      </div>

      <FilterBar />

      <div className="grid gap-6">
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Explorador de Vendas por Grupo
                </CardTitle>
                <CardDescription>
                  Navegue pelos grupos (redes) para visualizar clientes individuais e produtos (Drill-down).
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <DrilldownExplorer 
              analysisMode="customerGroup" 
              rpcName="get_group_analysis_data"
              initialFilters={filters}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnaliticoGrupos;