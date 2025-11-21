import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ProdutividadeReport({ data }) {
  if (!data || data.length === 0) return <div className="text-center py-10 text-muted-foreground">Nenhum dado de produtividade encontrado.</div>;

  return (
    <div className="space-y-6">
      <div className="h-[300px] w-full bg-card p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Chamados por Profissional</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="profissional_nome" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total_chamados" name="Total" fill="#94a3b8" />
            <Bar dataKey="chamados_concluidos" name="Concluídos" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Profissional</TableHead>
              <TableHead>Total Chamados</TableHead>
              <TableHead>Concluídos</TableHead>
              <TableHead>Tempo Médio (min)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, i) => (
              <TableRow key={i}>
                <TableCell>{row.profissional_nome}</TableCell>
                <TableCell>{row.total_chamados}</TableCell>
                <TableCell>{row.chamados_concluidos}</TableCell>
                <TableCell>{Number(row.tempo_medio_atendimento_minutos).toFixed(0)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}