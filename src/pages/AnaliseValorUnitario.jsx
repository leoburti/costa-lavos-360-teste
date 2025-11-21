import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Loader2, DollarSign, TrendingUp, TrendingDown, Info, Maximize2, Minimize2, User, Building2, Store } from 'lucide-react';
import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import AIInsight from '@/components/AIInsight';
import MetricCard from '@/components/MetricCard';
import ChartCard from '@/components/ChartCard';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useAIInsight } from '@/hooks/useAIInsight';

const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const PriceVariationDetails = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-muted-foreground p-4">Nenhum dado de variação de preço para exibir.</p>;
  }

  return (
    <Accordion type="multiple" className="w-full">
      {data.map((supervisor, supIndex) => (
        <AccordionItem value={`supervisor-${supIndex}`} key={supIndex}>
          <AccordionTrigger className="hover:no-underline p-3 rounded-lg hover:bg-muted transition-colors">
            <div className="flex justify-between items-center w-full">
               <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-semibold text-foreground">{supervisor.name}</span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-2 pl-8 border-l-2 ml-4">
            <Accordion type="multiple" collapsible>
              {supervisor.sellers.map((seller, selIndex) => (
                <AccordionItem value={`seller-${selIndex}`} key={selIndex}>
                  <AccordionTrigger className="hover:no-underline p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-sm text-foreground">{seller.name}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-2 pl-8 border-l-2 ml-4">
                    <Accordion type="multiple" collapsible>
                      {seller.clients.map((client, cliIndex) => (
                        <AccordionItem value={`client-${cliIndex}`} key={cliIndex}>
                          <AccordionTrigger className="hover:no-underline p-2 rounded-lg hover:bg-muted/40 transition-colors">
                            <div className="flex items-center gap-3">
                              <Store className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="font-normal text-sm text-foreground">{client.name}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="p-2 pl-6">
                            <div className="space-y-2">
                              {client.products.map((product, prodIndex) => (
                                <div key={prodIndex} className="p-2 bg-background rounded-md border">
                                  <p className="font-semibold text-xs">{product.product}</p>
                                  <div className="grid grid-cols-3 gap-2 text-center text-xs mt-1">
                                    <Badge variant="outline">Min: {formatCurrency(product.minPrice)}</Badge>
                                    <Badge variant="secondary">Méd: {formatCurrency(product.avgPrice)}</Badge>
                                    <Badge variant="destructive">Max: {formatCurrency(product.maxPrice)}</Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

const AnaliseValorUnitario = () => {
  const { filters } = useFilters();
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const { toast } = useToast();

  const aiContextData = useMemo(() => {
    if (!analysisData) return null;
    return {
      kpis: analysisData.kpis,
      top_variations: analysisData.priceVariation?.slice(0, 5),
    };
  }, [analysisData]);

  const { insight, loading: loadingAI, generateInsights } = useAIInsight('unit_value_analysis', aiContextData);

  useEffect(() => {
    const fetchData = async () => {
      if (!filters.startDate || !filters.endDate) return;
      setLoading(true);
      const selectedClients = Array.isArray(filters.clients) ? filters.clients.map(c => c.value) : null;
      const { data, error } = await supabase.rpc('get_price_analysis', {
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
        toast({ variant: "destructive", title: "Erro na Análise de Preço", description: error.message });
        setAnalysisData(null);
      } else {
        setAnalysisData(data);
      }
      setLoading(false);
    };
    fetchData();
  }, [filters, toast]);

  useEffect(() => {
    if(aiContextData) {
      generateInsights();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiContextData]);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  const kpis = analysisData?.kpis || {};
  const priceVariation = analysisData?.priceVariation || [];
  const productsToShow = showAllProducts ? priceVariation : priceVariation.slice(0, 10);

  return (
    <>
      <Helmet>
        <title>Análise de Valor Unitário - Costa Lavos</title>
        <meta name="description" content="Análise detalhada sobre o valor unitário de venda dos produtos." />
      </Helmet>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tighter">Análise de Valor Unitário</h1>
          <p className="text-muted-foreground mt-1">Identifique variações de preços e oportunidades de otimização.</p>
        </div>

        <AIInsight insight={insight} loading={loadingAI} onRegenerate={generateInsights} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Preço Unitário Médio" value={formatCurrency(kpis.averageUnitPrice)} icon={DollarSign} />
          <MetricCard title="Maior Variação" value={`${(kpis.highestVariationPercent || 0).toFixed(1)}%`} icon={TrendingUp} subtitle={kpis.productWithHighestVariation || 'N/A'} />
          <MetricCard title="Maior Desconto (Cliente)" value={formatCurrency(kpis.highestDiscountValue)} icon={TrendingDown} subtitle={kpis.clientWithHighestDiscount || 'N/A'} />
          <MetricCard title="Produtos Analisados" value={String(kpis.totalProductsAnalyzed || 0)} icon={Info} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title={showAllProducts ? "Todos os Produtos com Variação de Preço" : "Top 10 Produtos com Maior Variação de Preço"}>
            <ScrollArea className="h-[400px]">
              <div className="p-4 space-y-3">
                {productsToShow.map((item, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-sm truncate pr-4">{item.product}</p>
                      <Badge variant="destructive" className="text-sm">{(item.variationpercent || 0).toFixed(1)}%</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2">
                      <div className="p-1.5 bg-background rounded">
                        <p className="font-bold">{formatCurrency(item.minprice)}</p>
                        <p className="text-muted-foreground">Mínimo</p>
                      </div>
                      <div className="p-1.5 bg-background rounded">
                        <p className="font-bold">{formatCurrency(item.avgprice)}</p>
                        <p className="text-muted-foreground">Médio</p>
                      </div>
                      <div className="p-1.5 bg-background rounded">
                        <p className="font-bold">{formatCurrency(item.maxprice)}</p>
                        <p className="text-muted-foreground">Máximo</p>
                      </div>
                    </div>
                  </div>
                ))}
                 {productsToShow.length === 0 && <p className="text-center text-muted-foreground p-8">Nenhuma variação de preço encontrada.</p>}
              </div>
            </ScrollArea>
            {priceVariation.length > 10 && (
              <div className="p-4 border-t">
                <Button onClick={() => setShowAllProducts(!showAllProducts)} variant="outline" className="w-full">
                  {showAllProducts ? <Minimize2 className="mr-2 h-4 w-4" /> : <Maximize2 className="mr-2 h-4 w-4" />}
                  {showAllProducts ? "Mostrar Top 10" : `Mostrar Todos (${priceVariation.length})`}
                </Button>
              </div>
            )}
          </ChartCard>
          <ChartCard title="Variação por Entidade" childClassName="p-2">
            <ScrollArea className="h-[400px]">
              <PriceVariationDetails data={analysisData?.priceVariationByEntity} />
            </ScrollArea>
          </ChartCard>
        </div>
      </motion.div>
    </>
  );
};

export default AnaliseValorUnitario;