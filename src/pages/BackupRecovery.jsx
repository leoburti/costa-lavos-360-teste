
import React from 'react';
import { Helmet } from 'react-helmet-async';
import ModulePageTemplate from '@/components/ModulePageTemplate';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import RelatoriLayout from '@/pages/relatorios/components/RelatoriLayout'; // Corrected import path

export default function BackupRecovery() {
  return (
    <ModulePageTemplate title="Backup e Recuperação">
      <RelatoriLayout title="Backup e Recuperação" description="Gerencie as configurações de backup e recuperação de dados.">
        <Helmet>
          <title>Backup e Recuperação | Costa Lavos 360</title>
        </Helmet>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Backup</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                🚧 Esta seção de backup e recuperação está em desenvolvimento.
              </p>
              <p className="text-muted-foreground mt-2">
                Você poderá configurar backups automáticos e restaurar dados aqui em breve.
              </p>
            </CardContent>
          </Card>
        </div>
      </RelatoriLayout>
    </ModulePageTemplate>
  );
}
