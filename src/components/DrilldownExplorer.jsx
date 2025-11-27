import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronRight, MapPin, Building2, User, Users, Store, Calendar, ShoppingCart, Package, CreditCard, TrendingUp, TrendingDown, Minus, Home } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'R$ 0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const iconMapping = {
  region: MapPin,
  supervisor: Building2,
  seller: User,
  customerGroup: Users,
  client: Store,
  date: Calendar,
  order: ShoppingCart,
  product: Package,
};

const analysisConfig = {
  region: {
    dimensions: ['region', 'supervisor', 'seller', 'customerGroup', 'client', 'date', 'order', 'product'],
    dimensionLabels: ["Regiões", "Supervisores", "Vendedores", "Grupos de Clientes", "Clientes", "Datas", "Pedidos", "Produtos"],
    initialRpc: 'get_treemap_data',
    drilldownRpc: 'get_drilldown_data'
  },
  seller: {
    dimensions: ['region', 'customerGroup', 'client', 'date', 'order', 'product'],
    dimensionLabels: ["Regiões", "Grupos de Clientes", "Clientes", "Datas", "Pedidos", "Produtos"],
    initialRpc: 'get_drilldown_data',
    drilldownRpc: 'get_drilldown_data'
  },
  supervisor: {
    dimensions: ['seller', 'region', 'customerGroup', 'client', 'date', 'order', 'product'],
    dimensionLabels: ["Vendedores", "Regiões", "Grupos de Clientes", "Clientes", "Datas", "Pedidos", "Produtos"],
    initialRpc: 'get_drilldown_data',
    drilldownRpc: 'get_drilldown_data'
  }
};

const useDrilldownData = (analysisMode, filters, overrideFilters) => {
    const { toast } = useToast();
    const config = analysisConfig[analysisMode];

    // Stabilize activeFilters using useMemo to prevent infinite loops
    const activeFilters = useMemo(() => {
        return { ...filters, ...overrideFilters };
    }, [
        filters.startDate,
        filters.endDate,
        filters.excludeEmployees,
        filters.searchTerm,
        JSON.stringify(filters.supervisors),
        JSON.stringify(filters.sellers),
        JSON.stringify(filters.customerGroups),
        JSON.stringify(filters.regions),
        JSON.stringify(filters.clients),
        JSON.stringify(overrideFilters)
    ]);

    const fetchInitialData = useCallback(async () => {
        const isDrilldownRpc = ['seller', 'supervisor'].includes(analysisMode);
        const rpcName = isDrilldownRpc ? config.drilldownRpc : config.initialRpc;

        const rpcParams = isDrilldownRpc ? {
            p_start_date: activeFilters.startDate,
            p_end_date: activeFilters.endDate,
            p_exclude_employees: activeFilters.excludeEmployees,
            p_supervisors: activeFilters.supervisors,
            p_sellers: activeFilters.sellers,
            p_customer_groups: activeFilters.customerGroups,
            p_regions: activeFilters.regions,
            p_clients: activeFilters.clients,
            p_search_term: activeFilters.searchTerm,
            p_analysis_mode: analysisMode,
            p_drilldown_level: 1,
            p_parent_keys: []
        } : {
            p_start_date: activeFilters.startDate,
            p_end_date: activeFilters.endDate,
            p_exclude_employees: activeFilters.excludeEmployees,
            p_supervisors: activeFilters.supervisors,
            p_sellers: activeFilters.sellers,
            p_customer_groups: activeFilters.customerGroups,
            p_regions: activeFilters.regions,
            p_clients: activeFilters.clients,
            p_search_term: activeFilters.searchTerm,
            p_analysis_mode: config.dimensions[0],
            p_show_defined_groups_only: false,
        };

        const { data, error } = await supabase.rpc(rpcName, rpcParams);

        if (error) {
            toast({ variant: "destructive", title: `Erro ao buscar dados iniciais`, description: error.message });
            return [];
        }

        const items = (isDrilldownRpc ? data : data.map(d => ({ key: d.name, name: d.name, value: d.size }))).map(item => ({
            ...item,
            value: item.value || item.size
        }));
        
        return items;

    }, [activeFilters, toast, analysisMode, config]);
    
    const fetchDrilldownData = useCallback(async (level, parentKeys) => {
        const { data, error } = await supabase.rpc(config.drilldownRpc, {
            p_start_date: activeFilters.startDate,
            p_end_date: activeFilters.endDate,
            p_exclude_employees: activeFilters.excludeEmployees,
            p_supervisors: activeFilters.supervisors,
            p_sellers: activeFilters.sellers,
            p_customer_groups: activeFilters.customerGroups,
            p_regions: activeFilters.regions,
            p_clients: activeFilters.clients,
            p_search_term: activeFilters.searchTerm,
            p_analysis_mode: analysisMode,
            p_drilldown_level: level,
            p_parent_keys: parentKeys
        });

        if (error) {
            toast({ variant: "destructive", title: `Erro ao detalhar`, description: error.message });
            return [];
        }
        return Array.isArray(data) ? data : [];
    }, [activeFilters, toast, analysisMode, config.drilldownRpc]);

    return { fetchInitialData, fetchDrilldownData };
};


