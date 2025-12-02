
import React from 'react';
import { Helmet } from 'react-helmet-async';
import ModulePageTemplate from '@/components/ModulePageTemplate';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import RelatoriLayout from '@/pages/relatorios/components/RelatoriLayout'; // Corrected import path

export default function RelatorioBuscador() {
  return (
    <ModulePageTemplate title="Buscador de Relatórios">
      <RelatoriLayout title="Pesquisa Avançada" description="Encontre relatórios específicos através de filtros avançados.">
        <Helmet>
          <title>Buscador de Relatórios | Costa Lavos 360</title>
        </Helmet>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filtros de Busca</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                🚧 Funcionalidade de busca global de relatórios em desenvolvimento.
              </p>
            </CardContent>
          </Card>
        </div>
      </RelatoriLayout>
    </ModulePageTemplate>
  );
}
