
import React, { useState, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Package, Users, UserCircle, ShoppingBag } from 'lucide-react';

const DataTable = ({ data, columns }) => {
  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">Nenhum dado encontrado para esta categoria.</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            {columns.map((col, idx) => (
              <TableHead key={idx} className={col.className}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx}>
              {columns.map((col, cIdx) => (
                <TableCell key={cIdx} className={col.className}>
                  {col.cell ? col.cell(row) : row[col.accessorKey]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const DailySalesTabsExplorer = ({ data, date }) => {
  const [activeTab, setActiveTab] = useState("products");

  // Aggregations
  const aggregatedData = useMemo(() => {
    if (!data) return { products: [], clients: [], sellers: [], orders: [] };

    // Helper for grouping
    const groupBy = (key, transform = x => x) => {
      const groups = {};
      data.forEach(item => {
        const groupKey = item[key] || 'Não Definido';
        if (!groups[groupKey]) {
          groups[groupKey] = {
            name: groupKey,
            total: 0,
            quantity: 0,
            items: [],
            original: item
          };
        }
        groups[groupKey].total += (item.net || item.total || 0);
        groups[groupKey].quantity += (item.quantity || 0);
        groups[groupKey].items.push(item);
      });
      return Object.values(groups).map(transform).sort((a, b) => b.total - a.total);
    };

    return {
      products: groupBy('product'),
      clients: groupBy('client'),
      sellers: groupBy('seller'),
      orders: data // Raw data is basically order items
    };
  }, [data]);

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
           <CardTitle className="text-lg">Detalhamento do Dia</CardTitle>
           <div className="text-sm text-muted-foreground font-medium">
             {data?.length || 0} registros
           </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-12 space-x-6 mb-4">
            <TabsTrigger value="products" className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-0 pb-2 pt-2 font-medium text-muted-foreground data-[state=active]:text-primary gap-2">
              <Package className="h-4 w-4" /> Produtos
            </TabsTrigger>
            <TabsTrigger value="clients" className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-0 pb-2 pt-2 font-medium text-muted-foreground data-[state=active]:text-primary gap-2">
              <Users className="h-4 w-4" /> Clientes
            </TabsTrigger>
            <TabsTrigger value="sellers" className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-0 pb-2 pt-2 font-medium text-muted-foreground data-[state=active]:text-primary gap-2">
              <UserCircle className="h-4 w-4" /> Vendedores
            </TabsTrigger>
            <TabsTrigger value="raw" className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-0 pb-2 pt-2 font-medium text-muted-foreground data-[state=active]:text-primary gap-2">
              <ShoppingBag className="h-4 w-4" /> Itens (Raw)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-0">
            <DataTable 
              data={aggregatedData.products}
              columns={[
                { header: 'Produto', accessorKey: 'name', className: 'font-medium' },
                { header: 'Qtd', accessorKey: 'quantity', className: 'text-right w-24' },
                { header: 'Total', accessorKey: 'total', className: 'text-right w-32', cell: (row) => formatCurrency(row.total) }
              ]}
            />
          </TabsContent>

          <TabsContent value="clients" className="mt-0">
            <DataTable 
              data={aggregatedData.clients}
              columns={[
                { header: 'Cliente', accessorKey: 'name', className: 'font-medium' },
                { header: 'Itens', cell: (row) => row.items.length, className: 'text-right w-24' },
                { header: 'Total', accessorKey: 'total', className: 'text-right w-32', cell: (row) => formatCurrency(row.total) }
              ]}
            />
          </TabsContent>

          <TabsContent value="sellers" className="mt-0">
            <DataTable 
              data={aggregatedData.sellers}
              columns={[
                { header: 'Vendedor', accessorKey: 'name', className: 'font-medium' },
                { header: 'Clientes Atendidos', cell: (row) => new Set(row.items.map(i => i.client)).size, className: 'text-right' },
                { header: 'Total', accessorKey: 'total', className: 'text-right w-32', cell: (row) => formatCurrency(row.total) }
              ]}
            />
          </TabsContent>

          <TabsContent value="raw" className="mt-0">
             <DataTable 
              data={aggregatedData.orders}
              columns={[
                { header: 'Pedido', accessorKey: 'order', className: 'w-24' },
                { header: 'Cliente', accessorKey: 'client', className: 'font-medium' },
                { header: 'Produto', accessorKey: 'product' },
                { header: 'Vendedor', accessorKey: 'seller' },
                { 
                  header: 'Tipo', 
                  cell: (row) => {
                    if (row.bonification > 0) return <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100">Bonif.</Badge>;
                    if (row.equipment > 0) return <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">Equip.</Badge>;
                    return <Badge variant="outline" className="text-slate-600">Venda</Badge>;
                  }
                },
                { header: 'Valor', accessorKey: 'total', className: 'text-right', cell: (row) => formatCurrency(row.total) }
              ]}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DailySalesTabsExplorer;
