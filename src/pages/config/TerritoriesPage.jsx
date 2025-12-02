import React from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map } from 'lucide-react';
import StandardList from '@/components/config/StandardList';

// Reusing the generic list for the table part, but wrapping with Map context
const TerritoriesPage = () => {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet><title>Territórios | Config</title></Helmet>
      
      <PageHeader 
        title="Gestão de Territórios" 
        description="Definição geográfica de áreas de atuação."
        breadcrumbs={[{ label: 'Configurações', path: '/configuracoes' }, { label: 'Territórios' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card className="h-[500px] flex flex-col items-center justify-center bg-slate-100 border-2 border-slate-200">
                <Map className="h-12 w-12 text-slate-300 mb-2" />
                <p className="text-slate-500 font-medium">Mapa Interativo</p>
            </Card>
        </div>
        <div>
            <Card className="h-[500px]">
                <CardHeader><CardTitle>Regiões</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Lista de zonas será exibida aqui.</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default TerritoriesPage;