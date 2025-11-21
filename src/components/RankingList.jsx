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
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const TrendIndicator = ({ trend }) => {
    if (trend === null || trend === undefined || !isFinite(trend)) {
        return (
            <Tooltip>
                <TooltipTrigger>
                    <div className="flex items-center text-xs font-semibold py-1 px-2 rounded-full bg-muted/50 text-muted-foreground">
                        <Minus size={14} className="mr-1" /> Novo
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Sem dados do período anterior para comparação.</p>
                </TooltipContent>
            </Tooltip>
        );
    }
  
    const isUp = trend > 0;
    const isDown = trend < 0;
    const color = isUp ? 'text-green-600 bg-green-500/10' : isDown ? 'text-red-600 bg-red-500/10' : 'text-gray-500 bg-gray-500/10';
    const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
    const trendPercentage = (trend * 100).toFixed(1) + '%';
  
    return (
        <Tooltip>
            <TooltipTrigger>
                <div className={cn("flex items-center text-xs font-semibold py-1 px-1.5 rounded-full tabular-nums", color)}>
                    <Icon size={14} className="mr-0.5" />
                    {trendPercentage}
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p>Variação vs. período anterior</p>
            </TooltipContent>
        </Tooltip>
    );
};
  
const RankingList = ({ data, totalRevenue, isLoading }) => {
    const [showAll, setShowAll] = useState(false);
    const initialDisplayCount = 10;

    const formatCurrency = (value) => {
        if (typeof value !== 'number') return 'R$ 0,00';
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    if (isLoading) {
        return (
          <div className="space-y-4 px-2 pt-2 pb-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        );
    }
      
    if (!data || data.length === 0) {
        return <p className="text-muted-foreground text-center py-10">Nenhum dado para exibir.</p>;
    }
    
    const maxRevenue = data.length > 0 ? Math.max(...data.map(item => item.total_revenue)) : 0;
    const displayedData = showAll ? data : data.slice(0, initialDisplayCount);

    const getItemName = (item) => {
      if (typeof item.name === 'object' && item.name !== null && 'name' in item.name) {
        return item.name.name;
      }
      return item.name;
    };

    return (
        <TooltipProvider>
            <div className="flow-root">
                <ScrollArea className={cn(data.length > initialDisplayCount && !showAll ? 'h-[480px]' : '')}>
                    <ul role="list" className="divide-y divide-border/50 pr-4">
                    {displayedData.map((item, index) => {
                        const barWidth = maxRevenue > 0 ? (item.total_revenue / maxRevenue) * 100 : 0;
                        const itemName = getItemName(item);

                        return (
                        <motion.li
                            key={`${itemName}-${index}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="py-3 px-2 rounded-md transition-colors hover:bg-muted/50"
                        >
                            <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0 w-8 text-center">
                                <span className="text-sm font-bold text-primary">{index + 1}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-foreground truncate">{itemName}</p>
                                <div className="mt-1">
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
                            <div className="flex-shrink-0 w-40 flex items-center justify-end space-x-3">
                                <p className="text-sm font-bold text-foreground tabular-nums">{formatCurrency(item.total_revenue)}</p>
                                <TrendIndicator trend={item.trend} />
                            </div>
                            </div>
                        </motion.li>
                        );
                    })}
                    </ul>
                </ScrollArea>
                {data.length > initialDisplayCount && !showAll && (
                    <div className="text-center mt-4">
                        <Button variant="link" onClick={() => setShowAll(true)}>
                            Mostrar todos ({data.length})
                        </Button>
                    </div>
                )}
                {showAll && (
                     <div className="text-center mt-4">
                        <Button variant="link" onClick={() => setShowAll(false)}>
                            Mostrar menos
                        </Button>
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
};
  
export default RankingList;