
import React, { useState, useMemo, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ShoppingBag, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageSkeleton from '@/components/PageSkeleton';

// Helper function for lazy loading components with Suspense fallback
const lazyLoadWithSuspense = (importer) => {
    const Component = React.lazy(importer);
    // eslint-disable-next-line react/display-name
    return (props) => (
        <Suspense fallback={<PageSkeleton />}>
            <Component {...props} />
        </Suspense>
    );
};

const AnaliseChurn = lazyLoadWithSuspense(() => import('@/pages/AnaliseChurn'));
const CalculoRFM = lazyLoadWithSuspense(() => import('@/pages/CalculoRFM'));
const TendenciaVendas = lazyLoadWithSuspense(() => import('@/pages/TendenciaVendas'));

const AnalisePreditivaVendas = () => {
  const [activeTab, setActiveTab] = useState("churn");

  return (
    <>
      <Helmet>
        <title>Análise Preditiva de Vendas - Costa Lavos</title>
        <meta name="description" content="Análise unificada de Churn, RFM e Tendências de Vendas." />
      </Helmet>

      <motion.div 
        className="space-y-6 p-4 sm:p-6" 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tighter flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            Análise Preditiva de Vendas
          </h1>
          <p className="text-muted-foreground mt-1">Identifique riscos de churn, segmente clientes com RFM e preveja futuras demandas.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="churn">Análise de Churn</TabsTrigger>
            <TabsTrigger value="rfm">Análise RFM</TabsTrigger>
            <TabsTrigger value="tendencias">Tendências de Vendas</TabsTrigger>
          </TabsList>
          
          {/* Suspense is now handled within lazyLoadWithSuspense, so we don't need it wrapping TabsContent here */}
            <TabsContent value="churn" className="mt-6">
              <AnaliseChurn isTab />
            </TabsContent>
            
            <TabsContent value="rfm" className="mt-6">
              <CalculoRFM isTab />
            </TabsContent>

            <TabsContent value="tendencias" className="mt-6">
              <TendenciaVendas isTab />
            </TabsContent>
        </Tabs>
      </motion.div>
    </>
  );
};

export default AnalisePreditivaVendas;
