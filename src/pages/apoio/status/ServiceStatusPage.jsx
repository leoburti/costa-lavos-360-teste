import React from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/apoio/StatusBadge';
import { useApoioMock } from '@/hooks/useApoioMock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react';

const ServiceStatusPage = () => {
  const { systemStatus, loading } = useApoioMock();

  const getStatusIcon = (status) => {
      switch(status) {
          case 'operacional': return <CheckCircle className="h-6 w-6 text-green-500" />;
          case 'degradado': return <AlertTriangle className="h-6 w-6 text-amber-500" />;
          default: return <XCircle className="h-6 w-6 text-red-500" />;
      }
  };

  if (loading) return <div className="p-6">Carregando status...</div>;

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet><title>Status dos Serviços | Apoio</title></Helmet>
      
      <PageHeader 
        title="Status do Sistema" 
        description="Monitoramento em tempo real da disponibilidade dos serviços."
        breadcrumbs={[{ label: 'Apoio', path: '/apoio' }, { label: 'Status' }]}
      />

      {/* Overall Status Banner */}
      <div className={`p-6 rounded-xl border flex items-center gap-4 ${
          systemStatus.overall === 'operacional' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
      }`}>
          {getStatusIcon(systemStatus.overall)}
          <div>
              <h2 className={`text-lg font-bold ${
                  systemStatus.overall === 'operacional' ? 'text-green-800' : 'text-amber-800'
              }`}>
                  {systemStatus.overall === 'operacional' ? 'Todos os sistemas operacionais' : 'Alguns sistemas apresentam instabilidade'}
              </h2>
              <p className="text-sm opacity-80">Última atualização: Agora mesmo</p>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-200 shadow-sm">
              <CardHeader><CardTitle>Serviços</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                  {systemStatus.services.map((service, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="font-medium text-slate-800">{service.name}</div>
                          <div className="flex items-center gap-4">
                              <span className="text-xs text-slate-500 font-mono">{service.uptime}</span>
                              <StatusBadge status={service.status} type="service" />
                          </div>
                      </div>
                  ))}
              </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
              <CardHeader><CardTitle>Incidentes Recentes</CardTitle></CardHeader>
              <CardContent>
                  <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 pl-6">
                      {systemStatus.incidents.map((incident, idx) => (
                          <div key={idx} className="relative">
                              <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-slate-400 ring-4 ring-white"></div>
                              <h4 className="font-bold text-slate-800">{incident.title}</h4>
                              <p className="text-xs text-slate-500 mb-1">{incident.date}</p>
                              <div className="flex gap-2 mt-2">
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded capitalize">{incident.status}</span>
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded capitalize">Impacto: {incident.impact}</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </CardContent>
          </Card>
      </div>
    </div>
  );
};

export default ServiceStatusPage;