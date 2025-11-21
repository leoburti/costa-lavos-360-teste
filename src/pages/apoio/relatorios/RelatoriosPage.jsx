import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePieChart, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet-async';

const RelatoriosPage = () => {
  const { toast } = useToast();

  const handleDownload = (reportName) => {
    toast({
      title: `Gerando ${reportName}...`,
      description: "🚧 Esta funcionalidade ainda não foi implementada.",
    });
  };

  const reports = [
    { name: 'Relatório de Desempenho de Técnicos', description: 'Análise de chamados concluídos, tempo médio e satisfação.' },
    { name: 'Relatório de Inventário de Comodato', description: 'Visão geral de todos os equipamentos em campo por cliente.' },
    { name: 'Relatório de SLA de Chamados', description: 'Acompanhamento do cumprimento dos prazos de atendimento.' },
    { name: 'Relatório de Custos Operacionais', description: 'Análise de custos com deslocamento e peças.' },
  ];

  return (
    <>
      <Helmet>
        <title>Relatórios - Módulo de Apoio</title>
        <meta name="description" content="Página de relatórios do módulo de apoio." />
      </Helmet>
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Central de Relatórios</h1>
            <p className="text-muted-foreground">Exporte dados e insights sobre as operações de apoio.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Relatórios Disponíveis</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {reports.map((report) => (
              <Card key={report.name} className="p-4">
                <div className="flex flex-col h-full">
                  <div className="flex-grow">
                    <FilePieChart className="w-8 h-8 text-primary mb-2" />
                    <h3 className="font-semibold">{report.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" onClick={() => handleDownload(report.name)}>
                      <Download className="w-4 h-4 mr-2" />
                      Gerar Relatório
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default RelatoriosPage;