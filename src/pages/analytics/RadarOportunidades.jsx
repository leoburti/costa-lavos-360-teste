import React from 'react';
import AnalyticsPageTemplate from '@/components/analytics/AnalyticsPageTemplate';
import { AnalyticsChart } from '@/components/analytics/AnalyticsWidgets';
import { useAnalyticsMock } from '@/hooks/useAnalyticsMock';

const RadarOportunidades = () => {
  const { radarOportunidades } = useAnalyticsMock();

  return (
    <AnalyticsPageTemplate 
      title="Radar de Oportunidades" 
      breadcrumbs={[{ label: 'Analytics', path: '/dashboard' }, { label: 'Radar' }]}
    >
      <div className="grid grid-cols-1 gap-6">
        <div className="h-[500px]">
            <AnalyticsChart 
            title="Análise Multidimensional: Equipe A vs Equipe B" 
            data={radarOportunidades}
            type="radar"
            dataKeys={['A', 'B']}
            colors={['#2563EB', '#F59E0B']}
            height={450}
            />
        </div>
      </div>
    </AnalyticsPageTemplate>
  );
};

export default RadarOportunidades;