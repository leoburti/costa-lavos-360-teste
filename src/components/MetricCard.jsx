
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
      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
      className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all duration-300 flex flex-col min-h-[140px]"
    >
      <div className="flex items-start justify-between mb-3">
         <p className="text-sm font-medium text-slate-500">{title}</p>
         {Icon && 
          <div className="p-2 bg-slate-100 rounded-md text-slate-600">
            <Icon size={18} />
          </div>
         }
      </div>

      <p className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">{displayValue}</p>
      
      {change && (
        <div className={cn("flex items-center gap-1 text-xs font-semibold mt-1", trend.color)}>
          {trend.icon}
          <span>{change}</span>
        </div>
      )}
      
      {subtitle && (
         <p className="text-xs text-slate-400 mt-auto pt-2">{subtitle}</p>
      )}
    </motion.div>
  );
};

export default MetricCard;
