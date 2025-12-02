import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import DrilldownExplorer from '@/components/DrilldownExplorer';
import { useFilters } from '@/contexts/FilterContext';
import FilterBar from '@/components/FilterBar';
import { Map, TrendingUp } from 'lucide-react';

/**
 * PÁGINA: Analítico Região
 * Layout: Treemap (Mapa) e Explorador de Vendas (Tabela) abaixo.
 */
const AnaliticoRegiao = () => {
  const { filters } = useFilters();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Analítico Regional | Costa Lavos</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Map className="h-8 w-8 text-primary" />
            Analítico por Região
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geográfica de vendas. (Gráfico acima, Tabela abaixo)
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
                  Explorador Regional
                </CardTitle>
                <CardDescription>
                  Navegue: Região - Supervisor - Vendedor.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          {/* O DrilldownExplorer já renderiza Gráfico e Tabela empilhados (stacked) */}
          <CardContent className="p-0 sm:p-6">
            <DrilldownExplorer 
              analysisMode="region" 
              rpcName="get_region_analysis_data"
              initialFilters={filters}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnaliticoRegiao;