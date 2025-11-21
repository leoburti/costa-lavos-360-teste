import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DeslocamentoReport({ data }) {
  if (!data || data.length === 0) return <div className="text-center py-10 text-muted-foreground">Nenhum dado de deslocamento encontrado.</div>;

  return (
    <div className="space-y-6">
      <div className="h-[300px] w-full bg-card p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Distância Percorrida por Dia (km)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="data" 
              tickFormatter={(val) => format(new Date(val), 'dd/MM', { locale: ptBR })}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(val) => format(new Date(val), 'dd/MM/yyyy', { locale: ptBR })}
            />
            <Legend />
            <Line type="monotone" dataKey="distancia_total_km" name="Distância (km)" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Profissional</TableHead>
              <TableHead>Distância (km)</TableHead>
              <TableHead>Tempo (h)</TableHead>
              <TableHead>Vel. Média (km/h)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, i) => (
              <TableRow key={i}>
                <TableCell>{format(new Date(row.data), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                <TableCell>{row.profissional_nome}</TableCell>
                <TableCell>{Number(row.distancia_total_km).toFixed(2)}</TableCell>
                <TableCell>{Number(row.tempo_total_horas).toFixed(2)}</TableCell>
                <TableCell>{Number(row.velocidade_media_kmh).toFixed(1)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}