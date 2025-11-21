import React from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#F43F5E', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899'];

const CustomizedContent = ({ root, depth, x, y, width, height, index, colors, name, value }) => {
  if (!root || !root.value) return null;
  
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: depth < 2 ? colors[index % colors.length] : 'none',
          stroke: 'hsl(var(--card))',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
        rx="2"
      />
      {depth === 1 && width > 60 && height > 30 ? (
        <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={14} className="font-bold pointer-events-none">
          {name}
        </text>
      ) : null}
      {depth === 1 && width > 90 && height > 50 ? (
         <text x={x + 6} y={y + 20} fill="#fff" fontSize={12} fillOpacity={0.8} className="pointer-events-none">
            {`${((value / root.value) * 100).toFixed(0)}%`}
          </text>
      ) : null}
    </g>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value, root } = payload[0].payload;
    if (!root || !root.value) return null;
    const percentage = root.value > 0 ? (value / root.value * 100).toFixed(2) : 0;
    const formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    return (
      <div className="bg-card/80 backdrop-blur-sm border p-3 rounded-md shadow-lg text-sm">
        <p className="font-bold text-base">{name}</p>
        <p className="text-foreground">Vendas: {formattedValue}</p>
        <p className="text-muted-foreground">Participação: {percentage}%</p>
      </div>
    );
  }
  return null;
};


const TreeMapChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full text-muted-foreground">
        Nenhum dado para exibir.
      </div>
    );
  }
  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full"
    >
      <ResponsiveContainer width="100%" height={400}>
        <Treemap
          data={data}
          dataKey="size"
          ratio={4 / 3}
          stroke="hsl(var(--card))"
          fill="hsl(var(--primary))"
          content={<CustomizedContent colors={COLORS} />}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default TreeMapChart;