
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, ShoppingBasket, BarChart3 } from 'lucide-react';

// Sub-components
import DrilldownExplorer from '@/components/DrilldownExplorer';
import CestaDeProdutos from '@/components/CestaDeProdutos';

/**
 * PÁGINA: Analítico Produto
 * Análise de mix de vendas (Curva ABC implícita via volume) e Afinidade (Cesta).
 */
export default function AnaliticoProduto() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <Helmet>
        <title>Analítico de Produtos | Costa Lavos</title>
      </Helmet>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Package className="h-8 w-8 text-primary" />
          Analítico de Produtos
        </h1>
        <p className="text-slate-500">
          Análise de mix, performance por item e afinidade de compra (cesta).
        </p>
      </div>

      <Tabs defaultValue="mix" className="space-y-4">
        <TabsList className="bg-white border border-slate-200 p-1 h-auto">
            <TabsTrigger value="mix" className="gap-2 py-2 px-4">
                <BarChart3 className="h-4 w-4" />
                Mix de Produtos (Vendas)
            </TabsTrigger>
            <TabsTrigger value="affinity" className="gap-2 py-2 px-4">
                <ShoppingBasket className="h-4 w-4" />
                Análise de Afinidade (Cesta)
            </TabsTrigger>
        </TabsList>

        <TabsContent value="mix" className="focus-visible:outline-none">
            <Card className="border-slate-200 shadow-sm bg-white">
                <CardHeader className="pb-2 border-b border-slate-100">
                    <CardTitle className="text-xl text-slate-800">
                        Performance do Mix
                    </CardTitle>
                    <CardDescription>
                        Volume de vendas e detalhamento por produto.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                    <DrilldownExplorer 
                        analysisMode="product" 
                        rpcName="get_drilldown_data" // Uses default generic drilldown adapted for products
                    />
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="affinity" className="focus-visible:outline-none">
             <div className="h-[800px]">
                <CestaDeProdutos />
             </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
