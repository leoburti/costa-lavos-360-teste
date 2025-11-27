
import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const KPICard = ({ 
  title, 
  value, 
  subValue, 
  icon: Icon, 
  trend, 
  trendValue, 
  trendLabel = "vs. período anterior",
  color = "blue", 
  className 
}) => {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
    violet: "bg-violet-50 text-violet-600 ring-violet-100",
    rose: "bg-rose-50 text-rose-600 ring-rose-100",
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    slate: "bg-slate-50 text-slate-600 ring-slate-100",
    cyan: "bg-cyan-50 text-cyan-600 ring-cyan-100",
  };

  const trendColor = trend === 'up' 
    ? 'text-emerald-700 bg-emerald-50 border-emerald-100' 
    : trend === 'down' 
      ? 'text-rose-700 bg-rose-50 border-rose-100' 
      : 'text-slate-600 bg-slate-50 border-slate-100';
      
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;

  return (
    <Card className={cn("relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 group bg-white h-full ring-1 ring-slate-200", className)}>
      <CardContent className="p-5 flex flex-col justify-between h-full">
        
        {/* Header: Title & Icon */}
        <div className="flex justify-between items-start mb-3">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-tight">
            {title}
          </p>
          <div className={cn("p-2.5 rounded-xl ring-1 transition-all duration-300 group-hover:scale-110", colorStyles[color])}>
            {Icon && <Icon size={18} strokeWidth={2.5} />}
          </div>
        </div>
        
        {/* Main Value */}
        <div>
          <h3 className="text-2xl xl:text-3xl font-black text-slate-900 tracking-tight leading-none mb-1 truncate" title={value}>
            {value}
          </h3>
          {subValue && (
            <p className="text-xs font-medium text-slate-500 mt-1">
              {subValue}
            </p>
          )}
        </div>

        {/* Footer: Trend */}
        {(trendValue !== undefined && trendValue !== null) && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
            <div className={cn("flex items-center text-[11px] font-extrabold px-1.5 py-0.5 rounded border", trendColor)}>
              <TrendIcon size={12} className="mr-1" strokeWidth={3} />
              {trendValue}
            </div>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide truncate max-w-[80px]" title={trendLabel}>
              {trendLabel}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KPICard;
