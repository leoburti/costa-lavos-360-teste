import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const GraficoLinha = ({ dados, titulo, eixoX, eixoY }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{titulo}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={dados}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={eixoX} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={eixoY} stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoLinha;