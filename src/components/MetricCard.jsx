import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from "@/lib/utils";
import { extractValue } from '@/utils/dataValidator';

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
  
  // Extract value to ensure no objects are passed to render
  const rawValue = extractValue(value);
  const displayValue = rawValue === null || rawValue === undefined ? 'N/A' : rawValue;
  const safeChange = extractValue(change);
  const safeSubtitle = extractValue(subtitle);
  const safeTitle = extractValue(title);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
      className="bg-card p-6 rounded-xl border border-border shadow-sm transition-all duration-300 flex flex-col min-h-[140px]"
    >
      <div className="flex items-start justify-between mb-3">
         <p className="text-sm font-medium text-muted-foreground">{safeTitle}</p>
         {Icon && 
          <div className="p-2 bg-muted rounded-md text-muted-foreground">
            <Icon size={18} />
          </div>
         }
      </div>

      <div className="text-2xl font-bold text-foreground mb-1 tracking-tight truncate" title={String(displayValue)}>{displayValue}</div>
      
      {safeChange && (
        <div className={cn("flex items-center gap-1 text-xs font-semibold mt-1", trend.color)}>
          {trend.icon}
          <span>{safeChange}</span>
        </div>
      )}
      
      {safeSubtitle && (
         <p className="text-xs text-slate-400 mt-auto pt-2">{safeSubtitle}</p>
      )}
    </motion.div>
  );
};

export default MetricCard;