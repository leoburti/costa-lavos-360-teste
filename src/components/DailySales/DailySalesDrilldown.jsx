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
        acc[key].details.paymentMethod = item.paymentMethod;
      }
    }
    acc[key].children.push(item);
    const netRevenue = item.totalValue - item.bonification - item.equipment;
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
                <div key={index} className="p-3 bg-background rounded-lg border">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold text-xs text-foreground truncate pr-2">{item.productName}</p>
                        <Badge variant="secondary">{formatCurrency(item.totalValue - item.bonification - item.equipment)}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 text-xs mt-2 text-muted-foreground">
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
    { key: 'orderId', icon: ShoppingCart, label: 'Pedido' },
  ];

  if (level >= hierarchy.length) {
    return <ProductLevel items={items} />;
  }

  const currentLevel = hierarchy[level];
  const groupedItems = groupData(items, currentLevel.key);

  if (groupedItems.length === 0) {
    return <p className="pl-4 pt-2 text-sm text-muted-foreground">Nenhuma venda líquida encontrada neste nível.</p>;
  }
  
  return (
    <Accordion type="multiple" className="w-full">
      {groupedItems.map((item, index) => (
        <AccordionItem value={`item-${level}-${index}`} key={`${level}-${index}`} className="border-b-0">
          <AccordionTrigger className="hover:no-underline p-2 rounded-lg hover:bg-card-foreground/5 transition-colors text-left">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-3 truncate">
                <currentLevel.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-semibold text-sm text-foreground truncate">{item.name}</span>
                 {item.details.paymentMethod && <Badge variant="outline" className="text-xs">{item.details.paymentMethod}</Badge>}
              </div>
              <Badge variant="secondary" className="font-bold ml-2">{formatCurrency(item.total)}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-0 pl-6">
            <div className="border-l-2 border-dashed border-border/50 pl-4">
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
    return selectedDay.items.filter(item => (item.totalValue - item.bonification - item.equipment) > 0);
  }, [selectedDay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 bg-card/50 p-4 sm:p-6 rounded-2xl border border-border"
    >
      <h2 className="text-xl font-bold text-foreground">
        Vendas Líquidas do Dia: <span className="text-primary">{format(parseISO(selectedDay.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
      </h2>
      {netSalesItems.length > 0 ? (
        <DrilldownLevel items={netSalesItems} level={0} />
      ) : (
        <div className="flex items-center justify-center h-40">
          <p className="text-muted-foreground">Nenhuma venda líquida registrada para este dia.</p>
        </div>
      )}
    </motion.div>
  );
};

export default DailySalesDrilldown;