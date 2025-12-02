
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PerformanceMonitor = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Monitor de Performance | Costa Lavos 360</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Monitor de Performance
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitore o desempenho do sistema e processos em tempo real.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monitoramento em Tempo Real</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Visualize métricas de performance do sistema e vendas em tempo real.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
