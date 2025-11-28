import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronRight, Users, Store, Calendar, ShoppingCart, Package, CreditCard, TrendingUp, TrendingDown, Minus, Home } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useFilters } from '@/contexts/FilterContext';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'R$ 0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const iconMapping = [Users, Store, Calendar, ShoppingCart, Package];
const panelTitles = ["Grupos de Clientes", "Clientes", "Datas", "Pedidos", "Produtos"];

const PriceDifferenceIndicator = ({ unitPrice, avgPrice }) => {
  if (!unitPrice || !avgPrice || avgPrice === 0) return <Minus className="h-3 w-3 text-muted-foreground" />;
  const difference = ((unitPrice - avgPrice) / avgPrice) * 100;
  if (Math.abs(difference) < 1) return <Minus className="h-3 w-3 text-muted-foreground" />;
  if (difference > 0) return <TrendingUp className="h-3 w-3 text-emerald-500" />;
  return <TrendingDown className="h-3 w-3 text-red-500" />;
};

const ProductDetails = ({ products, isLoading }) => (
  <div className="p-2">
    <h4 className="font-semibold text-sm text-foreground mb-2 px-2">Produtos do Pedido</h4>
    {isLoading ? (
      <div className="flex items-center justify-center h-full p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    ) : products && products.length > 0 ? (
      products.map((child) => (
        <div key={child.key} className="p-3 text-sm border-t border-border/20 first:border-t-0">
          <div className="flex justify-between items-center">
            <span className="font-medium text-foreground flex-1 pr-2">{child.name}</span>
            <span className="font-bold text-foreground">{formatCurrency(child.value)}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1 grid grid-cols-2 gap-x-4">
            <span>Qtd: {child.quantity} un.</span>
            <span className="flex items-center gap-1">Preço: {formatCurrency(child.unit_price)}</span>
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
      ))
    ) : (
      <div className="text-center text-sm text-muted-foreground p-4 h-full flex items-center justify-center">
        Nenhum produto encontrado.
      </div>
    )}
  </div>
);

