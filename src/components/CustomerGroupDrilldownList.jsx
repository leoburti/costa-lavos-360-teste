import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Users, User, Package, CreditCard } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const formatCurrency = (value) => {
  if (typeof value !== 'number') return '';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const iconMapping = [
  Users, User, Package
];

const NestedAccordion = ({ item, level, onFetchChildren, childrenData, isLoadingChildren, path }) => {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = iconMapping[level] || Users;

  const isProductLevel = level === 2;
  const hasChildrenToFetch = !isProductLevel;

  const handleToggle = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (newIsOpen && onFetchChildren && hasChildrenToFetch && !childrenData) {
      onFetchChildren(item, path);
    }
  };
  
  return (
    <AccordionItem value={item.uniqueKey} className="border-b-0">
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
                 isProductLevel ? (
                   <div className="pt-2 pb-2">
                    {childrenData.map((child) => (
                      <div key={child.uniqueKey} className="p-3 text-sm border-t border-border/20 first:border-t-0">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-foreground flex-1 pr-2">{child.name}</span>
                          <span className="font-bold text-foreground">{formatCurrency(child.value)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {child.quantity} un. x {formatCurrency(child.unit_price)}
                        </div>
                        {child.payment_condition && (
                           <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                             <CreditCard className="h-3 w-3" /> {child.payment_condition}
                           </div>
                        )}
                      </div>
                    ))}
                   </div>
                 ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {childrenData.map((child) => (
                      <NestedAccordion
                        key={child.uniqueKey}
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


const CustomerGroupDrilldownList = () => {
  const { filters } = useData();
  const [loading, setLoading] = useState(true);
  const [customerGroupData, setCustomerGroupData] = useState([]);
  const { toast } = useToast();

  const handleFetchDrilldown = useCallback(async (item, path) => {
    const nextLevel = path.length + 2;
    const parentKeys = [...path, item.key];
    
    const fullPath = [...path, item.key];
    setCustomerGroupData(prevData => {
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
    const { data, error } = await supabase.rpc('get_drilldown_data', {
      p_start_date: filters.startDate,
      p_end_date: filters.endDate,
      p_exclude_employees: filters.excludeEmployees,
      p_supervisors: filters.supervisors,
      p_sellers: filters.sellers,
      p_customer_groups: filters.customerGroups,
      p_regions: filters.regions,
      p_clients: selectedClients,
      p_search_term: filters.searchTerm,
      p_analysis_mode: 'customerGroup',
      p_show_defined_groups_only: false,
      p_drilldown_level: nextLevel,
      p_parent_keys: parentKeys
    });

    const updateData = (items, p, resultData, isLoading) => {
        if (!items) return [];
        const [currentKey, ...rest] = p;
        return items.map(i => {
            if (i.key === currentKey) {
                if (rest.length === 0) {
                    const childrenWithKeys = (resultData || []).map((child, index) => ({
                        ...child,
                        uniqueKey: `${fullPath.join('|')}|${child.key}|${index}`
                    }));
                    return { ...i, children: childrenWithKeys, isLoading };
                }
                return { ...i, children: updateData(i.children, rest, resultData, isLoading) };
            }
            return i;
        });
    };

    if (error) {
      toast({ variant: "destructive", title: `Erro ao detalhar ${item.name}`, description: error.message });
      setCustomerGroupData(prevData => updateData(prevData, fullPath, [], false));
    } else {
      setCustomerGroupData(prevData => updateData(prevData, fullPath, data || [], false));
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
        p_analysis_mode: 'customerGroup',
        p_show_defined_groups_only: false,
      });

      if (error) {
        toast({ variant: "destructive", title: "Erro ao buscar grupos de clientes", description: error.message });
        setCustomerGroupData([]);
      } else {
        setCustomerGroupData((data || []).map((d, index) => ({ 
            key: d.name, 
            name: d.name, 
            value: d.size, 
            children: null, 
            isLoading: false,
            uniqueKey: `${d.name}-${index}`
        })));
      }
      setLoading(false);
    };

    fetchTopLevel();
  }, [filters, toast]);

  if (loading) {
    return <div className="flex items-center justify-center h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!customerGroupData || customerGroupData.length === 0) {
    return <div className="flex items-center justify-center h-[400px]"><p className="text-muted-foreground">Nenhum grupo de cliente encontrado.</p></div>;
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {customerGroupData.map((group) => (
        <NestedAccordion
          key={group.uniqueKey}
          item={group}
          level={0}
          onFetchChildren={handleFetchDrilldown}
          childrenData={group.children}
          isLoadingChildren={group.isLoading}
          path={[]}
        />
      ))}
    </Accordion>
  );
};

export default CustomerGroupDrilldownList;