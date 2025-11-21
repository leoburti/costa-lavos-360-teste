import React from 'react';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

const SellerRankingList = ({ data, totalRevenue }) => {
  const formatCurrency = (value) => value ? `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}` : 'R$ 0';
  
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Nenhum dado de vendedor para exibir.
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => b.total_revenue - a.total_revenue);
  const maxRevenue = sortedData[0]?.total_revenue || 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3 h-full overflow-y-auto pr-2"
    >
      {sortedData.map((item, index) => {
        const percentageOfTotal = totalRevenue ? (item.total_revenue / totalRevenue) * 100 : 0;
        const barWidth = maxRevenue > 0 ? (item.total_revenue / maxRevenue) * 100 : 0;

        return (
          <motion.div
            key={item.name}
            variants={itemVariants}
            className="bg-muted/40 p-4 rounded-lg transition-colors hover:bg-muted"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8">
                  {index < 3 ? (
                    <Crown
                      className={cn(
                        'h-5 w-5',
                        index === 0 && 'text-amber-400',
                        index === 1 && 'text-slate-400',
                        index === 2 && 'text-amber-600'
                      )}
                    />
                  ) : (
                    <span className="font-semibold text-muted-foreground text-sm">{index + 1}</span>
                  )}
                </div>
                <p className="font-semibold text-foreground text-sm truncate" title={item.name}>
                  {item.name}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-foreground text-sm">{formatCurrency(item.total_revenue)}</p>
                <p className="text-xs text-muted-foreground">{percentageOfTotal.toFixed(2)}% do total</p>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mb-2">
              <motion.div
                className="bg-primary h-1.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${barWidth}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Clientes Ativos: <span className="font-medium text-foreground">{item.client_activation}</span></span>
              <span>Ticket Médio: <span className="font-medium text-foreground">{formatCurrency(item.averageTicket)}</span></span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default SellerRankingList;