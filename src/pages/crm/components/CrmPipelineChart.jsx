import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function CrmPipelineChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="stage" />
        <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
        <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="value" name="Valor (R$)" fill="#3b82f6" />
        <Bar yAxisId="right" dataKey="count" name="Quantidade" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  );
}