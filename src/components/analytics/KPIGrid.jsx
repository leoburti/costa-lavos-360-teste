import React from 'react';
import { AnalyticsKPI } from './AnalyticsWidgets';

const KPIGrid = ({ kpis, loading }) => {
  const safeKpis = Array.isArray(kpis) ? kpis : [];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {safeKpis.map((kpi, index) => (
        <AnalyticsKPI
          key={index}
          title={kpi.title}
          value={kpi.value}
          trend={kpi.trend}
          trendValue={kpi.trendValue}
          icon={kpi.icon}
          loading={loading}
          format={kpi.format}
        />
      ))}
    </div>
  );
};

export default KPIGrid;