
import React from 'react';
import { Helmet } from 'react-helmet-async';
import ModulePageTemplate from '@/components/ModulePageTemplate';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import RelatoriLayout from '@/pages/relatorios/components/RelatoriLayout'; // Corrected import path

export default function SystemLogs() {
  return (
    <ModulePageTemplate title="Logs do Sistema">
      <RelatoriLayout title="Logs de Auditoria" description="Registro de atividades e eventos do sistema.">
        <Helmet>
          <title>Logs do Sistema | Costa Lavos 360</title>
        </Helmet>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Registros Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                🚧 Visualizador de logs em desenvolvimento.
              </p>
            </CardContent>
          </Card>
        </div>
      </RelatoriLayout>
    </ModulePageTemplate>
  );
}
