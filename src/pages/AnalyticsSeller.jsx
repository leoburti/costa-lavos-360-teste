import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import DrilldownExplorer from '@/components/DrilldownExplorer';
import { useFilters } from '@/contexts/FilterContext';
import FilterBar from '@/components/FilterBar';
import { Users, TrendingUp } from 'lucide-react';

/**
 * PÁGINA: Analítico Vendedor (Restaurada)
 * 
 * Esta página utiliza o componente DrilldownExplorer para oferecer uma visão
 * hierárquica focada no vendedor:
 * Vendedor -> Cliente -> Produto
 * 
 * Layout:
 * 1. Barra de Filtros (Global)
 * 2. Header com Título e Contexto
 * 3. Explorador de Vendas (Drilldown)
 */
const AnalyticsSeller = () => {
  const { filters } = useFilters();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Analítico Vendedor | Costa Lavos</title>
        <meta name="description" content="Análise detalhada de desempenho por vendedor e carteira de clientes." />
      </Helmet>

      {/* Seção de Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Analítico de Vendedores
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhamento de performance individual e carteira de clientes.
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
                  Explorador de Vendas da Equipe
                </CardTitle>
                <CardDescription>
                  Clique em um vendedor para ver seus clientes e produtos vendidos (Drill-down).
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {/* 
              O DrilldownExplorer no modo 'seller' configura a hierarquia:
              Nível 1: Lista de Vendedores
              Nível 2: Clientes do Vendedor
              Nível 3: Produtos do Cliente
            */}
            <DrilldownExplorer 
              analysisMode="seller" 
              initialFilters={filters}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsSeller;