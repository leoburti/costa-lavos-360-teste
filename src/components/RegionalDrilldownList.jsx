import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, MapPin, Building2, User, Users, Store, Calendar, ShoppingCart, Package, CreditCard, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';

const formatCurrency = (value) => {
  if (typeof value !== 'number') return '';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const iconMapping = [
  MapPin, Building2, User, Users, Store, Calendar, ShoppingCart, Package
];

const PriceDifferenceIndicator = ({ unitPrice, avgPrice }) => {
  if (!unitPrice || !avgPrice || avgPrice === 0) {
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  }
  const difference = ((unitPrice - avgPrice) / avgPrice) * 100;
  if (Math.abs(difference) < 1) {
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  }
  if (difference > 0) {
    return <TrendingUp className="h-3 w-3 text-emerald-500" />;
  }
  return <TrendingDown className="h-3 w-3 text-red-500" />;
};

const ProductDetails = ({ products }) => (
  <div className="pt-2 pb-2">
    {products.map((child) => (
      <div key={child.key} className="p-3 text-sm border-t border-border/20 first:border-t-0">
        <div className="flex justify-between items-center">
          <span className="font-medium text-foreground flex-1 pr-2">{child.name}</span>
          <span className="font-bold text-foreground">{formatCurrency(child.value)}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1 grid grid-cols-2 gap-x-4">
          <span>Qtd: {child.quantity} un.</span>
          <span className="flex items-center gap-1">
            Preço: {formatCurrency(child.unit_price)}
          </span>
          <span>Média Geral: {formatCurrency(child.avg_unit_price)}</span>
          <span className={cn("flex items-center gap-1", child.unit_price > child.avg_unit_price ? 'text-emerald-500' : 'text-red-500')}>
            <PriceDifferenceIndicator unitPrice={child.unit_price} avgPrice={child.avg_unit_price} />
            {child.avg_unit_price ? `${(((child.unit_price - child.avg_unit_price) / child.avg_unit_price) * 100).toFixed(1)}%` : 'N/A'}
          </span>
        </div>
        {child.payment_condition && (
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            <CreditCard className="h-3 w-3" /> {child.payment_condition}
          </div>
        )}
      </div>
    ))}
  </div>
);

const NestedAccordion = ({ item, level, onFetchChildren, childrenData, isLoadingChildren, path }) => {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = iconMapping[level] || Users;

  const isOrderLevel = level === 6;

  const handleToggle = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (newIsOpen && onFetchChildren && !childrenData) {
      onFetchChildren(item, path);
    }
  };
  
  return (
    <AccordionItem value={item.key} className="border-b-0">
      <AccordionTrigger onClick={handleToggle} className="hover:no-underline p-3 rounded-lg hover:bg-card-foreground/5 transition-colors">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm text-foreground text-left">{item.name}</span>
          </div>
          <Badge variant="secondary" className="font-bold">{formatCurrency(item.value)}</Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-0 pl-6">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-l-2 border-dashed border-border/50 pl-4"
            >
              {isLoadingChildren ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : childrenData && childrenData.length > 0 ? (
                isOrderLevel ? (
                  <ProductDetails products={childrenData} />
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {childrenData.map((child) => (
                        <NestedAccordion
                          key={child.key}
                          item={child}
                          level={level + 1}
                          onFetchChildren={onFetchChildren}
                          childrenData={child.children}
                          isLoadingChildren={child.isLoading}
                          path={[...path, item.key]}
                        />
                    ))}
                  </Accordion>
                )
              ) : (
                <div className="text-center text-sm text-muted-foreground p-4">
                  Nenhum detalhe encontrado.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </AccordionContent>
    </AccordionItem>
  );
};

const RegionalDrilldownList = () => {
  const { filters } = useData();
  const [loading, setLoading] = useState(true);
  const [regionalData, setRegionalData] = useState([]);
  const { toast } = useToast();

  const handleFetchDrilldown = useCallback(async (item, path) => {
    const nextLevel = path.length + 1;
    const parentKeys = [...path, item.key];
    
    const fullPath = [...path, item.key];
    setRegionalData(prevData => {
        const update = (items, p) => {
            if (!items) return [];
            const [currentKey, ...rest] = p;
            return items.map(i => {
                if (i.key === currentKey) {
                    if (rest.length === 0) {
                        return { ...i, isLoading: true };
                    }
                    return { ...i, children: update(i.children, rest) };
                }
                return i;
            });
        };
        return update(prevData, fullPath);
    });
    
    const selectedClients = filters.clients ? filters.clients.map(c => c.name) : null;
    
    const { data, error } = await supabase.functions.invoke('get-drilldown-data', {
      body: {
        p_start_date: filters.startDate,
        p_end_date: filters.endDate,
        p_exclude_employees: filters.excludeEmployees,
        p_supervisors: filters.supervisors,
        p_sellers: filters.sellers,
        p_customer_groups: filters.customerGroups,
        p_regions: filters.regions,
        p_clients: selectedClients,
        p_search_term: filters.searchTerm,
        p_analysis_mode: 'region',
        p_show_defined_groups_only: false,
        p_drilldown_level: nextLevel + 1,
        p_parent_keys: parentKeys
      }
    });

    const updateData = (items, p, resultData, isLoading) => {
        if (!items) return [];
        const [currentKey, ...rest] = p;
        return items.map(i => {
            if (i.key === currentKey) {
                if (rest.length === 0) {
                    return { ...i, children: resultData, isLoading };
                }
                return { ...i, children: updateData(i.children, rest, resultData, isLoading) };
            }
            return i;
        });
    };

    if (error) {
      toast({ variant: "destructive", title: `Erro ao detalhar ${item.name}`, description: error.message });
      setRegionalData(prevData => updateData(prevData, fullPath, [], false));
    } else {
      setRegionalData(prevData => updateData(prevData, fullPath, data, false));
    }
  }, [filters, toast]);

  useEffect(() => {
    const fetchTopLevel = async () => {
      setLoading(true);
      const selectedClients = filters.clients ? filters.clients.map(c => c.name) : null;
      const { data, error } = await supabase.rpc('get_treemap_data', {
        p_start_date: filters.startDate,
        p_end_date: filters.endDate,
        p_exclude_employees: filters.excludeEmployees,
        p_supervisors: filters.supervisors,
        p_sellers: filters.sellers,
        p_customer_groups: filters.customerGroups,
        p_regions: filters.regions,
        p_clients: selectedClients,
        p_search_term: filters.searchTerm,
        p_analysis_mode: 'region',
        p_show_defined_groups_only: false,
      });

      if (error) {
        toast({ variant: "destructive", title: "Erro ao buscar regiões", description: error.message });
        setRegionalData([]);
      } else {
        setRegionalData(data.map(d => ({ key: d.name, name: d.name, value: d.size, children: null, isLoading: false })));
      }
      setLoading(false);
    };

    fetchTopLevel();
  }, [filters, toast]);

  if (loading) {
    return <div className="flex items-center justify-center h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!regionalData || regionalData.length === 0) {
    return <div className="flex items-center justify-center h-[400px]"><p className="text-muted-foreground">Nenhum dado regional encontrado.</p></div>;
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {regionalData.map((region) => (
        <NestedAccordion
          key={region.key}
          item={region}
          level={0}
          onFetchChildren={handleFetchDrilldown}
          childrenData={region.children}
          isLoadingChildren={region.isLoading}
          path={[]}
        />
      ))}
    </Accordion>
  );
};

export default RegionalDrilldownList;