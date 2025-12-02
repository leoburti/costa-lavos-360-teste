
import React from 'react';
import { Helmet } from 'react-helmet-async';
import ModulePageTemplate from '@/components/ModulePageTemplate';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import RelatoriLayout from '@/pages/relatorios/components/RelatoriLayout'; // Corrected import path

export default function SystemHealth() {
  return (
    <ModulePageTemplate title="Saúde do Sistema">
      <RelatoriLayout title="Diagnóstico de Sistema" description="Monitoramento de integridade e performance.">
        <Helmet>
          <title>Saúde do Sistema | Costa Lavos 360</title>
        </Helmet>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status dos Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <h3 className="font-semibold text-green-800">Banco de Dados</h3>
                  <p className="text-sm text-green-600">Operacional</p>
                </div>
                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <h3 className="font-semibold text-green-800">API Backend</h3>
                  <p className="text-sm text-green-600">Operacional</p>
                </div>
                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <h3 className="font-semibold text-green-800">Autenticação</h3>
                  <p className="text-sm text-green-600">Operacional</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </RelatoriLayout>
    </ModulePageTemplate>
  );
}
