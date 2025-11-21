import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function EquipeReport({ data }) {
  if (!data || data.length === 0) return <div className="text-center py-10 text-muted-foreground">Nenhum dado de equipe encontrado.</div>;

  return (
    <div className="space-y-6">
      <div className="h-[350px] w-full bg-card p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Comparativo: Distância vs Conclusão</h3>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid />
            <XAxis type="number" dataKey="distancia_total_km" name="Distância (km)" unit="km" />
            <YAxis type="number" dataKey="chamados_concluidos" name="Chamados Concluídos" />
            <ZAxis type="category" dataKey="profissional_nome" name="Profissional" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter name="Profissionais" data={data} fill="#8884d8" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Profissional</TableHead>
              <TableHead>Total Chamados</TableHead>
              <TableHead>Concluídos</TableHead>
              <TableHead>Distância (km)</TableHead>
              <TableHead>Alertas Geo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{row.profissional_nome}</TableCell>
                <TableCell>{row.total_chamados}</TableCell>
                <TableCell>{row.chamados_concluidos}</TableCell>
                <TableCell>{Number(row.distancia_total_km).toFixed(1)}</TableCell>
                <TableCell className={row.alertas_geofencing > 0 ? "text-red-600" : ""}>
                  {row.alertas_geofencing}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}