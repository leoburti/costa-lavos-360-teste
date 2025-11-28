import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBag, 
  Users, 
  User, 
  Building2, 
  Package, 
  Gift, 
  Wrench, 
  TrendingUp
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
};

const aggregateBy = (items, key, labelKey = key) => {
  const agg = items.reduce((acc, item) => {
    const groupKey = item[key] || 'N/D';
    if (!acc[groupKey]) {
      acc[groupKey] = {
        name: item[labelKey] || groupKey,
        totalValue: 0,
        count: 0,
        quantity: 0,
        bonification: 0,
        equipment: 0
      };
    }
    acc[groupKey].totalValue += (item.totalValue || 0);
    acc[groupKey].bonification += (item.bonification || 0);
    acc[groupKey].equipment += (item.equipment || 0);
    acc[groupKey].quantity += (item.quantity || 0);
    acc[groupKey].count += 1;
    return acc;
  }, {});

  return Object.values(agg).sort((a, b) => b.totalValue - a.totalValue);
};

const SimpleTable = ({ data, columns }) => (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col, i) => (
            <TableHead key={i} className={col.className}>{col.label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? (
          data.map((row, i) => (
            <TableRow key={i}>
              {columns.map((col, j) => (
                <TableCell key={j} className={col.className}>
                  {col.render ? col.render(row) : row[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              Nenhum registro encontrado.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
);

const DailySalesTabsExplorer = ({ day }) => {
  const { date, items = [] } = day;

  const aggregatedData = useMemo(() => {
    if (!items || items.length === 0) return null;

    const byProduct = aggregateBy(items, 'productName');
    const byClient = aggregateBy(items, 'clientName');
    const bySupervisor = aggregateBy(items, 'supervisorName');
    const bySeller = aggregateBy(items, 'sellerName');
    
    const bonifications = items.filter(i => i.bonification > 0);
    const equipments = items.filter(i => i.equipment > 0);
    
    const totalRevenue = items.reduce((acc, i) => acc + (i.totalValue || 0), 0);
    const totalBonif = items.reduce((acc, i) => acc + (i.bonification || 0), 0);
    const totalEquip = items.reduce((acc, i) => acc + (i.equipment || 0), 0);
    const netRevenue = totalRevenue - totalBonif - totalEquip;

    return {
      byProduct,
      byClient,
      bySupervisor,
      bySeller,
      bonifications,
      equipments,
      summary: { totalRevenue, totalBonif, totalEquip, netRevenue, count: items.length }
    };
  }, [items]);

  if (!aggregatedData) return null;

  const formattedDate = date ? format(parseISO(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <Card className="border-l-4 border-l-primary shadow-md">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Detalhes de: <span className="text-primary capitalize">{formattedDate}</span>
              </CardTitle>
              <CardDescription>
                Exploração detalhada das vendas do dia selecionado.
              </CardDescription>
            </div>
            <div className="flex gap-3">
               <Badge variant="outline" className="text-base px-3 py-1 bg-background">
                 {aggregatedData.summary.count} Itens
               </Badge>
               <Badge className="text-base px-3 py-1">
                 {formatCurrency(aggregatedData.summary.totalRevenue)}
               </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="flex flex-wrap h-auto justify-start gap-1 mb-6 bg-muted/50 p-1">
              <TabsTrigger value="summary" className="gap-2"><TrendingUp size={16} /> Resumo</TabsTrigger>
              <TabsTrigger value="products" className="gap-2"><Package size={16} /> Produtos</TabsTrigger>
              <TabsTrigger value="clients" className="gap-2"><Users size={16} /> Clientes</TabsTrigger>
              <TabsTrigger value="sellers" className="gap-2"><User size={16} /> Vendedores</TabsTrigger>
              <TabsTrigger value="supervisors" className="gap-2"><Building2 size={16} /> Supervisores</TabsTrigger>
              <TabsTrigger value="bonification" className="gap-2"><Gift size={16} /> Bonificações</TabsTrigger>
              <TabsTrigger value="equipment" className="gap-2"><Wrench size={16} /> Equipamentos</TabsTrigger>
            </TabsList>

            <div className="min-h-[400px]">
              {/* TAB: RESUMO */}
              <TabsContent value="summary" className="mt-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   <Card className="bg-muted/30 border-none">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                         <span className="text-sm text-muted-foreground mb-1">Faturamento Líquido</span>
                         <span className="text-2xl font-bold text-foreground">{formatCurrency(aggregatedData.summary.netRevenue)}</span>
                      </CardContent>
                   </Card>
                   <Card className="bg-muted/30 border-none">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                         <span className="text-sm text-muted-foreground mb-1">Volume Total (Qtd)</span>
                         <span className="text-2xl font-bold text-foreground">{aggregatedData.byProduct.reduce((acc, p) => acc + p.quantity, 0)}</span>
                      </CardContent>
                   </Card>
                   <Card className="bg-amber-50/50 border-amber-100 dark:bg-amber-950/10 dark:border-amber-900/50">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                         <span className="text-sm text-amber-600/80 mb-1">Total Bonificado</span>
                         <span className="text-2xl font-bold text-amber-700 dark:text-amber-500">{formatCurrency(aggregatedData.summary.totalBonif)}</span>
                      </CardContent>
                   </Card>
                   <Card className="bg-sky-50/50 border-sky-100 dark:bg-sky-950/10 dark:border-sky-900/50">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                         <span className="text-sm text-sky-600/80 mb-1">Total Equipamentos</span>
                         <span className="text-2xl font-bold text-sky-700 dark:text-sky-500">{formatCurrency(aggregatedData.summary.totalEquip)}</span>
                      </CardContent>
                   </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-4 flex items-center gap-2"><Package size={16} /> Top 5 Produtos (Receita)</h4>
                      <div className="space-y-3">
                         {aggregatedData.byProduct.slice(0, 5).map((prod, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                               <div className="flex items-center gap-2">
                                  <span className="w-5 text-muted-foreground font-mono">{i+1}.</span>
                                  <span className="font-medium truncate max-w-[200px]" title={prod.name}>{prod.name}</span>
                               </div>
                               <span>{formatCurrency(prod.totalValue)}</span>
                            </div>
                         ))}
                      </div>
                   </div>
                   <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-4 flex items-center gap-2"><Users size={16} /> Top 5 Clientes (Receita)</h4>
                      <div className="space-y-3">
                         {aggregatedData.byClient.slice(0, 5).map((client, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                               <div className="flex items-center gap-2">
                                  <span className="w-5 text-muted-foreground font-mono">{i+1}.</span>
                                  <span className="font-medium truncate max-w-[200px]" title={client.name}>{client.name}</span>
                               </div>
                               <span>{formatCurrency(client.totalValue)}</span>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
              </TabsContent>

              {/* TAB: PRODUTOS */}
              <TabsContent value="products" className="mt-0">
                <SimpleTable 
                  data={aggregatedData.byProduct}
                  columns={[
                    { label: 'Produto', key: 'name', className: 'font-medium' },
                    { label: 'Quantidade', key: 'quantity', className: 'text-right' },
                    { label: 'Total Bruto', key: 'totalValue', className: 'text-right font-bold', render: (r) => formatCurrency(r.totalValue) }
                  ]}
                />
              </TabsContent>

              {/* TAB: CLIENTES */}
              <TabsContent value="clients" className="mt-0">
                <SimpleTable 
                  data={aggregatedData.byClient}
                  columns={[
                    { label: 'Cliente', key: 'name', className: 'font-medium' },
                    { label: 'Itens', key: 'count', className: 'text-center' },
                    { label: 'Bonificação', key: 'bonification', className: 'text-right text-amber-600', render: (r) => r.bonification > 0 ? formatCurrency(r.bonification) : '-' },
                    { label: 'Total Compra', key: 'totalValue', className: 'text-right font-bold', render: (r) => formatCurrency(r.totalValue) }
                  ]}
                />
              </TabsContent>

              {/* TAB: VENDEDORES */}
              <TabsContent value="sellers" className="mt-0">
                <SimpleTable 
                  data={aggregatedData.bySeller}
                  columns={[
                    { label: 'Vendedor', key: 'name', className: 'font-medium' },
                    { label: 'Itens Vendidos', key: 'quantity', className: 'text-center' },
                    { label: 'Total Vendas', key: 'totalValue', className: 'text-right font-bold', render: (r) => formatCurrency(r.totalValue) }
                  ]}
                />
              </TabsContent>

              {/* TAB: SUPERVISORES */}
              <TabsContent value="supervisors" className="mt-0">
                <SimpleTable 
                  data={aggregatedData.bySupervisor}
                  columns={[
                    { label: 'Supervisor', key: 'name', className: 'font-medium' },
                    { label: 'Vendas no Dia', key: 'totalValue', className: 'text-right font-bold', render: (r) => formatCurrency(r.totalValue) }
                  ]}
                />
              </TabsContent>

              {/* TAB: BONIFICAÇÕES */}
              <TabsContent value="bonification" className="mt-0">
                 <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Produto</TableHead>
                          <TableHead className="text-right">Qtd</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {aggregatedData.bonifications.length > 0 ? (
                          aggregatedData.bonifications.map((item, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{item.clientName}</TableCell>
                              <TableCell>{item.productName}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right font-bold text-amber-600">{formatCurrency(item.bonification)}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                              Nenhuma bonificação registrada neste dia.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
              </TabsContent>

              {/* TAB: EQUIPAMENTOS */}
              <TabsContent value="equipment" className="mt-0">
                 <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Equipamento</TableHead>
                          <TableHead className="text-right">Qtd</TableHead>
                          <TableHead className="text-right">Valor Mov.</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {aggregatedData.equipments.length > 0 ? (
                          aggregatedData.equipments.map((item, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{item.clientName}</TableCell>
                              <TableCell>{item.productName}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right font-bold text-sky-600">{formatCurrency(item.equipment)}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                              Nenhuma movimentação de equipamento registrada neste dia.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DailySalesTabsExplorer;