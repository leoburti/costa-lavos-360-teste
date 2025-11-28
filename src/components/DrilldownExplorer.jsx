import React, { useState, useEffect, useCallback, useRef, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Loader2, ChevronRight, MapPin, Building2, User, Users, Store, Calendar, ShoppingCart, Package, CreditCard, TrendingUp, TrendingDown, Minus, Home } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';

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
  },
  customerGroup: {
    dimensions: ['customerGroup', 'supervisor', 'seller', 'region', 'client', 'date', 'order', 'product'],
    dimensionLabels: ["Grupos de Clientes", "Supervisores", "Vendedores", "Regiões", "Clientes", "Datas", "Pedidos", "Produtos"],
  },
  seller: {
    dimensions: ['region', 'customerGroup', 'client', 'date', 'order', 'product'],
    dimensionLabels: ["Regiões", "Grupos de Clientes", "Clientes", "Datas", "Pedidos", "Produtos"],
  },
  supervisor: {
    dimensions: ['seller', 'region', 'customerGroup', 'client', 'date', 'order', 'product'],
    dimensionLabels: ["Vendedores", "Regiões", "Grupos de Clientes", "Clientes", "Datas", "Pedidos", "Produtos"],
  }
};

const PriceDifferenceIndicator = ({ unitPrice, avgPrice }) => {
  if (!unitPrice || !avgPrice || avgPrice === 0) return <Minus className="h-3 w-3 text-slate-400" />;
  const difference = ((unitPrice - avgPrice) / avgPrice) * 100;
  if (Math.abs(difference) < 1) return <Minus className="h-3 w-3 text-slate-400" />;
  if (difference > 0) return <TrendingUp className="h-3 w-3 text-emerald-500" />;
  return <TrendingDown className="h-3 w-3 text-red-500" />;
};

