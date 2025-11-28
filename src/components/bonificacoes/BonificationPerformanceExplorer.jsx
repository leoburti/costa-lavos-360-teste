import React from 'react';
import DrilldownExplorer from '@/components/DrilldownExplorer';

const BonificationPerformanceExplorer = ({ filters }) => {
  return <DrilldownExplorer analysisMode="supervisor" filters={filters} />;
};

export default BonificationPerformanceExplorer;