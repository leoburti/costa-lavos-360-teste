import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, DollarSign, AlertTriangle, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const MetricCard = ({ title, value, icon: Icon, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const DeliveryManagementDashboard = () => {
  const { toast } = useToast();

  const handleNotImplemented = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "🚧 Este recurso ainda não foi implementado. Você pode solicitar em um próximo prompt! 🚀",
    });
  };

  const kpis = [
    { title: 'Saldo de Caixas', value: 'N/D', icon: Box, description: 'Saldo atual de caixas' },
    { title: 'Caixas em Circulação', value: 'N/D', icon: DollarSign, description: 'Caixas com clientes' },
    { title: 'Devoluções em Atraso', value: 'N/D', icon: AlertTriangle, description: 'Clientes com devoluções atrasadas' },
    { title: 'Clientes Ativos', value: 'N/D', icon: Users, description: 'Clientes com movimentação recente' },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - Gestão de Entregas</title>
        <meta name="description" content="Visão geral e KPIs da gestão de entregas." />
      </Helmet>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard de Entregas</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <MetricCard key={kpi.title} {...kpi} />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Visão Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 bg-muted rounded-md">
                <p className="text-muted-foreground">Gráficos e mais informações aparecerão aqui.</p>
              </div>
              <button onClick={handleNotImplemented} className="mt-4 p-2 bg-primary text-primary-foreground rounded">
                Ver Detalhes
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default DeliveryManagementDashboard;