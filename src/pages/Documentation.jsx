
import React from 'react';
import { Helmet } from 'react-helmet-async';
import ModulePageTemplate from '@/components/ModulePageTemplate';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import RelatoriLayout from '@/pages/relatorios/components/RelatoriLayout'; // Corrected import path

export default function Documentation() {
  return (
    <ModulePageTemplate title="Documentação do Sistema">
      <RelatoriLayout title="Documentação" description="Central de ajuda e documentação do sistema Costa Lavos 360.">
        <Helmet>
          <title>Documentação | Costa Lavos 360</title>
        </Helmet>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manuais e Guias</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                🚧 A documentação completa do sistema está sendo migrada para esta seção.
              </p>
              <ul className="list-disc list-inside mt-4 text-slate-700 space-y-2">
                <li>Manual do Usuário - Vendas</li>
                <li>Guia de CRM e Gestão de Clientes</li>
                <li>Procedimentos de Bonificação</li>
                <li>Políticas de Comodato e Equipamentos</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </RelatoriLayout>
    </ModulePageTemplate>
  );
}
