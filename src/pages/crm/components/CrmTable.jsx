import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function CrmTable({ items, type }) {
  const getColumns = () => {
    switch (type) {
      case 'clientes':
        return ['Nome', 'Email', 'Telefone', 'Status', 'Valor Total', 'Ações'];
      case 'contatos':
        return ['Nome', 'Email', 'Telefone', 'Cargo', 'Cliente', 'Ações'];
      default:
        return ['Nome', 'Status', 'Valor', 'Data', 'Ações'];
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {getColumns().map((col) => (
              <TableHead key={col}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.cliente_id || item.contato_id || item.id}>
              <TableCell className="font-medium">{item.cliente_name || item.contato_name || item.name}</TableCell>
              <TableCell>{item.email || item.status || '-'}</TableCell>
              <TableCell>{item.phone || item.value || '-'}</TableCell>
              <TableCell>{item.status || item.position || '-'}</TableCell>
              <TableCell>{item.total_value || item.cliente_name || '-'}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}