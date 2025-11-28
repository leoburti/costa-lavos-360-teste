import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronRight, Building2, User, Users, Store, Home } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useFilters } from '@/contexts/FilterContext';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { format, isValid } from 'date-fns';

const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'R$ 0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatPercentage = (value) => {
    if (typeof value !== 'number' || !isFinite(value)) return '0.00%';
    return `${value.toFixed(2)}%`;
}

const getPercentageVariant = (percentage) => {
  if (percentage > 5) return 'destructive';
  if (percentage > 2) return 'warning';
  return 'success';
};

const iconMapping = [Building2, User, Users, Store];
const panelTitles = ["Supervisores", "Vendedores", "Grupos de Clientes", "Clientes"];

const Panel = ({ title, items, onSelect, selectedKey, level, isLoading }) => {
  const Icon = iconMapping[level] || Users;
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-card border-r border-border/80 w-[300px] flex-shrink-0 flex flex-col flex-grow"
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
              <motion.button
                key={item.key}
                onClick={() => onSelect(item)}
                className={cn(
                  "w-full text-left px-3 py-2.5 transition-colors duration-150",
                  selectedKey === item.key ? "bg-primary/10" : "hover:bg-muted/50"
                )}
                whileHover={{ scale: 1.01, backgroundColor: selectedKey === item.key ? undefined : "rgba(var(--muted-rgb), 0.5)" }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <div className="flex justify-between items-center">
                    <span className={cn("text-sm truncate flex-1 pr-2", selectedKey === item.key ? "text-primary font-semibold" : "")}>{item.name}</span>
                    <Badge variant={getPercentageVariant(item.percentage)} className="font-bold text-xs">{formatPercentage(item.percentage)}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                    <span>Vendas: {formatCurrency(item.totalSales)}</span>
                    <span>Bonif.: {formatCurrency(item.totalBonification)}</span>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground p-4 h-full flex items-center justify-center flex-col gap-2">
            <Users className="h-8 w-8 text-muted-foreground" />
            <p>Nenhum dado encontrado para este nível.</p>
          </div>
        )}
      </ScrollArea>
    </motion.div>
  );
};

const BonificationDrilldownExplorer = () => {
  const { filters } = useFilters();
  const { toast } = useToast();
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  const fetchDrilldownData = useCallback(async (level, parentKeys) => {
    const selectedClients = filters.clients ? filters.clients.map(c => c.value) : null;
    
    // Robust date parsing to avoid "undefined" values being passed to RPC
    const rawFrom = filters.dateRange?.from ? new Date(filters.dateRange.from) : null;
    const rawTo = filters.dateRange?.to ? new Date(filters.dateRange.to) : null;
    
    const startDate = isValid(rawFrom) ? format(rawFrom, 'yyyy-MM-dd') : null;
    const endDate = isValid(rawTo) ? format(rawTo, 'yyyy-MM-dd') : null;

    // Prepare params ensuring NO undefined values are passed which breaks RPC signature matching
    const rpcParams = {
      p_start_date: startDate,
      p_end_date: endDate,
      p_exclude_employees: filters.excludeEmployees ?? true,
      p_supervisors: filters.supervisors || null,
      p_sellers: filters.sellers || null,
      p_customer_groups: filters.customerGroups || null,
      p_regions: filters.regions || null,
      p_clients: selectedClients || null,
      p_search_term: filters.searchTerm || null,
      p_drilldown_level: level,
      p_parent_keys: parentKeys || []
    };

    const { data, error } = await supabase.rpc('get_bonification_drilldown_data', rpcParams);

    if (error) {
      console.error("Error fetching drilldown data:", error);
      toast({ variant: "destructive", title: `Erro ao detalhar`, description: error.message });
      return [];
    }
    return Array.isArray(data) ? data : [];
  }, [filters, toast]);

  useEffect(() => {
    const fetchTopLevel = async () => {
      setLoading(true);
      const data = await fetchDrilldownData(1, []);
      setPanels([{
        title: panelTitles[0],
        items: data,
        selectedKey: null,
        isLoading: false,
      }]);
      setLoading(false);
    };

    fetchTopLevel();
  }, [filters, fetchDrilldownData]);

  const handleSelect = useCallback(async (panelIndex, item) => {
    const currentPanel = panels[panelIndex];
    if (currentPanel.selectedKey === item.key) return;

    const newPanels = panels.slice(0, panelIndex + 1);
    newPanels[panelIndex] = { ...newPanels[panelIndex], selectedKey: item.key };

    const nextLevel = panelIndex + 2;
    
    if (nextLevel > panelTitles.length) {
        setPanels(newPanels);
        return;
    }

    setPanels([...newPanels, { title: panelTitles[panelIndex + 1], items: [], selectedKey: null, isLoading: true }]);

    const parentKeys = newPanels.map(p => {
        const selectedItem = p.items.find(i => i.key === p.selectedKey);
        return selectedItem ? selectedItem.key : null;
    }).filter(Boolean);

    const childrenData = await fetchDrilldownData(nextLevel, parentKeys);

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
  }, [panels, fetchDrilldownData]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [panels]);

  const breadcrumbs = panels.map((p, i) => ({
    name: Array.isArray(p.items) && p.items.find(it => it.key === p.selectedKey)?.name || p.title,
    index: i
  })).filter(b => panels[b.index].selectedKey);

  const handleBreadcrumbClick = (index) => {
    const newPanels = panels.slice(0, index + 1);
    setPanels(newPanels);
  };

  const handleHomeClick = () => {
    const firstPanel = panels[0];
    if (firstPanel) {
      setPanels([{ ...firstPanel, selectedKey: null }]);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col h-[600px] bg-background overflow-hidden">
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
      </div>
    </div>
  );
};

export default BonificationDrilldownExplorer;