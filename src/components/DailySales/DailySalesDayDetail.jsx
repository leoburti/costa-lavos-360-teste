import React from 'react';
import DailySalesDrilldown from '@/components/DailySales/DailySalesDrilldown';

// Wrapper component for clarity, though Drilldown can be used directly
const DailySalesDayDetail = ({ selectedDay }) => {
  return <DailySalesDrilldown selectedDay={selectedDay} />;
};

export default DailySalesDayDetail;