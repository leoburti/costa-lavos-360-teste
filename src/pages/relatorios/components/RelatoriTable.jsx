import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { extractValue } from '@/utils/dataValidator';

export function RelatoriTable({ columns, data, loading }) {
  if (loading) {
    return <div className="text-center py-8 text-muted-foreground animate-pulse">Carregando dados...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Nenhum dado disponível</div>;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={col.align === 'right' ? 'text-right' : ''}>
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx}>
              {columns.map((col) => {
                // First, safely get the raw value
                const rawValue = row[col.key];
                
                // If there's a format function, apply it to the raw value.
                // The format function itself should handle extraction if it expects primitives,
                // but we extract first to be safe if the format function assumes a primitive.
                let displayValue;
                
                try {
                    if (col.format) {
                       // Pass extracted value to formatter to prevent BigInt/Object errors in formatter
                       displayValue = col.format(extractValue(rawValue, ''));
                    } else {
                       // Direct extraction for render
                       displayValue = extractValue(rawValue);
                    }
                } catch (err) {
                    console.error(`Error formatting column ${col.key}:`, err);
                    displayValue = '-';
                }

                return (
                  <TableCell key={col.key} className={col.align === 'right' ? 'text-right' : ''}>
                    {displayValue}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}