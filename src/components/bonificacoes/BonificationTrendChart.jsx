import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const month = format(new Date(`${label}-02`), "MMM/yy", { locale: ptBR });
    return (
      <div className="bg-card/80 backdrop-blur-sm p-3 border border-border rounded-lg shadow-lg">
        <p className="label font-bold text-foreground capitalize">{month}</p>
        <p className="intro text-pink-600">{`Bonificado: ${formatCurrency(payload[0]?.value)}`}</p>
        <p className="intro text-blue-600">{`Vendas: ${formatCurrency(payload[1]?.value)}`}</p>
        <p className="intro text-purple-600">{`% Bonificação: ${formatPercentage(payload[2]?.value)}`}</p>
      </div>
    );
  }

  return null;
};

const BonificationTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="h-80 flex items-center justify-center text-muted-foreground">Nenhum dado de tendência para exibir.</div>;
  }
  
  const maxBarValue = Math.max(...data.map(d => Math.max(d.total_bonification, d.total_net_sales)));
  const maxLineValue = Math.max(...data.map(d => d.percentage));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="month" 
            tickFormatter={(tick) => format(new Date(`${tick}-02`), "MMM/yy", { locale: ptBR })}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            yAxisId="left" 
            orientation="left" 
            stroke="#8884d8" 
            tickFormatter={(value) => `R$${(value / 1000)}k`}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            domain={[0, maxBarValue * 1.1]}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#82ca9d" 
            tickFormatter={(value) => `${value.toFixed(1)}%`}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            domain={[0, maxLineValue * 1.2]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar yAxisId="left" dataKey="total_bonification" name="Bonificado" fill="#ec4899" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="left" dataKey="total_net_sales" name="Vendas Líquidas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="percentage" name="% Bonificação" stroke="#a855f7" strokeWidth={2} dot={{ r: 4 }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BonificationTrendChart;