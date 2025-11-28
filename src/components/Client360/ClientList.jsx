import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, User, Search, CheckCircle, Loader2, MapPin, DollarSign, Gift, Wrench, HardHat, AlertCircle } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format, subDays, isValid } from 'date-fns';
import { supabase } from '@/lib/customSupabaseClient';

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
        console.warn('[ClientList] Invalid dates provided, skipping fetch.');
        return;
    }
    
    setLoading(true);
    try {
      let formattedStart = format(new Date(dateRange.from), 'yyyy-MM-dd');
      let formattedEnd = format(new Date(dateRange.to), 'yyyy-MM-dd');

      // Auto-expand range if too short and no search term (prevent empty initial state)
      const dayDiff = (new Date(dateRange.to) - new Date(dateRange.from)) / (1000 * 60 * 60 * 24);
      if (dayDiff < 1 && !debouncedSearch) {
         formattedStart = format(subDays(new Date(), 90), 'yyyy-MM-dd');
         console.log('[ClientList] Expanding short range to 90 days for better visibility.');
      }

      console.log(`[ClientList] Fetching ${activeTab}...`, { start: formattedStart, end: formattedEnd, search: debouncedSearch });

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
      console.log(`[ClientList] Loaded ${resultData?.length || 0} items.`);

    } catch (error) {
      console.error(`[ClientList] Error fetching ${activeTab}:`, error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar dados",
        description: `Falha na conexão: ${error.message}`
      });
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeTab, dateRange, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setList([]);
    setSearchTerm('');
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
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
            "w-full text-left p-3 rounded-lg border transition-all duration-200 group mb-2", 
            isSelected 
                ? 'bg-primary/5 border-primary/50 shadow-sm' 
                : 'bg-card border-border hover:bg-accent hover:border-accent-foreground/20'
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-full shrink-0 transition-colors", isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:bg-background")}>
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className={cn("font-medium text-sm truncate", isSelected ? "text-primary" : "text-foreground")}>
                    {client.nome_fantasia || client.nome}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  {client.has_bonification && (
                    <div className="p-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30" title="Bonificação">
                      <Gift className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                    </div>
                  )}
                  {client.has_equipment && (
                    <div className="p-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30" title="Equipamentos">
                      <HardHat className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                  {client.has_maintenance && (
                    <div className="p-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30" title="Manutenção">
                      <Wrench className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                    </div>
                  )}
                </div>
              </div>
              {isSelected && <CheckCircle className="h-4 w-4 text-primary shrink-0 ml-2" />}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                <MapPin className="w-3 h-3"/> {client.cidade || 'Cidade n/d'}
            </p>
            <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                    <DollarSign className="w-3 h-3"/> {formatCurrency(client.faturamento)}
                </p>
                <span className="text-[10px] text-muted-foreground/70">{client.codigo}</span>
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
        className={cn("w-full text-left p-3 rounded-lg border transition-all duration-200 group mb-2", isSelected ? 'bg-primary/5 border-primary/50 shadow-sm' : 'bg-card border-border hover:bg-accent hover:border-accent-foreground/20')}
      >
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-full shrink-0 transition-colors", isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:bg-background")}>
            <Users className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className={cn("font-medium text-sm truncate", isSelected ? "text-primary" : "text-foreground")}>{group.nome}</span>
              {isSelected && <CheckCircle className="h-4 w-4 text-primary shrink-0 ml-2" />}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5"><User className="w-3 h-3"/> {group.quantidade_clientes} clientes</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
                <DollarSign className="w-3 h-3"/> {formatCurrency(group.faturamento_total)}
            </p>
          </div>
        </div>
      </motion.button>
    );
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 space-y-4 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Visão 360°</h2>
          <p className="text-sm text-muted-foreground">Selecione para análise.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-1 bg-muted p-1 rounded-lg">
          <Button variant={activeTab === 'clients' ? 'default' : 'ghost'} size="sm" onClick={() => handleTabChange('clients')}><User className="mr-2 h-4 w-4" /> Clientes</Button>
          <Button variant={activeTab === 'groups' ? 'default' : 'ghost'} size="sm" onClick={() => handleTabChange('groups')}><Users className="mr-2 h-4 w-4" /> Grupos</Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="text" 
            placeholder={`Buscar ${activeTab === 'clients' ? 'cliente...' : 'grupo...'}`} 
            className="h-10 pl-10 bg-background border-input" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      <ScrollArea className="flex-1 bg-muted/5">
        <div className="p-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-3 text-primary" /> 
                <span className="text-sm font-medium">Carregando lista...</span>
            </div>
          ) : list.length > 0 ? (
            <AnimatePresence>
              <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }} className="space-y-1">
                {list.map(item => activeTab === 'clients' ? renderClientItem(item) : renderGroupItem(item))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4 space-y-3">
              <div className="bg-muted p-3 rounded-full">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Nenhum resultado encontrado</p>
                <p className="text-xs text-muted-foreground max-w-[220px] mx-auto mt-1">
                    {searchTerm.length > 0 
                        ? `Sem resultados para "${searchTerm}".` 
                        : `Nenhuma venda registrada para este período.`}
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ClientList;