import React from 'react';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
    import { ScrollArea } from "@/components/ui/scroll-area";
    import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
    import { Badge } from "@/components/ui/badge";
    import ChartCard from '@/components/ChartCard';

    const formatCurrency = (value) => value != null ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00';
    const formatNumber = (value) => value != null ? value.toLocaleString('pt-BR') : '0';

    const ClientPerformanceTable = ({ data, chartId }) => {
      const tableData = data?.client_performance || [];

      if (!data) {
        return <div className="flex items-center justify-center h-full text-muted-foreground">Carregando dados...</div>;
      }
      
      const TrendIndicator = ({ trend }) => {
        if (trend > 0.1) return <TrendingUp className="h-5 w-5 text-emerald-500" />;
        if (trend < -0.1) return <TrendingDown className="h-5 w-5 text-red-500" />;
        return <Minus className="h-5 w-5 text-gray-500" />;
      };
      
      const getTrendBadgeVariant = (trend) => {
        if (trend > 0.1) return "success";
        if (trend < -0.1) return "destructive";
        return "secondary";
      };

      return (
        <ChartCard chartId={chartId} title="Performance dos Clientes da Carteira" height={600} childClassName="p-0">
          {tableData.length > 0 ? (
            <ScrollArea className="h-full">
              <Table className="relative">
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead className="font-bold">Cliente</TableHead>
                    <TableHead className="text-right font-bold">Receita Total</TableHead>
                    <TableHead className="text-right font-bold">Pedidos</TableHead>
                    <TableHead className="text-right font-bold">Ticket Médio</TableHead>
                    <TableHead className="text-center font-bold">Tendência</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((client) => (
                    <TableRow key={client.name}>
                      <TableCell className="font-medium truncate max-w-[250px]">{client.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(client.total_revenue)}</TableCell>
                      <TableCell className="text-right">{formatNumber(client.sales_count)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(client.total_revenue / client.sales_count)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getTrendBadgeVariant(client.trend)}>
                          <TrendIndicator trend={client.trend} />
                          <span className="ml-1.5">{client.trend > 0.1 ? 'Crescimento' : client.trend < -0.1 ? 'Queda' : 'Estável'}</span>
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Sem dados de performance de clientes para exibir.
            </div>
          )}
        </ChartCard>
      );
    };

    export default ClientPerformanceTable;