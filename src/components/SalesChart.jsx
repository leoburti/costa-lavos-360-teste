import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency, formatLargeNumberCompact } from '@/lib/utils';
import { format, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SalesChart = ({ 
  data, 
  title = "Vendas Diárias", 
  height = 350,
  series = [
    { key: 'total', name: 'Receita', color: '#10b981' }, 
    { key: 'bonification', name: 'Bonificação', color: '#8b5cf6' }, 
    { key: 'equipment', name: 'Equipamentos', color: '#3b82f6' } 
  ]
}) => {
  const formatDateTick = (dateStr) => {
    if (!dateStr) return '';
    try {
      // Robust date parsing
      let date;
      if (dateStr instanceof Date) {
        date = dateStr;
      } else if (typeof dateStr === 'string') {
        // Try standard ISO parsing first
        date = parseISO(dateStr);
        if (!isValid(date)) {
            // Fallback for simple YYYY-MM-DD strings if parseISO fails slightly
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                date = new Date(parts[0], parts[1] - 1, parts[2]);
            } else {
                return dateStr;
            }
        }
      } else {
        return dateStr;
      }

      if (isValid(date)) return format(date, 'dd/MM', { locale: ptBR });
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  // Robust data transformation to prevent chart errors
  const safeData = Array.isArray(data) ? data.map(item => ({
    ...item,
    date: item.date, // Keep original for XAxis dataKey
    total: Number(item.total) || 0,
    bonification: Number(item.bonification) || 0,
    equipment: Number(item.equipment) || 0
  })) : [];

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={safeData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDateTick}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            minTickGap={30}
          />
          <YAxis 
            tickFormatter={(val) => formatLargeNumberCompact(val)} 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip 
            formatter={(val, name) => [formatCurrency(val), name]}
            labelFormatter={(label) => formatDateTick(label)}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36} />
          
          {series.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                fillOpacity={0.2}
                fill={s.color}
                strokeWidth={2}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;