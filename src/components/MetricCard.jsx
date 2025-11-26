
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from "@/lib/utils";

const MetricCard = ({ title, value, change, changeType, icon: Icon, subtitle }) => {
  const getTrendInfo = () => {
    switch (changeType) {
      case 'up':
        return { icon: <TrendingUp size={14} />, color: 'text-emerald-500' };
      case 'down':
        return { icon: <TrendingDown size={14} />, color: 'text-red-500' };
      default:
        return { icon: <Minus size={14} />, color: 'text-muted-foreground' };
    }
  };

  const trend = getTrendInfo();
  
  const displayValue = value === null || value === undefined ? 'N/A' : value;
  const isZeroOrNA = displayValue === 'N/A' || (typeof displayValue === 'string' && parseFloat(displayValue.replace(/[^0-9,-]/g, '').replace(',', '.')) === 0) || (typeof displayValue === 'number' && displayValue === 0);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: "0 10px 20px -5px rgba(0,0,0,0.07)" }}
      className="bg-card p-5 rounded-xl border border-border transition-all duration-300 flex flex-col"
    >
      <div className="flex items-start justify-between mb-2">
         <p className="text-sm font-medium text-muted-foreground">{title}</p>
         {Icon && 
          <div className="p-2 bg-muted rounded-md">
            <Icon className="text-primary" size={20} />
          </div>
         }
      </div>

      <p className="text-xl lg:text-2xl font-bold text-foreground mb-1 tracking-tight">{displayValue}</p>
      
      {change && (
        <div className={cn("flex items-center gap-1 text-xs font-semibold", trend.color)}>
          {trend.icon}
          <span>{change}</span>
        </div>
      )}
      {subtitle && (
         <p className="text-xs text-muted-foreground mt-auto pt-2 truncate">{subtitle}</p>
      )}
      {isZeroOrNA && !subtitle && (
        <p className="text-xs text-muted-foreground mt-auto pt-2">Nenhum dado no período.</p>
      )}
    </motion.div>
  );
};

export default MetricCard;
