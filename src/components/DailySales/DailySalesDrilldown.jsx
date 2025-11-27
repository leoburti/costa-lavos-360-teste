
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Users, Store, Package, User, ShoppingCart } from 'lucide-react';

const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'R$ 0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const groupData = (items, groupBy) => {
  const grouped = items.reduce((acc, item) => {
    const key = item[groupBy] || 'Não Definido';
    if (!acc[key]) {
      acc[key] = { name: key, children: [], total: 0, details: {} };
      if(groupBy === 'orderId') {
        // For orders, we might want to see payment method at this level
        acc[key].details.paymentMethod = item.paymentMethod;
      }
    }
    acc[key].children.push(item);
    const netRevenue = (item.totalValue || 0) - (item.bonification || 0) - (item.equipment || 0);
    if (netRevenue > 0) {
      acc[key].total += netRevenue;
    }
    return acc;
  }, {});

  return Object.values(grouped).filter(g => g.total > 0).sort((a, b) => b.total - a.total);
};

const ProductLevel = ({ items }) => {
    return (
        <div className="space-y-2 p-2">
            {items.map((item, index) => (
                <div key={index} className="p-3 bg-background rounded-lg border flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold text-sm text-foreground truncate pr-2">{item.productName}</p>
                        <Badge variant="secondary">{formatCurrency((item.totalValue || 0) - (item.bonification || 0) - (item.equipment || 0))}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 text-xs text-muted-foreground">
                        <span>Qtde: <span className="font-medium text-foreground">{item.quantity}</span></span>
                        <span>V. Un: <span className="font-medium text-foreground">{formatCurrency(item.unitPrice)}</span></span>
                    </div>
                </div>
            ))}
        </div>
    );
};

const DrilldownLevel = ({ items, level }) => {
  const hierarchy = [
    { key: 'supervisorName', icon: Building2, label: 'Supervisor' },
    { key: 'sellerName', icon: User, label: 'Vendedor' },
    { key: 'customerGroupName', icon: Users, label: 'Grupo de Cliente' },
    { key: 'clientName', icon: Store, label: 'Cliente' },
    { key: 'paymentMethod', icon: ShoppingCart, label: 'Pagamento' }, // Changed from orderId to paymentMethod for better grouping
  ];

  if (level >= hierarchy.length) {
    return <ProductLevel items={items} />;
  }

  const currentLevel = hierarchy[level];
  const groupedItems = groupData(items, currentLevel.key);

  if (groupedItems.length === 0) {
    // If no items in this grouping but we have items, skip to next level or show products directly
    if (items.length > 0) return <DrilldownLevel items={items} level={level + 1} />;
    return <p className="pl-4 pt-2 text-sm text-muted-foreground">Nenhuma venda líquida encontrada.</p>;
  }
  
  return (
    <Accordion type="multiple" className="w-full">
      {groupedItems.map((item, index) => (
        <AccordionItem value={`item-${level}-${index}`} key={`${level}-${index}`} className="border-b-0">
          <AccordionTrigger className="hover:no-underline p-2 rounded-lg hover:bg-muted/50 transition-colors text-left">
            <div className="flex justify-between items-center w-full pr-2">
              <div className="flex items-center gap-3 truncate">
                <currentLevel.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-semibold text-sm text-foreground truncate max-w-[200px] sm:max-w-md">{item.name}</span>
              </div>
              <Badge variant="outline" className="font-bold ml-2 shrink-0">{formatCurrency(item.total)}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-0 pl-4 sm:pl-6">
            <div className="border-l-2 border-dashed border-border/50 pl-2 sm:pl-4">
              <DrilldownLevel items={item.children} level={level + 1} />
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

const DailySalesDrilldown = ({ selectedDay }) => {
  const netSalesItems = useMemo(() => {
    if (!selectedDay || !selectedDay.items) return [];
    // Filter only sales that contribute to net revenue (excluding full bonification/equipment)
    return selectedDay.items.filter(item => ((item.totalValue || 0) - (item.bonification || 0) - (item.equipment || 0)) > 0);
  }, [selectedDay]);

  if (!selectedDay) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-4 bg-card p-4 sm:p-6 rounded-xl border border-border shadow-sm"
    >
      <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            Detalhes de: <span className="text-primary capitalize">{format(parseISO(selectedDay.date), "dd 'de' MMMM", { locale: ptBR })}</span>
          </h2>
          <Badge variant="secondary" className="text-sm">
             {netSalesItems.length} Itens
          </Badge>
      </div>
      
      {netSalesItems.length > 0 ? (
        <DrilldownLevel items={netSalesItems} level={0} />
      ) : (
        <div className="flex items-center justify-center h-32 bg-muted/20 rounded-lg border border-dashed">
          <p className="text-muted-foreground text-sm">Apenas bonificações ou movimentações de equipamento neste dia.</p>
        </div>
      )}
    </motion.div>
  );
};

export default DailySalesDrilldown;