const Panel = ({ title, items, onSelect, selectedKey, level, isLoading }) => {
  const Icon = iconMapping[level] || Users;
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-card border-r border-border/80 min-w-[300px] flex-shrink-0 flex flex-col"
    >
      <div className="p-3 border-b border-border/80">
        <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </h3>
      </div>
      <ScrollArea className="flex-grow">
        {isLoading ? (
          <div className="flex items-center justify-center h-full p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : items && items.length > 0 ? (
          <div className="py-1">
            {items.map(item => (
              <button
                key={item.key}
                onClick={() => onSelect(item)}
                className={cn(
                  "w-full text-left px-3 py-2.5 flex justify-between items-center transition-colors duration-150",
                  selectedKey === item.key ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted/50"
                )}
              >
                <span className="text-sm truncate flex-1 pr-2">{item.name}</span>
                <Badge variant={selectedKey === item.key ? "default" : "secondary"} className="font-bold text-xs">{formatCurrency(item.value)}</Badge>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground p-4 h-full flex items-center justify-center">
            Nenhum dado encontrado.
          </div>
        )}
      </ScrollArea>
    </motion.div>
  );
};

const CustomerGroupDrilldownExplorer = () => {
  const { filters } = useFilters();
  const { toast } = useToast();
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productDetails, setProductDetails] = useState({ isLoading: false, data: [] });
  const containerRef = useRef(null);

  const fetchDrilldownData = useCallback(async (level, parentKeys) => {
    const selectedClients = filters.clients ? filters.clients.map(c => c.value) : null; 
    const { data, error } = await supabase.functions.invoke('get-customer-group-drilldown-data', {
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
        p_drilldown_level: level,
        p_parent_keys: parentKeys
      }
    });

    if (error || (data && data.error)) {
      const errorMessage = error ? error.message : data.error;
      toast({ variant: "destructive", title: `Erro ao detalhar`, description: errorMessage });
      return [];
    }

    if (data && data.debug && level === 2) {
        console.log("----- DEBUG INFO -----");
        console.log("count_records_before_level_filter:", data.debug.count_records_before_level_filter);
        console.log("count_records_after_level_filter:", data.debug.count_records_after_level_filter);
        console.log("----------------------");
    }

    return (data && Array.isArray(data.data)) ? data.data : [];
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
        p_show_defined_groups_only: true,
      });

      if (error) {
        toast({ variant: "destructive", title: "Erro ao buscar grupos de clientes", description: error.message });
        setPanels([]);
      } else {
        setPanels([{
          title: panelTitles[0],
          items: data.map(d => ({ key: d.name, name: d.name, value: d.size })),
          selectedKey: null,
          isLoading: false,
        }]);
      }
      setLoading(false);
    };

    fetchTopLevel();
  }, [filters, toast]);

  const handleSelect = useCallback(async (panelIndex, item) => {
    const currentPanel = panels[panelIndex];
    if (currentPanel.selectedKey === item.key) return;

    const newPanels = panels.slice(0, panelIndex + 1);
    newPanels[panelIndex] = { ...newPanels[panelIndex], selectedKey: item.key };
    setProductDetails({ isLoading: false, data: [] });

    const nextLevel = panelIndex + 2;
    
    const parentKeys = newPanels.map(p => {
        const selectedItem = p.items.find(i => i.key === p.selectedKey);
        return selectedItem ? selectedItem.key : null;
    }).filter(Boolean);

    if (nextLevel > panelTitles.length) { // Products are fetched as the last level.
        setPanels(newPanels);
        setProductDetails({ isLoading: true, data: [] });
        const productData = await fetchDrilldownData(nextLevel, parentKeys);
        setProductDetails({ isLoading: false, data: productData });
        return;
    }

    setPanels([...newPanels, { title: panelTitles[panelIndex + 1], items: [], selectedKey: null, isLoading: true }]);

    const childrenData = await fetchDrilldownData(nextLevel, parentKeys);

    if (nextLevel === 5) { // It's product data
        setProductDetails({ isLoading: false, data: childrenData });
        setPanels(newPanels); // No new panel for products
    } else {
        setPanels(prevPanels => {
          const updatedPanels = [...prevPanels];
          const targetPanelIndex = panelIndex + 1;
          if (updatedPanels[targetPanelIndex]) {
            updatedPanels[targetPanelIndex] = {
              ...updatedPanels[targetPanelIndex],
              items: childrenData,
              isLoading: false,
            };
          }
          return updatedPanels;
        });
    }
  }, [panels, fetchDrilldownData]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [panels, productDetails]);

  const breadcrumbs = panels.map((p, i) => ({
    name: Array.isArray(p.items) && p.items.find(it => it.key === p.selectedKey)?.name || p.title,
    index: i
  })).filter(b => panels[b.index].selectedKey);

  const handleBreadcrumbClick = (index) => {
    const newPanels = panels.slice(0, index + 1);
    setPanels(newPanels);
    setProductDetails({ isLoading: false, data: [] });
  };

  const handleHomeClick = () => {
    const firstPanel = panels[0];
    if (firstPanel) {
      setPanels([{ ...firstPanel, selectedKey: null }]);
    }
    setProductDetails({ isLoading: false, data: [] });
  };

  const lastPanel = panels[panels.length - 1];
  const showProductDetails = lastPanel && lastPanel.selectedKey && panels.length === 4;

  if (loading) {
    return <div className="flex items-center justify-center h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col h-[600px] bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="flex items-center gap-1 p-2 border-b border-border/80 text-sm text-muted-foreground flex-wrap">
        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={handleHomeClick}>
          <Home className="h-4 w-4" />
        </Button>
        <ChevronRight className="h-4 w-4 text-border" />
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 truncate max-w-[150px]"
              onClick={() => handleBreadcrumbClick(i)}
            >
              {crumb.name}
            </Button>
            {i < breadcrumbs.length - 1 && <ChevronRight className="h-4 w-4 text-border" />}
          </React.Fragment>
        ))}
      </div>
      <div ref={containerRef} className="flex flex-grow overflow-x-auto">
        <AnimatePresence initial={false}>
          {panels.map((panel, index) => (
            <Panel
              key={index}
              title={panel.title}
              items={panel.items}
              selectedKey={panel.selectedKey}
              level={index}
              isLoading={panel.isLoading}
              onSelect={(item) => handleSelect(index, item)}
            />
          ))}
        </AnimatePresence>
        {showProductDetails && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="bg-card border-r border-border/80 min-w-[350px] flex-shrink-0 flex flex-col"
          >
            <ScrollArea className="flex-grow">
              <ProductDetails products={productDetails.data} isLoading={productDetails.isLoading} />
            </ScrollArea>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CustomerGroupDrilldownExplorer;