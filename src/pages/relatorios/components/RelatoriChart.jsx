import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { safeNumber, extractValue } from '@/utils/dataValidator';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function RelatoriChart({ type = 'bar', data, dataKey, xAxisKey }) {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Nenhum dado para gráfico</div>;
  }

  // Sanitize data for the chart to prevent breaks on object values
  const safeData = data.map(item => ({
    ...item,
    [dataKey]: safeNumber(item[dataKey]),
    [xAxisKey]: extractValue(item[xAxisKey])
  }));

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={safeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              formatter={(value) => [
                Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                'Valor'
              ]}
            />
            <Legend />
            <Bar dataKey={dataKey} fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={safeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              formatter={(value) => [
                Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                'Valor'
              ]}
            />
            <Legend />
            <Line type="monotone" dataKey={dataKey} stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={safeData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${String(name).substring(0, 15)}...`}
              outerRadius={120}
              fill="#8884d8"
              dataKey={dataKey}
            >
              {safeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
               formatter={(value) => [
                Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                'Valor'
              ]}
            />
            <Legend />
          </PieChart>
        );
      default:
        return null;
    }
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      {renderChart()}
    </ResponsiveContainer>
  );
}