import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function GeofencingReport({ data }) {
  if (!data || data.length === 0) return <div className="text-center py-10 text-muted-foreground">Nenhum alerta de geofencing encontrado.</div>;

  return (
    <div className="space-y-6">
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Profissional</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Distância (m)</TableHead>
              <TableHead>Endereço Registrado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, i) => (
              <TableRow key={i}>
                <TableCell>{format(new Date(row.data_hora), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</TableCell>
                <TableCell>{row.profissional_nome}</TableCell>
                <TableCell>{row.cliente_nome}</TableCell>
                <TableCell>
                  <Badge variant="outline">{row.tipo}</Badge>
                </TableCell>
                <TableCell className="text-red-600 font-medium">{Number(row.distancia_metros).toFixed(0)}m</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={row.endereco_registrado}>
                  {row.endereco_registrado}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}