import React from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import ChartContainer from './ChartContainer';
import { extractValue } from '@/utils/dataValidator';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-slate-200 rounded shadow-md text-xs">
        <p className="font-bold">{payload[0].payload.name}</p>
        <p>Valor: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const TreemapExplorer = ({ title, data, loading }) => {
  // Sanitiza dados para o Treemap
  const safeData = Array.isArray(data) ? data.map(item => ({
    name: extractValue(item.name),
    size: Number(extractValue(item.value || item.size, 0))
  })).filter(item => item.size > 0) : [];

  return (
    <ChartContainer title={title} loading={loading} height={400}>
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={safeData}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="#fff"
          fill="#3b82f6"
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default TreemapExplorer;