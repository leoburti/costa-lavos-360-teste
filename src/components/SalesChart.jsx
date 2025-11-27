import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency, formatLargeNumberCompact } from '@/lib/utils';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Maximize2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dateLabel = isValid(new Date(label)) 
      ? format(new Date(label), "dd 'de' MMMM", { locale: ptBR }) 
      : label;

    return (
      <div className="bg-white p-4 border rounded-lg shadow-lg text-sm z-50">
        <p className="font-semibold text-gray-700 mb-2 border-b pb-1">{dateLabel}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }} // Use entry.color directly
                />
                <span className="text-gray-600 capitalize">{entry.name}:</span>
              </div>
              <span className="font-medium tabular-nums">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const SalesChart = ({ 
  data, 
  title = "Vendas Diárias", 
  height = 350,
  series = [
    // Colors matched to the reference image:
    // Receita: Dark Brown/Reddish (Matches the dark wave in the image)
    { key: 'total', name: 'Receita', color: '#7f1d1d' }, 
    // Bonificação: Beige/Tan (Matches the light wave in the image)
    { key: 'bonification', name: 'Bonificação', color: '#d6d3d1' }, 
    // Equipamentos: Blue (Matches the bottom line in the image)
    { key: 'equipment', name: 'Equipamentos', color: '#3b82f6' } 
  ]
}) => {
  const formatDateTick = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return isValid(date) ? format(date, 'dd/MM') : dateStr;
  };

  return (
    <Card className="shadow-sm bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
        <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
        <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                <Maximize2 className="h-4 w-4" />
            </Button>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div style={{ width: '100%', height: height }}>
          <ResponsiveContainer>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                {series.map((s) => (
                    <linearGradient key={s.key} id={`color-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                        {/* Solid color for the stroke look, fading fill */}
                        <stop offset="5%" stopColor={s.color} stopOpacity={0.6} />
                        <stop offset="95%" stopColor={s.color} stopOpacity={0.1} />
                    </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDateTick}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                minTickGap={30}
                dy={10}
              />
              <YAxis 
                tickFormatter={formatLargeNumberCompact} 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Legend 
                iconType="circle" 
                verticalAlign="bottom" 
                height={36} 
                wrapperStyle={{ paddingTop: '20px' }}
              />
              
              {series.map((s) => (
                  <Area
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.name}
                    stroke={s.color}
                    fillOpacity={1}
                    fill={`url(#color-${s.key})`}
                    strokeWidth={2}
                    stackId={s.stackId} 
                  />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesChart;