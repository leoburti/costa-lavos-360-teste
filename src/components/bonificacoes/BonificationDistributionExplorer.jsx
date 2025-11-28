import React from 'react';
import DrilldownExplorer from '@/components/DrilldownExplorer';

const BonificationDistributionExplorer = ({ filters }) => {
  return <DrilldownExplorer analysisMode="customerGroup" filters={filters} />;
};

export default BonificationDistributionExplorer;