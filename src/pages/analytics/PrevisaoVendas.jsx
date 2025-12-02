import React from 'react';
import AnalyticsPageTemplate from '@/components/analytics/AnalyticsPageTemplate';
import { AnalyticsChart, AnalyticsTable } from '@/components/analytics/AnalyticsWidgets';
import { useAnalyticsMock } from '@/hooks/useAnalyticsMock';

const PrevisaoVendas = () => {
  const { previsaoVendas } = useAnalyticsMock();

  return (
    <AnalyticsPageTemplate 
      title="Previsão de Vendas (Forecasting)" 
      breadcrumbs={[{ label: 'Analytics', path: '/dashboard' }, { label: 'Previsão' }]}
    >
      <div className="space-y-6">
        <AnalyticsChart 
          title="Realizado vs Previsto" 
          data={previsaoVendas}
          type="line"
          dataKeys={['real', 'previsto']}
          colors={['#2563EB', '#94A3B8']} // Real blue, Predicted gray/dashed ideally (generic chart limitation)
        />

        <AnalyticsTable 
          title="Tabela de Projeção Semanal"
          columns={[
            { label: 'Período', key: 'name' },
            { label: 'Realizado (R$)', key: 'real', render: (r) => r.real ? `R$ ${r.real}` : '-' },
            { label: 'Previsto (R$)', key: 'previsto', render: (r) => `R$ ${r.previsto}` },
            { label: 'Desvio', key: 'diff', render: (r) => r.real ? `${((r.real - r.previsto)/r.previsto * 100).toFixed(1)}%` : '-' }
          ]}
          data={previsaoVendas}
        />
      </div>
    </AnalyticsPageTemplate>
  );
};

export default PrevisaoVendas;