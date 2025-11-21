import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Package, Loader2, ShoppingCart, Hourglass } from 'lucide-react';
import ChartCard from '@/components/ChartCard';
import AIInsight from '@/components/AIInsight';
import TreeMapChart from '@/components/TreeMapChart';
import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useAIInsight } from '@/hooks/useAIInsight';

const formatCurrency = (value) => {
  if (typeof value !== 'number') return value;
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const ProductBasketCard = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 min-h-[400px]">
        <Hourglass size={48} className="text-primary animate-spin mb-4" />
        <p className="text-lg font-semibold text-foreground">Análise em Andamento</p>
        <p className="text-muted-foreground mt-2">Calculando as correlações de produtos. Isso pode levar alguns minutos.</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 min-h-[400px]">
        <ShoppingCart size={48} className="text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Nenhuma correlação de produto encontrada para os filtros selecionados.</p>
      </div>
    );
  }

  const getLiftColor = (lift) => {
    if (lift > 1.5) return "bg-emerald-500/20 text-emerald-700 border-emerald-500/30";
    if (lift > 1.2) return "bg-sky-500/20 text-sky-700 border-sky-500/30";
    return "bg-amber-500/20 text-amber-700 border-amber-500/30";
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      {data.map((item, index) => (
        <AccordionItem value={`item-${index}`} key={index}>
          <AccordionTrigger className="hover:no-underline p-4 rounded-lg hover:bg-muted transition-colors">
            <div className="flex justify-between items-center w-full">
              <span className="font-semibold text-foreground text-left">{item.main_product}</span>
              <div className="flex items-center gap-4">
                <span className="text-sm font-normal text-muted-foreground">Preço Médio: {formatCurrency(item.avg_price)}</span>
                <span className="text-sm font-bold text-primary">{formatCurrency(item.total_revenue)}</span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-0">
            {item.correlations && item.correlations.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-2">Comprado junto com:</p>
                {item.correlations.map((corr, corrIndex) => (
                  <motion.div 
                    key={corrIndex}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: corrIndex * 0.1 }}
                    className="flex justify-between items-center p-3 bg-muted/60 rounded-md"
                  >
                    <span className="text-sm text-foreground">{corr.associated_product}</span>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        Confiança: {(corr.confidence * 100).toFixed(1)}%
                      </Badge>
                       <Badge variant="outline" className={getLiftColor(corr.lift)}>
                        Força: {corr.lift.toFixed(2)}x
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-center text-muted-foreground py-4">Nenhuma correlação significativa encontrada para este produto.</p>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};


const AnaliticoProduto = () => {
  const { filters } = useFilters();
  const [loading, setLoading] = useState(true);
  const [treemapData, setTreemapData] = useState([]);
  const [basketData, setBasketData] = useState([]);
  const { toast } = useToast();

  const aiContextData = useMemo(() => {
    if (!treemapData || !basketData) return null;
    return {
      topProducts: treemapData.slice(0, 10).map(p => ({ name: p.name, size: p.size })),
      productCorrelations: basketData.slice(0, 5).map(p => ({
        product: p.main_product,
        correlations: p.correlations?.slice(0, 2)
      }))
    };
  }, [treemapData, basketData]);

  const { insight, loading: loadingAI, retry: retryAI } = useAIInsight('product_mix_analysis', aiContextData, filters);

  const fetchAllData = useCallback(async () => {
    // Use formatted strings from FilterContext
    if (!filters.startDate || !filters.endDate) return;
    setLoading(true);
    
    const selectedClients = Array.isArray(filters.clients) ? filters.clients.map(c => c.value) : null;
    const commonPayload = {
        p_start_date: filters.startDate,
        p_end_date: filters.endDate,
        p_exclude_employees: filters.excludeEmployees,
        p_supervisors: filters.supervisors,
        p_sellers: filters.sellers,
        p_customer_groups: filters.customerGroups,
        p_regions: filters.regions,
        p_clients: selectedClients,
        p_search_term: filters.searchTerm,
    };

    try {
      const [treemapResult, basketResult] = await Promise.all([
        supabase.rpc('get_treemap_data', { ...commonPayload, p_analysis_mode: 'product', p_show_defined_groups_only: false }),
        supabase.rpc('get_product_basket_analysis_v2', { ...commonPayload })
      ]);
      
      if (treemapResult.error) throw new Error(`Treemap Error: ${treemapResult.error.message}`);
      setTreemapData(treemapResult.data);

      if (basketResult.error) throw new Error(`Basket Analysis Error: ${basketResult.error.message}`);
      setBasketData(basketResult.data);

    } catch (error) {
      console.error("Error fetching product data:", error);
      toast({
        variant: "destructive",
        title: "Erro na Análise de Produtos",
        description: error.message,
      });
      setTreemapData([]);
      setBasketData([]);
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);
    
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return (
    <>
      <Helmet>
        <title>Analítico Produto - Costa Lavos</title>
        <meta name="description" content="Análise detalhada da performance por produto e correlações de vendas." />
      </Helmet>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tighter">Analítico de Mix de Produto</h1>
          <p className="text-muted-foreground mt-1">Performance por produto e análise de cesta de compras.</p>
        </div>
        
        {loading ? (
            <div className="flex items-center justify-center p-8 bg-card rounded-lg border">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Carregando análises...</p>
            </div>
        ) : (
            <div className="flex flex-col gap-8">
                <AIInsight insight={insight} loading={loadingAI} onRegenerate={retryAI} />
                
                <ChartCard title="Mix de Produtos por Vendas">
                    {treemapData && treemapData.length > 0 ? (
                        <TreeMapChart data={treemapData} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                            <Package size={48} className="text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">Nenhum dado de produto para exibir.</p>
                        </div>
                    )}
                </ChartCard>

                <ChartCard title="Cesta de Produtos" childClassName="p-2 max-h-[600px] overflow-y-auto">
                    <ProductBasketCard data={basketData} loading={loading} />
                </ChartCard>
            </div>
        )}
      </div>
    </>
  );
};

export default AnaliticoProduto;