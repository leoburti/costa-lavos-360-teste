import React from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Network } from 'lucide-react';

const HierarchyPage = () => {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet><title>Hierarquia Organizacional | Config</title></Helmet>
      
      <PageHeader 
        title="Hierarquia Organizacional" 
        description="Estrutura de supervisão e times comerciais."
        breadcrumbs={[{ label: 'Configurações', path: '/configuracoes' }, { label: 'Hierarquia' }]}
      />

      <Card className="min-h-[500px] flex flex-col items-center justify-center border-dashed">
        <Network className="h-16 w-16 text-slate-200 mb-4" />
        <h3 className="text-lg font-semibold text-slate-600">Visualização de Árvore</h3>
        <p className="text-slate-400">O componente de organograma será implementado aqui.</p>
      </Card>
    </div>
  );
};

export default HierarchyPage;