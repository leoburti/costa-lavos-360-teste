import React, { useMemo } from 'react';
    import { motion } from 'framer-motion';
    import { Loader2, AlertTriangle, BarChart, ChevronDown, Package, Gift, Truck } from 'lucide-react';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
    import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
    import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
    import { Badge } from "@/components/ui/badge";
    
    const formatCurrency = (value) => value != null ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00';
    const formatNumber = (value) => value != null ? value.toLocaleString('pt-BR') : '0';
    
    const AnalysisTable = ({ data, entityName, showEquipmentInField = false }) => {
        const formatMonth = (monthString) => {
            if (!monthString || !monthString.includes('-')) return 'Data Inválida';
            const [year, month] = monthString.split('-');
            const date = new Date(year, month - 1);
            return date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '');
        };
    
        return (
            <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-card z-10 min-w-[80px] font-bold">Mês</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Qtd. Total</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Vlr. Total</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Vlr. Unitário</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Vlr. Bonif.</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Mov. Equip.</TableHead>
                      {showEquipmentInField && <TableHead className="text-center whitespace-nowrap">Equip. Campo</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row, index) => (
                        <TableRow key={`${entityName}-${row.month}-${index}`}>
                          <TableCell className="sticky left-0 bg-card z-10 font-medium capitalize">{formatMonth(row.month)}</TableCell>
                          <TableCell className="text-center">{formatNumber(row.products_quantity)}</TableCell>
                          <TableCell className="text-center">{formatCurrency(row.products_value)}</TableCell>
                          <TableCell className="text-center">{formatCurrency(row.products_quantity > 0 ? row.products_value / row.products_quantity : 0)}</TableCell>
                          <TableCell className="text-center">{formatCurrency(row.bonification_value)}</TableCell>
                          <TableCell className="text-center">{formatCurrency(row.equipment_movement)}</TableCell>
                          {showEquipmentInField && (
                            <TableCell className="text-center">
                              {row.equipment_in_field > 0 ? formatNumber(row.equipment_in_field) : '-'}
                            </TableCell>
                          )}
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
            </div>
        );
    };
    
    
    const Group360AnalysisTab = ({ clients, groupAnalysisData, loading, error }) => {
    
      const consolidatedData = useMemo(() => {
        if (!groupAnalysisData || !groupAnalysisData.clients_analysis) return [];
    
          const monthMap = new Map();
          let totalEquipmentInField = 0;
    
          Object.values(groupAnalysisData.clients_analysis).forEach(clientData => {
              if (clientData.twelve_month_analysis) {
                clientData.twelve_month_analysis.forEach(month => {
                    if(!monthMap.has(month.month)){
                        monthMap.set(month.month, {
                            month: month.month,
                            products_quantity: 0,
                            products_value: 0,
                            bonification_value: 0,
                            equipment_movement: 0,
                        });
                    }
                    const currentMonth = monthMap.get(month.month);
                    currentMonth.products_quantity += month.products_quantity;
                    currentMonth.products_value += month.products_value;
                    currentMonth.bonification_value += month.bonification_value;
                    currentMonth.equipment_movement += month.equipment_movement;
                });
              }
              totalEquipmentInField += clientData.equipment_in_field || 0;
          });
    
          const result = Array.from(monthMap.values()).sort((a,b) => b.month.localeCompare(a.month));
          if(result.length > 0) {
            result.forEach((month, index) => month.equipment_in_field = index === 0 ? totalEquipmentInField : 0);
          }
          return result;
      }, [groupAnalysisData]);
    
      const sortedClients = useMemo(() => {
        if (!clients || !groupAnalysisData?.clients_analysis) return [];
        return [...clients].sort((a, b) => {
          const revenueA = groupAnalysisData.clients_analysis[`${a.client_code}-${a.store}`]?.twelve_month_analysis.reduce((sum, m) => sum + m.products_value, 0) || 0;
          const revenueB = groupAnalysisData.clients_analysis[`${b.client_code}-${b.store}`]?.twelve_month_analysis.reduce((sum, m) => sum + m.products_value, 0) || 0;
          return revenueB - revenueA;
        });
      }, [clients, groupAnalysisData]);
    
      if (loading) {
        return (
          <div className="flex items-center justify-center p-8 min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Carregando análise histórica do grupo...</p>
          </div>
        );
      }
    
      if (error) {
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-destructive/10 rounded-lg m-4 min-h-[400px]">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <p className="mt-4 text-destructive font-semibold">{error}</p>
          </div>
        );
      }
      
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <BarChart className="mr-2 h-5 w-5 text-primary" />
                  Análise Histórica - Últimos 12 Meses
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-6 border rounded-lg p-2 bg-muted/20">
                  <h3 className="font-bold text-center text-lg mb-2">GRUPO CONSOLIDADO</h3>
                  <AnalysisTable data={consolidatedData} entityName="GRUPO_CONSOLIDADO" showEquipmentInField={true} />
                </div>
    
                <Accordion type="multiple" className="w-full space-y-2">
                  {sortedClients.map(client => {
                    const clientKey = `${client.client_code}-${client.store}`;
                    const clientAnalysis = groupAnalysisData?.clients_analysis?.[clientKey];
    
                    if (!clientAnalysis || !clientAnalysis.twelve_month_analysis || clientAnalysis.twelve_month_analysis.every(m => m.products_value === 0 && m.bonification_value === 0 && m.equipment_movement === 0)) {
                      return (
                        <div key={clientKey} className="text-sm text-muted-foreground p-3 flex items-center justify-between bg-muted/50 rounded-md">
                          <span>{client.name || `Cliente ${client.client_code}-${client.store}`}</span>
                          <Badge variant="secondary">Sem dados de vendas nos últimos 12 meses</Badge>
                        </div>
                      );
                    }
                    const totalProducts = clientAnalysis.twelve_month_analysis.reduce((sum, m) => sum + m.products_value, 0);
                    const totalBonification = clientAnalysis.twelve_month_analysis.reduce((sum, m) => sum + m.bonification_value, 0);
    
                    return (
                        <AccordionItem value={clientKey} key={clientKey}>
                            <AccordionTrigger className="hover:no-underline bg-muted/50 p-2 rounded-md [&[data-state=open]>svg]:rotate-180">
                                <div className="flex-1 flex items-center justify-between text-left">
                                    <span className="font-bold text-primary truncate mr-4">{clientAnalysis.name}</span>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1"><Package size={14}/> {formatCurrency(totalProducts)}</div>
                                        <div className="flex items-center gap-1"><Gift size={14}/> {formatCurrency(totalBonification)}</div>
                                        <div className="flex items-center gap-1"><Truck size={14}/> {formatNumber(clientAnalysis.equipment_in_field)}</div>
                                    </div>
                                </div>
                                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 ml-4" />
                            </AccordionTrigger>
                            <AccordionContent className="p-0 pt-2">
                                <AnalysisTable 
                                    entityName={clientKey}
                                    data={clientAnalysis.twelve_month_analysis.map((month, index) => ({
                                      ...month,
                                      equipment_in_field: index === 0 ? clientAnalysis.equipment_in_field : 0
                                    }))}
                                    showEquipmentInField={true}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    );
                  })}
                </Accordion>
            </CardContent>
          </Card>
        </motion.div>
      );
    };
    
    export default Group360AnalysisTab;