const ProductDetails = ({ products, isLoading }) => (
  <div className="p-2">
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
                  <span className={cn("flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full", child.unit_price > child.avg_unit_price ? 'bg-emerald-100 text-emerald-700' : child.unit_price < child.avg_unit_price ? 'bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-600')}>
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

const Panel = forwardRef(({ title, items, onSelect, selectedKey, level, icon, isLoading }, ref) => {
  const Icon = icon;
  return (
    <motion.div
      ref={ref}
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
});

const formatDateToAPI = (date) => (date ? format(new Date(date), 'yyyy-MM-dd') : null);

const DrilldownExplorer = ({ analysisMode = 'region', filters: initialFilters = {} }) => {
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productDetails, setProductDetails] = useState({ isLoading: false, data: [] });
  const containerRef = useRef(null);
  const { toast } = useToast();

  const config = analysisConfig[analysisMode];

  const { data: initialResponse, loading: initialLoading } = useAnalyticalData(
    'get_treemap_data', 
    { ...initialFilters, p_analysis_mode: analysisMode, p_show_defined_groups_only: false },
    { enabled: panels.length === 0 }
  );

  useEffect(() => {
    if (!initialLoading && initialResponse) {
      const initialData = initialResponse || [];
      const items = initialData.map(d => ({ key: d.name, name: d.name, value: d.size || d.value }));
      setPanels([{
          title: config.dimensionLabels[0],
          items: items,
          selectedKey: null,
          isLoading: false,
      }]);
      setLoading(false);
    }
  }, [initialResponse, initialLoading, config.dimensionLabels, analysisMode]);

  const handleSelect = useCallback(async (panelIndex, item) => {
    const currentPanel = panels[panelIndex];
    if (currentPanel.selectedKey === item.key) return;

    let newPanels = panels.slice(0, panelIndex + 1);
    newPanels[panelIndex] = { ...newPanels[panelIndex], selectedKey: item.key };
    setProductDetails({ isLoading: false, data: [] });

    const nextLevelIndex = panelIndex + 1;
    if (nextLevelIndex >= config.dimensions.length) return;

    const nextDrilldownLevel = nextLevelIndex + 1;
    
    // 1. Get keys from PREVIOUS panels
    const parentKeys = panels.slice(0, panelIndex).map(p => p.selectedKey).filter(Boolean);
    
    // 2. Add the CURRENTLY clicked item's key
    const newParentKeys = [...parentKeys, item.key];

    // CRITICAL: Logging before the RPC call
    console.log("DEBUG - DrilldownExplorer: Chamada RPC 'get_drilldown_data'");
    console.log("  1) panelIndex:", panelIndex);
    console.log("  2) item.key:", item.key);
    console.log("  3) parentKeys (array completo):", newParentKeys);
    console.log("  4) nextDrilldownLevel:", nextDrilldownLevel);

    const defaultStart = startOfMonth(new Date());
    const defaultEnd = endOfMonth(new Date());

    const drilldownParams = {
        p_analysis_mode: analysisMode,
        p_start_date: formatDateToAPI(initialFilters.dateRange?.from || defaultStart),
        p_end_date: formatDateToAPI(initialFilters.dateRange?.to || defaultEnd),
        p_exclude_employees: initialFilters.excludeEmployees,
        p_supervisors: initialFilters.supervisors,
        p_sellers: initialFilters.sellers,
        p_customer_groups: initialFilters.customerGroups,
        p_regions: initialFilters.regions,
        p_clients: initialFilters.clients,
        p_search_term: initialFilters.searchTerm,
        p_show_defined_groups_only: false,
        p_drilldown_level: nextDrilldownLevel,
        p_parent_keys: newParentKeys,
    };

    setPanels([...newPanels, { title: config.dimensionLabels[nextLevelIndex], items: [], selectedKey: null, isLoading: true }]);
    
    const { data: response, error } = await supabase.rpc('get_drilldown_data', drilldownParams);
    
    if (error) {
        toast({ variant: "destructive", title: `Erro ao detalhar`, description: error.message });
        console.error("DEBUG: Erro da RPC get_drilldown_data para o nível " + config.dimensionLabels[nextLevelIndex] + ":", { error, params: drilldownParams });
    }

    if (response?.debug_info) {
      console.log("DEBUG: Informações de depuração da RPC 'get_drilldown_data':", response.debug_info);
      toast({
        variant: "default",
        title: "Depuração RPC",
        description: "Informações de depuração foram registradas no console do navegador.",
        duration: 10000,
      });
    }
    
    const finalChildren = response?.data || [];

    if (config.dimensions[nextLevelIndex] === 'product') {
        setPanels(newPanels); // Don't add a new panel for products
        setProductDetails({ isLoading: false, data: finalChildren });
    } else {
        setPanels(prevPanels => {
          const updatedPanels = [...prevPanels];
          const targetPanelIndex = panelIndex + 1;
          if (updatedPanels[targetPanelIndex]) {
            updatedPanels[targetPanelIndex] = {
              ...updatedPanels[targetPanelIndex],
              items: finalChildren,
              isLoading: false,
            };
          }
          return updatedPanels;
        });
    }

  }, [panels, config, analysisMode, initialFilters, toast]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: containerRef.current.scrollWidth,
        behavior: 'smooth'
      });
    }
  }, [panels.length, productDetails.data?.length]);
  
  const getBreadcrumbs = () => {
    const crumbs = [];
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
      <div className="flex items-center gap-1 p-3 border-b border-slate-100 bg-white text-sm text-slate-500 overflow-x-auto no-scrollbar">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-indigo-50 hover:text-indigo-600" onClick={handleHomeClick}>
          <Home className="h-4 w-4" />
        </Button>
        
        {breadcrumbs.length > 0 && <ChevronRight className="h-4 w-4 text-slate-300 flex-shrink-0" />}
        
        {breadcrumbs.map((crumb, i) => (
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
                <span className="truncate">{crumb.name}</span>
                </Button>
                {i < breadcrumbs.length - 1 && <ChevronRight className="h-4 w-4 text-slate-300 flex-shrink-0" />}
            </React.Fragment>
        ))}
      </div>

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