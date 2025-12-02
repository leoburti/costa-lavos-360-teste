
import React from 'react';
import { Helmet } from 'react-helmet-async';
import ModulePageTemplate from '@/components/ModulePageTemplate';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import RelatoriLayout from '@/pages/relatorios/components/RelatoriLayout'; // Corrected import path

export default function SecurityAudit() {
  return (
    <ModulePageTemplate title="Auditoria de Segurança">
      <RelatoriLayout title="Segurança e Conformidade" description="Ferramentas de auditoria de segurança e controle de acesso.">
        <Helmet>
          <title>Auditoria de Segurança | Costa Lavos 360</title>
        </Helmet>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Segurança</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                🚧 Módulo de auditoria de segurança em desenvolvimento.
              </p>
            </CardContent>
          </Card>
        </div>
      </RelatoriLayout>
    </ModulePageTemplate>
  );
}
