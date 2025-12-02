import React from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, TrendingUp } from 'lucide-react';

const RotaOtimizacao = () => {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet><title>Otimização de Rotas</title></Helmet>
      
      <PageHeader 
        title="Otimização Inteligente" 
        description="Algoritmos avançados para reduzir quilometragem e tempo de entrega."
        breadcrumbs={[{ label: 'Rotas', path: '/entregas/rotas' }, { label: 'Otimização' }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-amber-500" /> Rota Atual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-4xl font-bold text-slate-700">145 km</div>
                <p className="text-slate-500">Tempo Estimado: 4h 30m</p>
                <div className="h-40 bg-slate-100 rounded border border-dashed border-slate-300 flex items-center justify-center text-sm text-slate-400">
                    Visualização Sequencial Atual
                </div>
            </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-800"><TrendingUp className="h-5 w-5" /> Sugestão Otimizada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-4xl font-bold text-emerald-600">112 km</div>
                <p className="text-emerald-700 font-medium">Economia Estimada: 22% (-33 km)</p>
                <div className="h-40 bg-white rounded border border-emerald-200 flex items-center justify-center text-sm text-emerald-600 font-medium">
                    Sequência Otimizada
                </div>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    Aplicar Otimização
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RotaOtimizacao;