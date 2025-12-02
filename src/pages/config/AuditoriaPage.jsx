import React from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfigMock } from '@/hooks/useConfigMock';
import { formatDate } from '@/lib/utils';
import { Activity } from 'lucide-react';

const AuditoriaPage = () => {
  const { logs } = useConfigMock(); // Reusing logs mock for audit timeline visualization

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet><title>Auditoria | Config</title></Helmet>
      
      <PageHeader 
        title="Trilha de Auditoria" 
        description="Histórico detalhado de ações críticas no sistema."
        breadcrumbs={[{ label: 'Configurações', path: '/configuracoes' }, { label: 'Auditoria' }]}
      />

      <Card>
        <CardHeader><CardTitle>Timeline de Eventos</CardTitle></CardHeader>
        <CardContent>
          <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 py-4">
            {logs.map((log, idx) => (
              <div key={log.id} className="relative pl-8">
                <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-slate-300 ring-4 ring-white" />
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{log.action} em {log.module}</p>
                    <p className="text-sm text-slate-600">Executado por <span className="font-medium">{log.user}</span></p>
                    <p className="text-xs text-slate-500 mt-1">{log.details}</p>
                  </div>
                  <span className="text-xs font-mono text-slate-400 whitespace-nowrap">
                    {formatDate(log.date, 'dd/MM/yyyy HH:mm:ss')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditoriaPage;