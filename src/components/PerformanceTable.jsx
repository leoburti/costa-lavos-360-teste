import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';

const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'R$ 0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const TrendIndicator = ({ trend }) => {
  if (trend === null || trend === undefined || !isFinite(trend)) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <div className="flex items-center text-xs text-muted-foreground font-semibold py-1 px-2 rounded-full bg-muted">
            <Minus size={14} className="mr-1" /> Novo
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Sem dados do período anterior para comparação.</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  const isUp = trend > 0.05;
  const isDown = trend < -0.05;
  const color = isUp ? 'text-emerald-600 bg-emerald-500/10' : isDown ? 'text-red-600 bg-red-500/10' : 'text-gray-600 bg-gray-500/10';
  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const text = isUp ? 'Crescimento' : isDown ? 'Queda' : 'Estável';
  const trendPercentage = (trend * 100).toFixed(1) + '%';

  return (
    <Tooltip>
      <TooltipTrigger>
        <div className={cn("flex items-center text-xs font-semibold py-1 px-2 rounded-full", color)}>
          <Icon size={14} className="mr-1" />
          {trendPercentage}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Variação de {trendPercentage} vs. período anterior</p>
      </TooltipContent>
    </Tooltip>
  );
};

const RankingContent = ({ data, totalRevenue }) => {
  if (!data || data.length === 0) {
    return <p className="text-muted-foreground text-center py-10">Nenhum dado para exibir.</p>;
  }

  const maxRevenue = data.length > 0 ? Math.max(...data.map(item => item.total_revenue)) : 0;

  const getItemName = (item) => {
    if (typeof item.name === 'object' && item.name !== null && 'name' in item.name) {
      return item.name.name;
    }
    return item.name;
  };

  return (
    <TooltipProvider>
      <ul role="list" className="divide-y divide-border/50">
        {data.map((item, index) => {
          const percentageOfTotal = totalRevenue > 0 ? (item.total_revenue / totalRevenue) * 100 : 0;
          const barWidth = maxRevenue > 0 ? (item.total_revenue / maxRevenue) * 100 : 0;
          const itemName = getItemName(item);

          return (
            <motion.li
              key={`${itemName}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="py-4 px-3"
            >
              <div className="grid grid-cols-12 items-center gap-4">
                <div className="col-span-1 text-center">
                  <span className="text-sm font-bold text-primary">{index + 1}</span>
                </div>
                <div className="col-span-5">
                  <p className="text-sm font-semibold text-foreground truncate">{itemName}</p>
                  <div className="mt-2">
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <motion.div
                        className="bg-primary h-1.5 rounded-full"
                        style={{ width: `${barWidth}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%`}}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-span-3 text-right">
                  <p className="text-sm font-bold text-foreground">{formatCurrency(item.total_revenue)}</p>
                  <p className="text-xs text-muted-foreground">{percentageOfTotal.toFixed(2)}% do total</p>
                </div>
                <div className="col-span-3 flex justify-end">
                  <TrendIndicator trend={item.trend} />
                </div>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </TooltipProvider>
  );
};

const PerformanceTable = ({ data, totalRevenue }) => {
  const tabs = Object.keys(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tabela de Performance</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue={tabs[0]} className="w-full">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
              {tabs.map(tab => (
                <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>
              ))}
            </TabsList>
          </div>
          <ScrollArea className="h-[400px] mt-4">
            {tabs.map(tab => (
              <TabsContent key={tab} value={tab}>
                <RankingContent data={data[tab]} totalRevenue={totalRevenue} />
              </TabsContent>
            ))}
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PerformanceTable;