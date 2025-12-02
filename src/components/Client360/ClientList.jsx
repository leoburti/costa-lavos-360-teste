import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, User, Search, CheckCircle, Loader2, MapPin, DollarSign, Gift, Wrench, HardHat, AlertCircle, Building2 } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/ui/use-toast';
import { format, subDays, isValid } from 'date-fns';
import { supabase } from '@/lib/customSupabaseClient';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ClientList = ({ onSelect, selectedItem, dateRange }) => {
  const [activeTab, setActiveTab] = useState('clients');
  const [searchTerm, setSearchTerm] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    // Safety check for dates
    if (!dateRange?.from || !isValid(new Date(dateRange.from)) || !dateRange?.to || !isValid(new Date(dateRange.to))) {
        return;
    }
    
    setLoading(true);
    try {
      let formattedStart = format(new Date(dateRange.from), 'yyyy-MM-dd');
      let formattedEnd = format(new Date(dateRange.to), 'yyyy-MM-dd');

      // Auto-expand range if too short and no search term to prevent empty initial state
      const dayDiff = (new Date(dateRange.to) - new Date(dateRange.from)) / (1000 * 60 * 60 * 24);
      if (dayDiff < 1 && !debouncedSearch) {
         formattedStart = format(subDays(new Date(), 90), 'yyyy-MM-dd');
      }

      let resultData = [];
      let error = null;

      if (activeTab === 'clients') {
        const response = await supabase.rpc('get_clientes_visao_360_faturamento', {
            p_start_date: formattedStart,
            p_end_date: formattedEnd,
            p_search_term: debouncedSearch || null
        });
        resultData = response.data;
        error = response.error;
      } else {
        const response = await supabase.rpc('get_grupos_visao_360_faturamento', {
            p_start_date: formattedStart,
            p_end_date: formattedEnd,
            p_search_term: debouncedSearch || null
        });
        resultData = response.data;
        error = response.error;
      }

      if (error) throw error;

      setList(resultData || []);

    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar dados",
        description: "Não foi possível carregar a lista. Tente novamente."
      });
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeTab, dateRange, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = (value) => {
    setActiveTab(value);
    setList([]); 
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  const renderClientItem = (client) => {
    const isSelected = selectedItem?.type === 'client' && selectedItem?.id === client.id;
    return (
      <motion.button
        key={client.id}
        variants={itemVariants}
        layout
        onClick={() => onSelect({ type: 'client', ...client })}
        className={cn(
            "w-full text-left p-3.5 rounded-xl border transition-all duration-200 group mb-2.5 relative overflow-hidden", 
            isSelected 
                ? 'bg-primary/5 border-primary/40 shadow-[0_0_0_1px_rgba(var(--primary),0.2)]' 
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary/30 hover:shadow-md'
        )}
      >
        {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
        <div className="flex items-start gap-3.5">
          <div className={cn(
            "p-2.5 rounded-full shrink-0 transition-colors mt-0.5", 
            isSelected ? "bg-white dark:bg-slate-800 text-primary shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary"
          )}>
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <span className={cn("font-semibold text-sm truncate leading-tight", isSelected ? "text-primary" : "text-slate-900 dark:text-slate-100")}>
                  {client.nome_fantasia || client.nome}
              </span>
              {isSelected && <CheckCircle className="h-4 w-4 text-primary shrink-0 animate-in zoom-in duration-200" />}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="truncate max-w-[120px] flex items-center gap-1">
                   <MapPin className="w-3 h-3 shrink-0"/> {client.cidade || 'N/D'}
                </span>
                <span className="w-1 h-1 bg-slate-300 rounded-full shrink-0" />
                <span className="font-mono">{client.codigo}</span>
            </div>

            <div className="flex items-center justify-between pt-1.5">
                <Badge variant="outline" className={cn("bg-slate-50 font-medium px-2 py-0.5 h-auto", isSelected ? "border-primary/20 text-primary" : "text-slate-600 dark:text-slate-300")}>
                    <DollarSign className="w-3 h-3 mr-1"/> {formatCurrency(client.faturamento)}
                </Badge>
                
                <div className="flex items-center gap-1 shrink-0">
                  {client.has_bonification && (
                    <div className="w-6 h-6 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 flex items-center justify-center" title="Com Bonificação">
                      <Gift className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                    </div>
                  )}
                  {client.has_equipment && (
                    <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex items-center justify-center" title="Possui Equipamentos">
                      <HardHat className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                  {client.has_maintenance && (
                    <div className="w-6 h-6 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 flex items-center justify-center" title="Chamados Recentes">
                      <Wrench className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                    </div>
                  )}
                </div>
            </div>
          </div>
        </div>
      </motion.button>
    );
  };
  
  const renderGroupItem = (group) => {
    const isSelected = selectedItem?.type === 'group' && selectedItem?.id === group.id;
    return (
      <motion.button
        key={group.id}
        variants={itemVariants}
        layout
        onClick={() => onSelect({ type: 'group', ...group })}
        className={cn(
            "w-full text-left p-3.5 rounded-xl border transition-all duration-200 group mb-2.5 relative overflow-hidden", 
            isSelected 
                ? 'bg-primary/5 border-primary/40 shadow-[0_0_0_1px_rgba(var(--primary),0.2)]' 
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary/30 hover:shadow-md'
        )}
      >
        {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
        <div className="flex items-start gap-3.5">
          <div className={cn(
            "p-2.5 rounded-full shrink-0 transition-colors mt-0.5", 
            isSelected ? "bg-white dark:bg-slate-800 text-primary shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary"
          )}>
            <Building2 className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between mb-0.5">
              <span className={cn("font-semibold text-sm truncate", isSelected ? "text-primary" : "text-slate-900 dark:text-slate-100")}>
                {group.nome}
              </span>
              {isSelected && <CheckCircle className="h-4 w-4 text-primary shrink-0 ml-2" />}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Users className="w-3 h-3"/> {group.quantidade_clientes} lojas vinculadas
            </p>
            <div className="flex items-center pt-1.5">
                <Badge variant="outline" className={cn("bg-slate-50 font-medium px-2 py-0.5 h-auto", isSelected ? "border-primary/20 text-primary" : "text-slate-600 dark:text-slate-300")}>
                    <DollarSign className="w-3 h-3 mr-1"/> {formatCurrency(group.faturamento_total)}
                </Badge>
            </div>
          </div>
        </div>
      </motion.button>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950">
      <div className="p-4 space-y-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Clientes
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Grupos
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            type="text" 
            placeholder={`Buscar ${activeTab === 'clients' ? 'cliente' : 'grupo'}...`} 
            className="h-10 pl-10 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 transition-all" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      <ScrollArea className="flex-1 bg-slate-50/50 dark:bg-slate-950">
        <div className="p-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin mb-3 text-primary" /> 
                <span className="text-sm font-medium">Carregando {activeTab === 'clients' ? 'clientes' : 'grupos'}...</span>
            </div>
          ) : list.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.03 } } }} className="space-y-1">
                {list.map(item => activeTab === 'clients' ? renderClientItem(item) : renderGroupItem(item))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4 space-y-3 animate-in fade-in zoom-in duration-300">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full">
                <AlertCircle className="h-8 w-8 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Nenhum resultado</p>
                <p className="text-xs text-slate-500 max-w-[220px] mx-auto mt-1">
                    {searchTerm.length > 0 
                        ? `Não encontramos nada para "${searchTerm}" em ${activeTab === 'clients' ? 'clientes' : 'grupos'}.` 
                        : `Nenhuma venda registrada neste período.`}
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] text-center text-slate-400">
        Exibindo {list.length} resultados ordenados por vendas
      </div>
    </div>
  );
};

export default ClientList;