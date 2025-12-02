import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export function PerformanceChart({ data }) {
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.performance_date).toLocaleDateString('pt-BR'),
    efficiency: Number(item.efficiency_percentage),
    uptime: Number(item.uptime_percentage)
  }));

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="efficiency" name="Eficiência (%)" stroke="#8884d8" />
          <Line type="monotone" dataKey="uptime" name="Uptime (%)" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}