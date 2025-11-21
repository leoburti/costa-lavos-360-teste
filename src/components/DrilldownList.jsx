import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Plus, Minus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const formatCurrency = (value) => {
  if (typeof value !== 'number') return '';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const DrilldownSubItem = ({ item }) => (
  <div className="flex flex-col pl-4">
    <div className="flex items-center justify-between p-2 my-1 rounded-md bg-muted/50">
      <p className="font-normal text-xs text-foreground truncate flex-grow">{item.name}</p>
      <p className="font-medium text-xs text-foreground ml-4">{formatCurrency(item.value)}</p>
    </div>
  </div>
);

const DrilldownItem = ({ item, level, onToggle, openItems, path, analysisMode, labels }) => {
  const isOpen = openItems[path];
  const { getDrilldownData, setLoading: setGlobalLoading } = useData();
  const [children, setChildren] = useState({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const levelCount = labels.length;
  const isLeaf = level >= (levelCount - 1);

  const handleToggle = useCallback(async () => {
    const newPath = `${path}.${item.key}`;
    onToggle(newPath);

    if (!isOpen && !isLeaf && Object.keys(children).length === 0) {
      setLoading(true);
      const parentKeys = newPath.split('.').slice(1);
      
      const data = await getDrilldownData({
        p_analysis_mode: analysisMode,
        p_drilldown_level: level + 2,
        p_parent_keys: parentKeys
      });

      if (data) {
        setChildren(data);
      } else {
        setChildren({});
      }
      setLoading(false);
    }
  }, [isOpen, isLeaf, children, onToggle, path, item.key, level, analysisMode, getDrilldownData, toast]);

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "flex items-center justify-between p-3 rounded-md transition-colors hover:bg-muted",
          isOpen ? 'bg-muted' : ''
        )}
      >
        <div className="flex items-center gap-2">
          {!isLeaf ? (
             <Button variant="ghost" size="icon" onClick={handleToggle} className="h-7 w-7 flex-shrink-0">
               {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
               ) : (
                isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />
               )}
            </Button>
          ) : <div className="w-7 h-7"></div>}
          <p className="font-medium text-sm text-foreground truncate flex-grow">{item.name}</p>
        </div>
        <p className="font-semibold text-sm text-foreground ml-4">{formatCurrency(item.value)}</p>
      </div>

      <AnimatePresence>
        {isOpen && !isLeaf && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
            style={{ paddingLeft: `16px` }}
          >
            <div className="border-l-2 border-dashed border-border/50 ml-6 my-1 pl-4 space-y-2">
              {Object.entries(children).map(([key, value]) => (
                value && value.length > 0 && (
                  <div key={key}>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider my-2">{key}</h4>
                    {value.map((childItem, index) => (
                       <DrilldownSubItem 
                          key={`${key}-${index}`}
                          item={childItem} 
                        />
                    ))}
                  </div>
                )
              ))}
              {!loading && Object.values(children).every(arr => !arr || arr.length === 0) && (
                 <p className="p-3 text-sm text-muted-foreground">Nenhum dado encontrado para esta categoria.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


const DrilldownList = ({ analysisMode }) => {
  const { filters, getDrilldownData } = useData();
  const [topLevelData, setTopLevelData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openItems, setOpenItems] = useState({});

  const levelLabels = {
    region: ['Região', 'Dia', 'Supervisor', 'Vendedor', 'Grupo Cliente', 'Cliente', 'Produto'],
    customerGroup: ['Grupo de Cliente', 'Dia', 'Região', 'Cliente', 'Produto']
  };
  
  const currentLabels = levelLabels[analysisMode] || [];

  useEffect(() => {
    const fetchData = async () => {
      if (!filters.startDate || !filters.endDate) return;
      setLoading(true);
      setOpenItems({});
      
      const data = await getDrilldownData({
          p_analysis_mode: analysisMode,
          p_drilldown_level: 1,
          p_parent_keys: []
      });

      if (data) {
        setTopLevelData(data);
      } else {
        setTopLevelData([]);
      }
      setLoading(false);
    };

    fetchData();
  }, [filters, analysisMode, getDrilldownData]);

  const handleToggle = (path) => {
    setOpenItems((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between px-4 py-2 bg-muted rounded-md sticky top-0 z-10">
          <p className="font-semibold text-sm text-muted-foreground">{currentLabels[0]}</p>
          <p className="font-semibold text-sm text-muted-foreground">Valor Total</p>
      </div>
      {topLevelData && topLevelData.length > 0 ? (
        topLevelData.map((item, index) => (
          <DrilldownItem
            key={index}
            item={item}
            level={0}
            onToggle={handleToggle}
            openItems={openItems}
            path="root"
            analysisMode={analysisMode}
            labels={currentLabels}
          />
        ))
      ) : (
        <p className="text-center text-muted-foreground p-8">Nenhum dado encontrado para os filtros selecionados.</p>
      )}
    </div>
  );
};

export default DrilldownList;