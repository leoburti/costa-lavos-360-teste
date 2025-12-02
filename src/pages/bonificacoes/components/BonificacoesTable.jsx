import React from 'react';
import { useNavigate } from 'react-router-dom';
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

export function BonificacoesTable({ items }) {
  const navigate = useNavigate();

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Percentual</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total Acumulado</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.bonificacao_id}>
              <TableCell className="font-medium">{item.bonificacao_name}</TableCell>
              <TableCell>{item.type}</TableCell>
              <TableCell>{item.percentage}%</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded text-sm ${
                  item.status === 'ativa' ? 'bg-green-100 text-green-800' :
                  item.status === 'pausada' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {item.status}
                </span>
              </TableCell>
              <TableCell>R$ {Number(item.total_accumulated).toLocaleString('pt-BR')}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/bonificacoes-detalhes/${item.bonificacao_id}`)}>
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