import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Eye } from 'lucide-react';

export function EquipamentosTable({ items }) {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    const styles = {
      operacional: 'success',
      manutencao: 'warning',
      inativo: 'destructive',
    };
    return <Badge variant={styles[status?.toLowerCase()] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Modelo</TableHead>
            <TableHead>Série</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Aquisição</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.equipment_id}>
              <TableCell className="font-medium">{item.equipment_name}</TableCell>
              <TableCell>{item.model}</TableCell>
              <TableCell>{item.serial}</TableCell>
              <TableCell>{getStatusBadge(item.status)}</TableCell>
              <TableCell>{new Date(item.acquisition_date).toLocaleDateString('pt-BR')}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/equipamentos-detalhes/${item.equipment_id}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}