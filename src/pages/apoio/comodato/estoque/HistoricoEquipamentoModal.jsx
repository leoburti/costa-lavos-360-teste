import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History } from 'lucide-react';

const dummyHistory = [
  { id: 1, tipo: 'entrega', status_anterior: 'N/A', status_novo: 'em_uso', motivo: 'Instalação inicial', data: '2023-01-15', usuario: 'Admin' },
  { id: 2, tipo: 'manutencao', status_anterior: 'em_uso', status_novo: 'defeito', motivo: 'Queimou a resistência', data: '2023-05-10', usuario: 'Técnico Zé' },
];

const HistoricoEquipamentoModal = ({ equipamentoId }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <History className="mr-2 h-4 w-4" /> Ver Histórico
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Histórico do Equipamento (ID: {equipamentoId})</DialogTitle>
          <DialogDescription>
            Veja todas as movimentações e alterações de status para este equipamento.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status Anterior</TableHead>
                <TableHead>Status Novo</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Usuário</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.data}</TableCell>
                  <TableCell>{item.tipo}</TableCell>
                  <TableCell>{item.status_anterior}</TableCell>
                  <TableCell>{item.status_novo}</TableCell>
                  <TableCell>{item.motivo}</TableCell>
                  <TableCell>{item.usuario}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HistoricoEquipamentoModal;