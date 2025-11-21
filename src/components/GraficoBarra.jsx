import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const GraficoBarra = ({ dados, titulo, eixoX, eixoY }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{titulo}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dados}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={eixoX} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={eixoY} fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoBarra;