import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const RankingTable = ({ data, totalRevenue }) => {
  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">Nenhum dado disponível para este período.</div>;
  }

  const maxRevenue = Math.max(...data.map(item => item.total_revenue || 0));

  return (
    <div className="w-full">
      <div className="grid grid-cols-12 gap-4 border-b py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        <div className="col-span-1">#</div>
        <div className="col-span-5">Item</div>
        <div className="col-span-2 text-right">Qtd. Vendida</div>
        <div className="col-span-3 text-right">Receita</div>
        <div className="col-span-1 text-right">Tendência</div>
      </div>
      <ScrollArea className="h-[450px]">
        <div className="flex flex-col">
          {data.map((item, index) => {
            const percentage = totalRevenue ? (item.total_revenue / totalRevenue) * 100 : 0;
            const barWidth = maxRevenue ? (item.total_revenue / maxRevenue) * 100 : 0;
            const trend = item.trend || 0;

            return (
              <div key={index} className="grid grid-cols-12 gap-4 py-4 px-4 border-b hover:bg-slate-50 transition-colors items-center group">
                <div className="col-span-1 font-medium text-slate-500">
                  {index + 1}
                </div>
                <div className="col-span-5">
                  <div className="font-semibold text-slate-900 truncate" title={item.name}>
                    {item.name}
                  </div>
                  <div className="mt-1.5 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <div className="font-bold text-slate-700">
                    {formatNumber(item.total_quantity || 0)}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase">Unidades</div>
                </div>
                <div className="col-span-3 text-right">
                  <div className="font-bold text-slate-900">
                    {formatCurrency(item.total_revenue)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {formatPercentage(percentage)} do total
                  </div>
                </div>
                <div className="col-span-1 flex justify-end">
                  {trend === 0 ? (
                    <Minus className="h-4 w-4 text-slate-300" />
                  ) : trend > 0 ? (
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

const PerformanceRanking = ({ rankings, totalRevenue }) => {
  return (
    <Card className="shadow-sm border-slate-200 bg-white h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-slate-800">Ranking de Performance</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="supervisors" className="w-full">
          <div className="px-6 pb-2">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b rounded-none space-x-6">
              {['supervisors', 'sellers', 'regions', 'groups', 'clients', 'products'].map((tab) => {
                const labels = {
                  supervisors: 'Supervisores',
                  sellers: 'Vendedores',
                  regions: 'Regiões',
                  groups: 'Grupos',
                  clients: 'Clientes',
                  products: 'Produtos'
                };
                return (
                  <TabsTrigger 
                    key={tab} 
                    value={tab}
                    className="rounded-none border-b-2 border-transparent px-0 py-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent text-muted-foreground hover:text-slate-900 transition-colors"
                  >
                    {labels[tab]}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <TabsContent value="supervisors" className="m-0">
            <RankingTable data={rankings.salesBySupervisor} totalRevenue={totalRevenue} />
          </TabsContent>
          <TabsContent value="sellers" className="m-0">
            <RankingTable data={rankings.salesBySeller} totalRevenue={totalRevenue} />
          </TabsContent>
          <TabsContent value="regions" className="m-0">
            <RankingTable data={rankings.regionalSales} totalRevenue={totalRevenue} />
          </TabsContent>
          <TabsContent value="groups" className="m-0">
            <RankingTable data={rankings.salesByCustomerGroup} totalRevenue={totalRevenue} />
          </TabsContent>
          <TabsContent value="clients" className="m-0">
            <RankingTable data={rankings.salesByClient} totalRevenue={totalRevenue} />
          </TabsContent>
          <TabsContent value="products" className="m-0">
            <RankingTable data={rankings.salesByProduct} totalRevenue={totalRevenue} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PerformanceRanking;