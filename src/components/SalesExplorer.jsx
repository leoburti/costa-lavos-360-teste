import React from 'react';
import DrilldownExplorer from './DrilldownExplorer';

const SalesExplorer = ({ analysisMode = 'region', filters = {} }) => {
  return <DrilldownExplorer analysisMode={analysisMode} filters={filters} />;
};

export default SalesExplorer;