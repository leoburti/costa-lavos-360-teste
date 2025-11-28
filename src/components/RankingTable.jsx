import React, { useState, useMemo, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
const formatNumber = (value) => new Intl.NumberFormat('pt-BR').format(value || 0);

const RankingListItem = ({ item, index, maxRevenue }) => {
  const value = item.value || item.total_bonified || item.total_revenue || 0;
  const percentageOfMax = maxRevenue > 0 ? (value / maxRevenue) * 100 : 0;
  const trend = item.trend;
  const trendIsPositive = trend > 0;
  const trendIsNegative = trend < 0;

  let trendColor = 'text-muted-foreground';
  let trendBgColor = 'bg-gray-100 dark:bg-gray-800';
  let TrendIcon = TrendingUp;

  if (trendIsPositive) {
    trendColor = 'text-emerald-600 dark:text-emerald-400';
    trendBgColor = 'bg-emerald-100 dark:bg-emerald-900/50';
    TrendIcon = TrendingUp;
  } else if (trendIsNegative) {
    trendColor = 'text-red-600 dark:text-red-400';
    trendBgColor = 'bg-red-100 dark:bg-red-900/50';
    TrendIcon = TrendingDown;
  }

  return (
    <motion.div
      className="flex items-center py-3 px-4 border-b border-border/50 last:border-b-0 hover:bg-muted/50 transition-colors"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <div className="w-8 text-center text-sm font-medium text-muted-foreground">{index + 1}</div>
      <div className="flex-1 min-w-0 mx-4">
        <p className="font-semibold truncate text-foreground">{item.name}</p>
        <Progress value={percentageOfMax} className="h-2 mt-1" />
      </div>
      {item.quantity !== undefined && (
        <div className="w-28 text-right shrink-0">
           <p className="font-bold text-foreground">{formatNumber(item.quantity)}</p>
           <p className="text-xs text-muted-foreground">Unidades</p>
        </div>
      )}
      <div className="w-40 text-right shrink-0">
        <p className="font-bold text-foreground">{formatCurrency(value)}</p>
        {item.percentage_of_total !== undefined && (
             <p className="text-xs text-muted-foreground">{item.percentage_of_total.toFixed(2)}% do total</p>
        )}
      </div>
      {trend !== undefined && trend !== null && (
        <div className="w-24 text-right shrink-0 ml-4">
            <div className={`flex items-center justify-end text-xs font-bold ${trendColor} ${trendBgColor} px-2 py-1 rounded-md`}>
              <TrendIcon className="h-3 w-3 mr-1" />
              <span>{(Math.abs(trend) * 100).toFixed(1)}%</span>
            </div>
        </div>
      )}
    </motion.div>
  );
};


const RankingCategory = ({ data }) => {
  const processedData = useMemo(() => {
    if (!data) return [];
    
    const dataWithValues = data.map(item => ({
        ...item,
        value: item.value || item.total_bonified || item.total_revenue || 0
    }));

    const totalRevenue = dataWithValues.reduce((sum, item) => sum + item.value, 0) || 0;
    const maxRevenue = dataWithValues.length > 0 ? dataWithValues.reduce((max, item) => item.value > max ? item.value : max, 0) : 0;
    
    return {
        items: dataWithValues.map(item => ({
            ...item,
            percentage_of_total: totalRevenue > 0 ? (item.value / totalRevenue) * 100 : 0
        })),
        maxRevenue
    };
  }, [data]);

  if (!processedData.items || processedData.items.length === 0) {
    return <div className="text-center py-20 text-muted-foreground">Nenhum dado disponível para esta categoria.</div>;
  }
  
  const hasQuantity = processedData.items.some(item => item.quantity !== undefined);

  return (
    <ScrollArea className="h-[450px]">
        <div className="flex items-center py-2 px-4 bg-muted/50 font-semibold text-sm text-muted-foreground sticky top-0 z-10">
          <div className="w-8 text-center">#</div>
          <div className="flex-1 min-w-0 mx-4">Item</div>
          {hasQuantity && <div className="w-28 text-right shrink-0">Qtde. Vendida</div>}
          <div className="w-40 text-right shrink-0">Receita</div>
          <div className="w-24 text-right shrink-0 ml-4">Tendência</div>
      </div>
      <div>
        {processedData.items.map((item, index) => (
          <RankingListItem key={item.name} item={item} index={index} maxRevenue={processedData.maxRevenue} />
        ))}
      </div>
    </ScrollArea>
  );
};


const RankingTable = ({ data }) => {
  const [activeTab, setActiveTab] = useState('supervisors');

  const tabs = [
    { value: 'supervisors', label: 'Supervisores', data: data.salesBySupervisor },
    { value: 'sellers', label: 'Vendedores', data: data.salesBySeller },
    { value: 'regions', label: 'Regiões', data: data.regionalSales },
    { value: 'customerGroups', label: 'Grupos', data: data.salesByCustomerGroup },
    { value: 'clients', label: 'Clientes', data: data.salesByClient },
    { value: 'products', label: 'Produtos', data: data.salesByProduct },
  ].filter(tab => tab.data && tab.data.length > 0);

  useEffect(() => {
    // If current tab has no data, switch to the first available one
    if (tabs.length > 0 && !tabs.find(t => t.value === activeTab)) {
      setActiveTab(tabs[0].value);
    }
  }, [tabs, activeTab]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking de Performance</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 bg-transparent px-4 border-b min-w-[600px]">
              {tabs.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value} className="text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {tabs.map(tab => (
            <TabsContent key={tab.value} value={tab.value}>
              <RankingCategory data={tab.data} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RankingTable;