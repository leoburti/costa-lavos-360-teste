import React, { useMemo } from 'react';
import { ResponsiveContainer, Treemap, Tooltip as RechartsTooltip } from 'recharts';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { formatCurrency, formatLargeNumberCompact } from '@/lib/utils';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800">
        <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{data.name}</p>
        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{formatCurrency(data.size)}</p>
      </div>
    );
  }
  return null;
};

const CustomizedContent = React.memo(({ root, depth, x, y, width, height, index, colors, name, size }) => {
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: colors[index % colors.length],
          stroke: '#fff',
          strokeWidth: 2,
        }}
      />
      {width > 80 && height > 40 && (
        <foreignObject x={x + 4} y={y + 4} width={width - 8} height={height - 8}>
            <div className="text-white font-semibold text-xs overflow-hidden text-ellipsis whitespace-nowrap">
              {name}
            </div>
            <div className="text-white font-bold text-sm">
              {formatLargeNumberCompact(size)}
            </div>
        </foreignObject>
      )}
    </motion.g>
  );
});

const TreeMapChart = ({ data: externalData, title, description }) => {
  const COLORS = useMemo(() => [
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
    '#10b981', '#22c55e', '#84cc16',
    '#f97316', '#ef4444', '#ec4899', '#d946ef'
  ], []);

  const chartData = useMemo(() => {
    if (!externalData) return [];
    return externalData
      .filter(item => item && item.name && typeof item.size === 'number')
      .map(item => ({ ...item, name: String(item.name) }));
  }, [externalData]);

  return (
    <Card className="h-full shadow-sm border-slate-200/60">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800">{title}</CardTitle>
        {description && <CardDescription className="text-sm">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="h-[400px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={chartData}
              dataKey="size"
              ratio={4 / 3}
              stroke="#fff"
              fill="#8884d8"
              content={<CustomizedContent colors={COLORS} />}
            >
              <RechartsTooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            Nenhum dado para exibir.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(TreeMapChart);