const PriceDifferenceIndicator = ({ unitPrice, avgPrice }) => {
  if (!unitPrice || !avgPrice || avgPrice === 0) return <Minus className="h-3 w-3 text-slate-400" />;
  const difference = ((unitPrice - avgPrice) / avgPrice) * 100;
  if (Math.abs(difference) < 1) return <Minus className="h-3 w-3 text-slate-400" />;
  if (difference > 0) return <TrendingUp className="h-3 w-3 text-emerald-500" />;
  return <TrendingDown className="h-3 w-3 text-red-500" />;
};

const ProductDetails = ({ products, isLoading }) => (
  <div className="p-2 h-full flex flex-col bg-slate-50/50">
    <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-500 mb-3 px-3 pt-3 flex items-center gap-2">
      <Package className="h-4 w-4" />
      Produtos do Pedido
    </h4>
    {isLoading ? (
      <div className="flex items-center justify-center flex-1">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
      </div>
    ) : products && products.length > 0 ? (
      <div className="space-y-2 px-2 pb-2">
        {products.map((child, index) => (
          <div key={child.key || `prod-${index}`} className="p-3 text-sm bg-white rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start">
              <span className="font-semibold text-slate-800 flex-1 pr-2 leading-tight">{child.name}</span>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold">
                {formatCurrency(child.value)}
              </Badge>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-50 grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-slate-400">Quantidade</span>
                <span className="font-medium text-slate-700">{child.quantity} un.</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-slate-400">Preço Unit.</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-slate-700">{formatCurrency(child.unit_price)}</span>
                  <span className={cn("flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full", child.unit_price > child.avg_unit_price ? 'bg-emerald-100 text-emerald-700' : child.unit_price < child.avg_unit_price ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600')}>
                    <PriceDifferenceIndicator unitPrice={child.unit_price} avgPrice={child.avg_unit_price} />
                    {child.avg_unit_price ? `${Math.abs(((child.unit_price - child.avg_unit_price) / child.avg_unit_price) * 100).toFixed(0)}%` : '-'}
                  </span>
                </div>
              </div>
            </div>
            {child.payment_condition && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-fit">
                <CreditCard className="h-3 w-3" /> {child.payment_condition}
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center text-sm text-slate-400 p-8 flex flex-col items-center justify-center h-full">
        <Package className="h-8 w-8 mb-2 text-slate-300" />
        Nenhum produto encontrado.
      </div>
    )}
  </div>
);

const Panel = ({ title, items, onSelect, selectedKey, level, icon, isLoading }) => {
  const Icon = icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-white border-r border-slate-200 min-w-[320px] max-w-[320px] flex-shrink-0 flex flex-col h-full relative z-10"
    >
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-20">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-indigo-500" />}
          {title}
        </h3>
      </div>
      <ScrollArea className="flex-grow bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        ) : items && items.length > 0 ? (
          <div className="p-2 space-y-1">
            {items.map((item, index) => (
              <button
                key={item.key || `${level}-${index}`}
                onClick={() => onSelect(item)}
                className={cn(
                  "w-full text-left px-3 py-3 rounded-lg flex justify-between items-center transition-all duration-200 group border border-transparent",
                  selectedKey === item.key 
                    ? "bg-indigo-50 border-indigo-100 shadow-sm" 
                    : "hover:bg-slate-50 hover:border-slate-100"
                )}
              >
                <div className="min-w-0 flex-1 mr-3">
                  <p className={cn("text-sm font-medium truncate", selectedKey === item.key ? "text-indigo-700" : "text-slate-700 group-hover:text-slate-900")}>
                    {item.name}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn("text-xs font-bold", selectedKey === item.key ? "text-indigo-600" : "text-slate-500")}>
                    {formatCurrency(item.value)}
                  </span>
                  {selectedKey === item.key && <ChevronRight className="h-3 w-3 text-indigo-500" />}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center text-sm text-slate-400 py-12 px-4">
            Nenhum dado disponível para este nível.
          </div>
        )}
      </ScrollArea>
    </motion.div>
  );
};

const DrilldownExplorer = ({ analysisMode = 'region', initialFilters = {}, overrideFilters = {} }) => {
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productDetails, setProductDetails] = useState({ isLoading: false, data: [] });
  const containerRef = useRef(null);

  const config = analysisConfig[analysisMode];
  const { fetchInitialData, fetchDrilldownData } = useDrilldownData(analysisMode, initialFilters, overrideFilters);

  // Use a ref to track previous essential dependencies to avoid infinite loops or unnecessary resets
  const prevFiltersRef = useRef(null);

  const initExplorer = useCallback(async () => {
    setLoading(true);
    setProductDetails({ isLoading: false, data: [] }); // Reset product details
    const topLevelItems = await fetchInitialData();
    setPanels([{
        title: config.dimensionLabels[0],
        items: topLevelItems,
        selectedKey: null,
        isLoading: false,
    }]);
    setLoading(false);
  }, [fetchInitialData, config.dimensionLabels]);

  useEffect(() => {
    const currentFilters = { ...initialFilters, ...overrideFilters };
    
    // Check if filters actually changed using deep comparison for arrays
    const prevFilters = prevFiltersRef.current;
    
    const hasChanged = !prevFilters ||
        currentFilters.startDate !== prevFilters.startDate ||
        currentFilters.endDate !== prevFilters.endDate ||
        JSON.stringify(currentFilters.supervisors) !== JSON.stringify(prevFilters.supervisors) ||
        JSON.stringify(currentFilters.sellers) !== JSON.stringify(prevFilters.sellers) ||
        JSON.stringify(currentFilters.regions) !== JSON.stringify(prevFilters.regions) ||
        JSON.stringify(currentFilters.customerGroups) !== JSON.stringify(prevFilters.customerGroups);

    if (hasChanged) {
        prevFiltersRef.current = currentFilters;
        initExplorer();
    }
  }, [initExplorer, initialFilters, overrideFilters]); // Removed panels.length to avoid loop


  const handleSelect = useCallback(async (panelIndex, item) => {
    const currentPanel = panels[panelIndex];
    if (currentPanel.selectedKey === item.key) return;

    const newPanels = panels.slice(0, panelIndex + 1);
    newPanels[panelIndex] = { ...newPanels[panelIndex], selectedKey: item.key };
    setProductDetails({ isLoading: false, data: [] });

    const nextLevelIndex = panelIndex + 1;
    if (nextLevelIndex >= config.dimensions.length) return;

    const nextDrilldownLevel = nextLevelIndex + 1;

    const parentKeys = newPanels.map(p => {
        const selectedItem = p.items.find(i => i.key === p.selectedKey);
        return selectedItem ? selectedItem.key : null;
    }).filter(Boolean);

    if (config.dimensions[nextLevelIndex] === 'product') {
        setPanels(newPanels);
        setProductDetails({ isLoading: true, data: [] });
        const productData = await fetchDrilldownData(nextDrilldownLevel, parentKeys);
        setProductDetails({ isLoading: false, data: productData });
        return;
    }

    setPanels([...newPanels, { title: config.dimensionLabels[nextLevelIndex], items: [], selectedKey: null, isLoading: true }]);

    const childrenData = await fetchDrilldownData(nextDrilldownLevel, parentKeys);

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
  }, [panels, fetchDrilldownData, config]);

  useEffect(() => {
    if (containerRef.current) {
      // Smooth scroll to right
      containerRef.current.scrollTo({
        left: containerRef.current.scrollWidth,
        behavior: 'smooth'
      });
    }
  }, [panels.length, productDetails.data.length]);
  
  const getBreadcrumbs = () => {
    const crumbs = [];
    
    // Add root context based on analysis mode
    if(analysisMode === 'seller' && overrideFilters.sellers && overrideFilters.sellers.length > 0) {
      crumbs.push({ name: overrideFilters.sellers[0], index: -2, icon: User });
    } else if (analysisMode === 'supervisor' && overrideFilters.supervisors && overrideFilters.supervisors.length > 0) {
      crumbs.push({ name: overrideFilters.supervisors[0], index: -2, icon: Building2 });
    }

    panels.forEach((p, i) => {
        const selectedItem = p.items.find(it => it.key === p.selectedKey);
        if (selectedItem) {
            crumbs.push({ name: selectedItem.name, index: i });
        }
    });
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const handleBreadcrumbClick = (index) => {
    if (index < 0) {
        handleHomeClick();
        return;
    }
    const newPanels = panels.slice(0, index + 1);
    newPanels[index] = {...newPanels[index], selectedKey: null};
    setPanels(newPanels);
    setProductDetails({ isLoading: false, data: [] });
  };

  const handleHomeClick = () => {
    setPanels(panels.slice(0, 1).map(p => ({...p, selectedKey: null})));
    setProductDetails({ isLoading: false, data: [] });
  };

  const lastPanel = panels[panels.length - 1];
  const isLastLevelProducts = config.dimensions[config.dimensions.length - 1] === 'product';
  const showProductDetails = lastPanel && lastPanel.selectedKey && panels.length === (config.dimensions.length - (isLastLevelProducts ? 1 : 0));

  if (loading) {
    return <div className="flex flex-col items-center justify-center h-[500px] bg-white rounded-xl border border-slate-200 shadow-sm"><Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-3" /><p className="text-sm text-slate-500 font-medium">Carregando explorador...</p></div>;
  }

  return (
    <div className="flex flex-col h-[650px] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Breadcrumbs Bar */}
      <div className="flex items-center gap-1 p-3 border-b border-slate-100 bg-white text-sm text-slate-500 overflow-x-auto no-scrollbar">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-indigo-50 hover:text-indigo-600" onClick={handleHomeClick}>
          <Home className="h-4 w-4" />
        </Button>
        
        {breadcrumbs.length > 0 && <ChevronRight className="h-4 w-4 text-slate-300 flex-shrink-0" />}
        
        {breadcrumbs.map((crumb, i) => {
          const CrumbIcon = crumb.icon;
          return (
            <React.Fragment key={i}>
                <Button
                variant="ghost"
                size="sm"
                className={cn(
                    "h-8 px-3 rounded-full font-medium transition-colors flex-shrink-0 max-w-[200px] truncate",
                    i === breadcrumbs.length - 1 ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-50 text-slate-600"
                )}
                onClick={() => handleBreadcrumbClick(crumb.index)}
                >
                {CrumbIcon && <CrumbIcon className="h-3.5 w-3.5 mr-2 opacity-70" />}
                <span className="truncate">{crumb.name}</span>
                </Button>
                {i < breadcrumbs.length - 1 && <ChevronRight className="h-4 w-4 text-slate-300 flex-shrink-0" />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Panels Container */}
      <div ref={containerRef} className="flex flex-grow overflow-x-auto scroll-smooth">
        <AnimatePresence initial={false} mode="popLayout">
          {panels.map((panel, index) => (
            <Panel
              key={`panel-${index}`}
              title={panel.title}
              icon={iconMapping[config.dimensions[index]]}
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
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-slate-50 border-l border-slate-200 min-w-[380px] max-w-[400px] flex-shrink-0 flex flex-col shadow-inner"
          >
            <ScrollArea className="flex-grow h-full">
              <ProductDetails products={productDetails.data} isLoading={productDetails.isLoading} />
            </ScrollArea>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DrilldownExplorer;