import React from 'react';
import AnalyticsPageTemplate from '@/components/analytics/AnalyticsPageTemplate';
import { AnalyticsChart, AnalyticsTable, AnalyticsKPI } from '@/components/analytics/AnalyticsWidgets';
import { useAnalyticsMock } from '@/hooks/useAnalyticsMock';
import { Filter } from 'lucide-react';

const FunilVendas = () => {
  const { funilVendas } = useAnalyticsMock();

  const conversionRate = ((funilVendas[funilVendas.length - 1].value / funilVendas[0].value) * 100).toFixed(1);

  return (
    <AnalyticsPageTemplate 
      title="Funil de Vendas" 
      breadcrumbs={[{ label: 'Analytics', path: '/dashboard' }, { label: 'Funil' }]}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnalyticsKPI title="Taxa de Conversão Global" value={conversionRate} format="percentage" icon={Filter} />
        <AnalyticsKPI title="Total Leads" value={funilVendas[0].value} format="number" />
        <AnalyticsKPI title="Negócios Fechados" value={funilVendas[funilVendas.length - 1].value} format="number" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart 
          title="Pipeline de Vendas" 
          data={funilVendas}
          type="funnel"
          dataKeys={['value']}
        />
        
        <AnalyticsTable 
          title="Detalhamento por Estágio"
          columns={[
            { label: 'Estágio', key: 'name' },
            { label: 'Quantidade', key: 'value' },
            { label: '% do Anterior', key: 'dropoff', render: (row, i, all) => {
                if (i === 0) return '100%';
                const prev = all[i-1].value;
                return `${((row.value / prev) * 100).toFixed(1)}%`;
            }}
          ]}
          data={funilVendas}
        />
      </div>
    </AnalyticsPageTemplate>
  );
};

export default FunilVendas;