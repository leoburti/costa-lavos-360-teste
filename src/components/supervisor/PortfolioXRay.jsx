import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Users, ShoppingBag, Map, Wrench } from 'lucide-react';

const XRayList = ({ data, type, maxVal }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
        <p className="text-sm">Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pr-3 pt-1">
      {data.map((item, index) => {
        const val = (type === 'product' || type === 'equipment') ? item.quantity : item.value;
        const percentage = maxVal > 0 ? (val / maxVal) * 100 : 0;
        
        return (
          <div key={index} className="group relative">
            <div className="flex justify-between items-center mb-1.5 text-sm relative z-10">
              <div className="flex items-center gap-3 max-w-[75%]">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  {index + 1}
                </span>
                <div className="flex flex-col">
                  <span className="truncate font-semibold text-slate-700 group-hover:text-slate-900 transition-colors" title={item.name}>
                    {item.name || 'Não Identificado'}
                  </span>
                  {item.active_clients && (
                    <span className="text-[10px] text-slate-400">{item.active_clients} clientes ativos</span>
                  )}
                </div>
              </div>
              <span className="font-bold text-slate-900 text-right">
                {(type === 'product' || type === 'equipment') ? formatNumber(val) : formatCurrency(val)}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  type === 'product' ? 'bg-amber-500' : 
                  type === 'region' ? 'bg-emerald-500' : 
                  type === 'equipment' ? 'bg-violet-500' : 'bg-blue-600'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const PortfolioXRay = ({ data, loading }) => {
  const [activeTab, setActiveTab] = useState('clients');

  if (loading) {
    return <Skeleton className="h-[450px] w-full rounded-xl" />;
  }

  const maxClient = Math.max(...(data?.topClients?.map(c => c.value) || [0]), 1);
  const maxProduct = Math.max(...(data?.topProducts?.map(p => p.quantity) || [0]), 1);
  const maxEquipment = Math.max(...(data?.equipmentStats?.map(e => e.quantity) || [0]), 1);
  const maxRegion = Math.max(...(data?.regionalStats?.map(r => r.value) || [0]), 1);

  return (
    <Card className="border-0 shadow-sm ring-1 ring-slate-200 bg-white h-full flex flex-col">
      <CardHeader className="pb-0 px-6 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold text-slate-900">Raio-X da Carteira</CardTitle>
            <CardDescription>Análise detalhada dos top players</CardDescription>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-100/50 p-1 h-auto rounded-lg">
            <TabsTrigger value="clients" className="text-xs py-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">
              <Users size={14} className="mr-2 hidden sm:block" /> Clientes
            </TabsTrigger>
            <TabsTrigger value="products" className="text-xs py-2 data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-sm">
              <ShoppingBag size={14} className="mr-2 hidden sm:block" /> Produtos
            </TabsTrigger>
            <TabsTrigger value="equipment" className="text-xs py-2 data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm">
              <Wrench size={14} className="mr-2 hidden sm:block" /> Equip.
            </TabsTrigger>
            <TabsTrigger value="regions" className="text-xs py-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm">
              <Map size={14} className="mr-2 hidden sm:block" /> Regiões
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 h-[320px]">
            <TabsContent value="clients" className="h-full mt-0 animate-in fade-in duration-300">
              <ScrollArea className="h-full pr-2">
                <XRayList data={data?.topClients} type="client" maxVal={maxClient} />
              </ScrollArea>
            </TabsContent>
            <TabsContent value="products" className="h-full mt-0 animate-in fade-in duration-300">
              <ScrollArea className="h-full pr-2">
                <XRayList data={data?.topProducts} type="product" maxVal={maxProduct} />
              </ScrollArea>
            </TabsContent>
            <TabsContent value="equipment" className="h-full mt-0 animate-in fade-in duration-300">
              <ScrollArea className="h-full pr-2">
                <XRayList data={data?.equipmentStats} type="equipment" maxVal={maxEquipment} />
              </ScrollArea>
            </TabsContent>
            <TabsContent value="regions" className="h-full mt-0 animate-in fade-in duration-300">
              <ScrollArea className="h-full pr-2">
                <XRayList data={data?.regionalStats} type="region" maxVal={maxRegion} />
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </CardHeader>
      <CardContent />
    </Card>
  );
};

export default PortfolioXRay;