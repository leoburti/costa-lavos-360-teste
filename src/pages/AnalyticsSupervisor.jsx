import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import DrilldownExplorer from '@/components/DrilldownExplorer';
import { useFilters } from '@/contexts/FilterContext';
import FilterBar from '@/components/FilterBar';
import { Users, TrendingUp } from 'lucide-react';

/**
 * PÁGINA: Analítico Supervisor (Restaurada)
 * 
 * Esta página utiliza o componente DrilldownExplorer para oferecer uma visão
 * hierárquica completa:
 * Supervisor -> Vendedor -> Cliente -> Produto
 * 
 * Layout:
 * 1. Barra de Filtros (Global)
 * 2. Header com KPI resumido
 * 3. Explorador de Vendas (Gráfico + Tabela + Drilldown)
 */
const AnalyticsSupervisor = () => {
  const { filters } = useFilters();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Analítico Supervisor | Costa Lavos</title>
        <meta name="description" content="Análise detalhada de desempenho por supervisor e equipe de vendas." />
      </Helmet>

      {/* Seção de Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Analítico de Supervisores
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão hierárquica de vendas por equipe de supervisão.
          </p>
        </div>
      </div>

      {/* Barra de Filtros Global */}
      <FilterBar />

      {/* Explorador Principal */}
      <div className="grid gap-6">
        {/* Card Principal do Explorador */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Explorador de Vendas da Equipe
                </CardTitle>
                <CardDescription>
                  Navegue pelos dados clicando nas barras ou linhas da tabela para aprofundar a análise (Drill-down).
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {/* 
              O DrilldownExplorer gerencia:
              - Chamadas RPC (get_drilldown_data)
              - Estado de navegação (Nível 1 -> Nível N)
              - Visualização (Gráfico + Tabela)
            */}
            <DrilldownExplorer 
              analysisMode="supervisor" 
              initialFilters={filters}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsSupervisor;