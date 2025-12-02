import React from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map as MapIcon, Save, Truck } from 'lucide-react';

const RotaPlanejamento = () => {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 h-[calc(100vh-4rem)] flex flex-col">
      <Helmet><title>Planejamento de Rotas</title></Helmet>
      
      <div className="flex-none">
        <PageHeader 
            title="Planejamento de Rotas" 
            description="Arraste e solte entregas para criar roteiros eficientes."
            breadcrumbs={[{ label: 'Rotas', path: '/entregas/rotas' }, { label: 'Planejamento' }]}
            actions={<Button><Save className="mr-2 h-4 w-4" /> Salvar Rota</Button>}
        />
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Sidebar List */}
        <div className="lg:col-span-1 flex flex-col gap-4 h-full overflow-hidden">
            <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader className="pb-2"><CardTitle className="text-base">Entregas Pendentes</CardTitle></CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="p-3 bg-white border rounded shadow-sm cursor-grab hover:border-primary flex gap-3">
                            <div className="mt-1"><Truck className="h-4 w-4 text-slate-400" /></div>
                            <div>
                                <p className="font-medium text-sm">Entrega #{1000+i}</p>
                                <p className="text-xs text-slate-500">Rua Exemplo, {100+i} - Centro</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>

        {/* Map Area */}
        <div className="lg:col-span-2 h-full">
            <Card className="h-full border-slate-200 overflow-hidden flex items-center justify-center bg-slate-100">
                <div className="text-center text-slate-400">
                    <MapIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">Mapa Interativo</p>
                    <p className="text-sm">Visualização de rota em desenvolvimento...</p>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default RotaPlanejamento;