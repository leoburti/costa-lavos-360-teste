import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TabelaRelatorio = ({ dados, colunas }) => {
  if (!dados || dados.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Nenhum dado para exibir.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {colunas.map((col) => (
                <TableHead key={col.accessor}>{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {dados.map((linha, index) => (
              <TableRow key={index}>
                {colunas.map((col) => (
                  <TableCell key={col.accessor}>{linha[col.accessor]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button variant="outline" size="sm" disabled>
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button variant="outline" size="sm">
          Próximo
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TabelaRelatorio;