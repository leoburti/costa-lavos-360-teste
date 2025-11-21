import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function TecnicosTab({ data }) {
  if (!data || data.length === 0) return <div className="text-center py-10 text-muted-foreground">Nenhum dado de técnicos encontrado.</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Produtividade da Equipe</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="tecnico_nome" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_chamados" name="Total Chamados" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="concluidos" name="Concluídos" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detalhamento por Técnico</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Técnico</TableHead>
                <TableHead className="text-right">Total Chamados</TableHead>
                <TableHead className="text-right">Concluídos</TableHead>
                <TableHead className="text-right">Taxa Conclusão</TableHead>
                <TableHead className="text-right">Tempo Médio (min)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{row.tecnico_nome}</TableCell>
                  <TableCell className="text-right">{row.total_chamados}</TableCell>
                  <TableCell className="text-right">{row.concluidos}</TableCell>
                  <TableCell className="text-right">
                    {row.total_chamados > 0 ? ((row.concluidos / row.total_chamados) * 100).toFixed(1) : 0}%
                  </TableCell>
                  <TableCell className="text-right">{Number(row.tempo_medio).toFixed(0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}