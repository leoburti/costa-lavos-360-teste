import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import DrilldownExplorer from '@/components/DrilldownExplorer';
import { useFilters } from '@/contexts/FilterContext';
import FilterBar from '@/components/FilterBar';
import { Map, TrendingUp } from 'lucide-react';

/**
 * PÁGINA: Analítico Região (Restaurada e Otimizada)
 * 
 * Esta página utiliza o componente DrilldownExplorer para oferecer uma visão
 * hierárquica focada em regiões geográficas:
 * Região -> Supervisor -> Vendedor -> Cliente -> Produto
 * 
 * Layout:
 * 1. Barra de Filtros (Global)
 * 2. Header com Título e Contexto
 * 3. Explorador de Vendas (Drilldown)
 */
const AnalyticsRegion = () => {
  const { filters } = useFilters();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Analítico por Região | Costa Lavos</title>
        <meta name="description" content="Análise detalhada de desempenho por região geográfica e equipe." />
      </Helmet>

      {/* Seção de Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Map className="h-8 w-8 text-primary" />
            Analítico por Região
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhamento de performance comercial segmentada por área geográfica.
          </p>
        </div>
      </div>

      {/* Barra de Filtros Global */}
      <FilterBar />

      {/* Explorador Principal */}
      <div className="grid gap-6">
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Explorador de Vendas Regional
                </CardTitle>
                <CardDescription>
                  Navegue pelas regiões para visualizar supervisores, vendedores e clientes (Drill-down).
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {/* 
              O DrilldownExplorer no modo 'region' configura a hierarquia:
              Nível 1: Regiões
              Nível 2: Supervisores da Região
              Nível 3: Vendedores do Supervisor (naquela região)
              Nível 4: Clientes do Vendedor
              Nível 5: Produtos
            */}
            <DrilldownExplorer 
              analysisMode="region" 
              initialFilters={filters}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsRegion;