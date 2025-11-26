
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ResponsiveDataView = ({ 
  data, 
  columns, 
  mobileRender, 
  desktopClassName, 
  emptyMessage = "Nenhum dado encontrado." 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground border rounded-md bg-muted/10">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      {/* Desktop View */}
      <div className={cn("hidden md:block rounded-md border", desktopClassName)}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, index) => (
                <TableHead key={index} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((col, colIndex) => (
                  <TableCell key={colIndex} className={col.className}>
                    {col.cell ? col.cell(row) : row[col.accessorKey]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {data.map((row, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-4">
              {mobileRender ? mobileRender(row) : (
                <div className="space-y-2">
                  {columns.map((col, colIndex) => (
                    <div key={colIndex} className="flex justify-between items-start py-1 border-b last:border-0 border-border/50">
                      <span className="text-sm font-medium text-muted-foreground">{col.header}:</span>
                      <span className="text-sm text-foreground text-right">
                        {col.cell ? col.cell(row) : row[col.accessorKey]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default ResponsiveDataView;
