import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import DrilldownExplorer from '@/components/DrilldownExplorer';
import ProductMixAnalysis from '@/components/ProductMixAnalysis';
import { useFilters } from '@/contexts/FilterContext';
import FilterBar from '@/components/FilterBar';
import { Package, TrendingUp, Layers } from 'lucide-react';

/**
 * PÁGINA: Analítico de Produtos (Restaurada)
 * 
 * Esta página combina duas visões poderosas:
 * 1. Explorador Drill-down (Hierarquia): Produto -> Cliente -> Vendedor
 * 2. Análise de Mix (Matriz): Força (Participação na Receita) vs Confiabilidade (Frequência em Pedidos)
 * 
 * Layout:
 * 1. Barra de Filtros (Global)
 * 2. Treemap/Gráfico Geral (DrilldownExplorer)
 * 3. Tabela de Mix de Produtos (ProductMixAnalysis)
 */
const AnalyticsProduct = () => {
  const { filters } = useFilters();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Analítico de Produtos | Costa Lavos</title>
        <meta name="description" content="Análise detalhada de desempenho, força e confiabilidade do mix de produtos." />
      </Helmet>

      {/* Seção de Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            Analítico de Produtos
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão estratégica do portfólio, penetração de mercado e mix de vendas.
          </p>
        </div>
      </div>

      {/* Barra de Filtros Global */}
      <FilterBar />

      {/* Container Principal */}
      <div className="grid gap-6">
        
        {/* 1. Explorador Visual (Top Section) */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-emerald-600" />
                  Explorador de Vendas por Produto
                </CardTitle>
                <CardDescription>
                  Navegue pelos produtos para ver quais clientes os compram (Drill-down).
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {/* 
              DrilldownExplorer no modo 'product':
              Nível 1: Produtos
              Nível 2: Clientes
              Nível 3: Vendedores
            */}
            <DrilldownExplorer 
              analysisMode="product" 
              initialFilters={filters}
            />
          </CardContent>
        </Card>

        {/* 2. Análise de Mix (Bottom Section) */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Matriz de Força e Confiabilidade
                </CardTitle>
                <CardDescription>
                  Identifique seus produtos 'Carro-Chefe' (Alta Força) e 'Recorrentes' (Alta Confiabilidade).
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <ProductMixAnalysis />
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default AnalyticsProduct;