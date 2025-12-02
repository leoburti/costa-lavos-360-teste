import React from 'react';
import AnalyticsPageTemplate from '@/components/analytics/AnalyticsPageTemplate';
import { AnalyticsKPI, AnalyticsChart, AnalyticsTable } from '@/components/analytics/AnalyticsWidgets';
import { Users, Target, ShoppingBag } from 'lucide-react';

const DashboardSupervisao = () => {
  // Using simulated data directly for brevity in this example
  const kpis = [
    { title: 'Meta Equipe', value: 500000, trend: 'neutral', trendValue: '85% atingido', format: 'currency', icon: Target },
    { title: 'Vendas Equipe', value: 425000, trend: 'up', trendValue: '5%', format: 'currency', icon: ShoppingBag },
    { title: 'Vendedores Ativos', value: 12, trend: 'neutral', trendValue: '100%', format: 'number', icon: Users },
    { title: 'Ticket Médio', value: 3500, trend: 'down', trendValue: '2%', format: 'currency' },
  ];

  const teamData = [
    { name: 'Equipe Alpha', vendas: 150000, meta: 140000 },
    { name: 'Equipe Beta', vendas: 120000, meta: 130000 },
    { name: 'Equipe Gama', vendas: 155000, meta: 150000 },
  ];

  const supervisorsTable = [
    { name: 'Roberto Alves', equipe: 'Alpha', vendas: 150000, atingimento: 107 },
    { name: 'Juliana Costa', equipe: 'Beta', vendas: 120000, atingimento: 92 },
    { name: 'Marcos Lima', equipe: 'Gama', vendas: 155000, atingimento: 103 },
  ];

  return (
    <AnalyticsPageTemplate 
      title="Dashboard Supervisão" 
      breadcrumbs={[{ label: 'Analytics', path: '/dashboard' }, { label: 'Supervisão' }]}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <AnalyticsKPI key={idx} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart 
          title="Performance por Equipe" 
          data={teamData}
          type="bar"
          dataKeys={['vendas', 'meta']}
          colors={['#2563EB', '#E2E8F0']}
        />
        
        <AnalyticsTable 
          title="Supervisores em Destaque"
          columns={[
            { label: 'Supervisor', key: 'name' },
            { label: 'Equipe', key: 'equipe' },
            { label: 'Vendas', key: 'vendas', render: (row) => `R$ ${row.vendas.toLocaleString()}` },
            { label: '% Meta', key: 'atingimento', render: (row) => <span className="font-bold">{row.atingimento}%</span> }
          ]}
          data={supervisorsTable}
        />
      </div>
    </AnalyticsPageTemplate>
  );
};

export default DashboardSupervisao;