import React from 'react';
import DailySalesDrilldown from '@/components/DailySales/DailySalesDrilldown';

const DailySalesDayDetail = ({ selectedDay }) => {
  return <DailySalesDrilldown selectedDay={selectedDay} />;
};

export default DailySalesDayDetail;