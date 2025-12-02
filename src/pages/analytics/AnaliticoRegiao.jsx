
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import DrilldownExplorer from '@/components/DrilldownExplorer';
import { TrendingUp, Map } from 'lucide-react';

/**
 * PÁGINA: Analítico Região
 * Foco em geografia de vendas com Treemap e explorador hierárquico.
 */
export default function AnaliticoRegiao() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <Helmet>
        <title>Analítico Regional | Costa Lavos</title>
      </Helmet>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Map className="h-8 w-8 text-primary" />
          Analítico Regional
        </h1>
        <p className="text-slate-500">
          Visão geográfica de desempenho. Navegue por Região → Supervisor → Vendedor → Cliente.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid gap-6">
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Mapa de Calor & Explorador
                </CardTitle>
                <CardDescription>
                  Utilize a tabela ou o gráfico abaixo para aprofundar a análise (Drill-down).
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {/* DrilldownExplorer handles both Chart and Table internally */}
            <DrilldownExplorer 
              analysisMode="region" 
              rpcName="get_region_analysis_data"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
