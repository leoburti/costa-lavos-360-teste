import React from 'react';
import { AnalyticsTable } from './AnalyticsWidgets';

const DataExplorer = ({ title, data, columns, loading }) => {
  return (
    <AnalyticsTable 
      title={title} 
      data={data} 
      columns={columns} 
      loading={loading} 
    />
  );
};

export default DataExplorer;