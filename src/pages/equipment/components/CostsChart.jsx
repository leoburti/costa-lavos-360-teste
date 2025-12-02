import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export function CostsChart({ data }) {
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.cost_date).toLocaleDateString('pt-BR'),
    maintenance: Number(item.maintenance_cost),
    operational: Number(item.operational_cost)
  }));

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="maintenance" name="Manutenção (R$)" fill="#f43f5e" stackId="a" />
          <Bar dataKey="operational" name="Operacional (R$)" fill="#3b82f6" stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}