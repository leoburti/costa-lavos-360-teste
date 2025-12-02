
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import DrilldownExplorer from '@/components/DrilldownExplorer';
import { Users, Layers } from 'lucide-react';

/**
 * PÁGINA: Analítico Grupo de Clientes
 * Foco em redes e grupos econômicos.
 */
export default function AnaliticoGrupoClientes() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <Helmet>
        <title>Analítico por Grupo | Costa Lavos</title>
      </Helmet>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          Analítico de Grupos de Clientes
        </h1>
        <p className="text-slate-500">
          Acompanhamento de performance por redes e grupos econômicos consolidados.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-amber-600" />
                  Hierarquia de Grupos
                </CardTitle>
                <CardDescription>
                  Visão consolidada por grupo com detalhamento de lojas e produtos.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <DrilldownExplorer 
              analysisMode="customerGroup" 
              rpcName="get_group_analysis_data"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
