
import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SupervisorRankingList = ({ data = [], isLoading }) => {
  const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  // Ensure data is an array before reduce
  const safeData = Array.isArray(data) ? data : [];
  const totalRevenueAllSupervisors = safeData.reduce((acc, item) => acc + (item.total_revenue || 0), 0);
  const maxRevenue = safeData.length > 0 ? Math.max(...safeData.map(item => item.total_revenue || 0)) : 0;
  
  if (isLoading) {
    return (
      <div className="space-y-4 pt-2 pb-4 px-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-3">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
              <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (!safeData || safeData.length === 0) {
    return <p className="text-muted-foreground text-center py-10">Nenhum supervisor para exibir com os filtros atuais.</p>;
  }

  return (
    <TooltipProvider>
      <div className="flow-root">
        <ul role="list" className="divide-y divide-border/50">
          {safeData.map((item, index) => {
            const revenue = item.total_revenue || 0;
            const percentageOfTotal = totalRevenueAllSupervisors > 0 ? (revenue / totalRevenueAllSupervisors) * 100 : 0;
            const barWidth = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
            
            const crownColor = index === 0 ? "text-amber-400" : index === 1 ? "text-slate-400" : index === 2 ? "text-amber-600" : "";

            return (
              <motion.li
                key={item.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="py-4 px-3 hover:bg-muted/50 rounded-md"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 text-center flex flex-col items-center">
                    {index < 3 ? <Crown className={cn("h-5 w-5", crownColor)} /> : <span className="text-sm font-bold text-primary">{index + 1}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate" title={item.name}>{item.name}</p>
                    <div className="mt-2">
                       <Tooltip>
                        <TooltipTrigger asChild>
                           <div className="w-full bg-muted rounded-full h-1.5 cursor-pointer">
                              <motion.div
                                className="bg-primary h-1.5 rounded-full"
                                style={{ width: `${barWidth}%` }}
                                initial={{ width: 0 }}
                                animate={{ width: `${barWidth}%`}}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                              />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>{formatCurrency(revenue)} em vendas</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-64 flex items-center justify-end space-x-6">
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{formatCurrency(revenue)}</p>
                      <p className="text-xs text-muted-foreground">{percentageOfTotal.toFixed(2)}% do total</p>
                    </div>
                     <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-foreground">{formatCurrency(item.averageTicket)}</p>
                      <p className="text-xs text-muted-foreground">Ticket Médio</p>
                    </div>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                           <Users size={16} />
                           <span className="text-sm font-semibold">{item.client_activation || 0}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                         <p>{item.client_activation || 0} clientes ativados no período</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </TooltipProvider>
  );
};

export default SupervisorRankingList;
