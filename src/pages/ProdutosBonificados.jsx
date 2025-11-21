import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Loader2, Gift, Building2, User, Store } from 'lucide-react';
import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import AIInsight from '@/components/AIInsight';
import ChartCard from '@/components/ChartCard';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useAIInsight } from '@/hooks/useAIInsight';

const formatCurrency = (value) => value != null ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A';
const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';

const DrilldownLevel = ({ items, level = 0 }) => {
  const hierarchy = [
    { icon: Building2, label: 'Supervisor' },
    { icon: User, label: 'Vendedor' },
    { icon: Store, label: 'Cliente' },
  ];

  const currentLevel = hierarchy[level];

  if (!items || items.length === 0) {
    if (level === 0) {
      return (
        <div className="text-center py-16">
          <Gift className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">Nenhuma Bonificação</h3>
          <p className="mt-1 text-muted-foreground">Não foram encontradas bonificações para os filtros selecionados.</p>
        </div>
      );
    }
    return null;
  }
  
  return (
    <Accordion type="multiple" className="w-full">
      {items.map((item, index) => (
        <AccordionItem value={`item-${level}-${index}`} key={index}>
          <AccordionTrigger className="hover:no-underline p-2 rounded-lg hover:bg-muted transition-colors">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-3 truncate">
                <currentLevel.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-semibold text-sm text-foreground text-left truncate">{item.name}</span>
              </div>
              <Badge variant="secondary" className="font-bold ml-2">{formatCurrency(item.totalBonification || item.total)}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-0 pl-6">
            {item.clients || item.sellers || item.detailedItems ? (
              <div className="border-l-2 border-dashed border-border/50 pl-4">
                 {item.sellers && <DrilldownLevel items={item.sellers} level={level + 1} />}
                 {item.clients && <DrilldownLevel items={item.clients} level={level + 1} />}
                 {item.detailedItems && (
                     <Accordion type="multiple" className="w-full">
                        {item.detailedItems.map((day, dayIndex) => (
                          <AccordionItem value={`day-${dayIndex}`} key={dayIndex}>
                            <AccordionTrigger className="hover:no-underline p-2 rounded-lg hover:bg-muted/50 text-xs">
                              {day.date} - Total: {formatCurrency(day.total)}
                            </AccordionTrigger>
                            <AccordionContent className="p-2 pl-4">
                              {day.items.map((prod, prodIndex) => (
                                <div key={prodIndex} className="flex justify-between text-xs p-1.5 bg-background rounded">
                                  <span>{prod.description}</span>
                                  <span className="font-semibold">{formatCurrency(prod.value)}</span>
                                </div>
                              ))}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                     </Accordion>
                 )}
              </div>
            ) : null}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

const ProdutosBonificados = () => {
  const { filters } = useFilters();
  const [loading, setLoading] = useState(true);
  const [bonificationData, setBonificationData] = useState(null);
  const { toast } = useToast();

  const aiData = useMemo(() => {
    if (!bonificationData || bonificationData.length === 0) return null;
    
    const totalBonified = bonificationData.reduce((acc, supervisor) => acc + supervisor.total, 0);
    
    const summary = bonificationData.slice(0, 5).map(supervisor => ({
      supervisorName: supervisor.name,
      supervisorTotal: supervisor.total,
      topSeller: supervisor.sellers?.[0]?.name,
      topSellerTotal: supervisor.sellers?.[0]?.totalBonification,
    }));

    return { totalBonified, summary };
  }, [bonificationData]);

  const { insight, loading: loadingAI, generateInsights } = useAIInsight('bonification_products', aiData);

  useEffect(() => {
    const fetchData = async () => {
      if (!filters.startDate || !filters.endDate) return;
      setLoading(true);
      const selectedClients = Array.isArray(filters.clients) ? filters.clients.map(c => c.value) : null;
      const { data, error } = await supabase.rpc('get_analytical_bonification', {
        p_start_date: filters.startDate,
        p_end_date: filters.endDate,
        p_exclude_employees: filters.excludeEmployees,
        p_supervisors: filters.supervisors,
        p_sellers: filters.sellers,
        p_customer_groups: filters.customerGroups,
        p_regions: filters.regions,
        p_clients: selectedClients,
        p_search_term: filters.searchTerm,
      });

      if (error) {
        toast({ variant: "destructive", title: "Erro na Análise de Bonificação", description: error.message });
        setBonificationData(null);
      } else {
        setBonificationData(data);
      }
      setLoading(false);
    };
    fetchData();
  }, [filters, toast]);

  useEffect(() => {
    if(aiData) {
      generateInsights();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiData]);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <Helmet>
        <title>Produtos Bonificados - Costa Lavos</title>
        <meta name="description" content="Análise detalhada de produtos bonificados por estrutura comercial." />
      </Helmet>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tighter">Produtos Bonificados</h1>
          <p className="text-muted-foreground mt-1">Análise detalhada de produtos bonificados por estrutura comercial.</p>
        </div>

        <AIInsight insight={insight} loading={loadingAI} onRegenerate={generateInsights} />

        <ChartCard title="Bonificações por Estrutura Comercial" childClassName="p-2">
          <DrilldownLevel items={bonificationData} />
        </ChartCard>
      </motion.div>
    </>
  );
};

export default ProdutosBonificados;