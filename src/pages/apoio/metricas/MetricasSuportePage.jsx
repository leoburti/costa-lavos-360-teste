import React from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/PageHeader';
import { useApoioMock } from '@/hooks/useApoioMock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, ThumbsUp, Ticket } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const MetricasSuportePage = () => {
  const { metrics, loading } = useApoioMock();

  const kpis = [
      { title: 'Tempo Médio Resp.', value: metrics?.avgResponseTime, icon: Clock, color: 'text-blue-600 bg-blue-100' },
      { title: 'Taxa de Resolução', value: metrics?.resolutionRate + '%', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-100' },
      { title: 'Satisfação (CSAT)', value: metrics?.csatScore + '/5.0', icon: ThumbsUp, color: 'text-amber-600 bg-amber-100' },
      { title: 'Tickets Ativos', value: metrics?.activeTickets, icon: Ticket, color: 'text-purple-600 bg-purple-100' },
  ];

  if (loading) return <div className="p-6">Carregando métricas...</div>;

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet><title>Métricas de Suporte | Apoio</title></Helmet>
      
      <PageHeader 
        title="Dashboard de Métricas" 
        description="Indicadores chave de desempenho da equipe de suporte."
        breadcrumbs={[{ label: 'Apoio', path: '/apoio' }, { label: 'Métricas' }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, idx) => (
              <Card key={idx} className="border-slate-200 shadow-sm">
                  <CardContent className="p-6 flex items-center justify-between">
                      <div>
                          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{kpi.title}</p>
                          <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</h3>
                      </div>
                      <div className={`p-3 rounded-full ${kpi.color}`}>
                          <kpi.icon className="h-6 w-6" />
                      </div>
                  </CardContent>
              </Card>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-200 shadow-sm">
              <CardHeader><CardTitle>Volume de Tickets (Últimos 7 dias)</CardTitle></CardHeader>
              <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metrics.ticketsByDay}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" tick={{fontSize: 12}} />
                          <YAxis tick={{fontSize: 12}} />
                          <Tooltip cursor={{fill: '#f8fafc'}} />
                          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                  </ResponsiveContainer>
              </CardContent>
          </Card>
          
          <Card className="border-slate-200 shadow-sm">
              <CardHeader><CardTitle>Distribuição por Categoria</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-center h-[300px] text-slate-400">
                  Gráfico de Pizza em desenvolvimento...
              </CardContent>
          </Card>
      </div>
    </div>
  );
};

export default MetricasSuportePage;