import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const KPIStatCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue", prefix = "", suffix = "" }) => {
  
  const getColorClasses = (c) => {
    const map = {
      blue: "bg-blue-50 text-blue-600 border-blue-100",
      green: "bg-emerald-50 text-emerald-600 border-emerald-100",
      purple: "bg-purple-50 text-purple-600 border-purple-100",
      orange: "bg-orange-50 text-orange-600 border-orange-100",
      red: "bg-red-50 text-red-600 border-red-100",
      indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    };
    return map[c] || map.blue;
  };

  const colorClass = getColorClasses(color);

  return (
    <Card className="border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              <span className="text-lg text-slate-400 font-normal mr-0.5">{prefix}</span>
              {value}
              <span className="text-sm text-slate-400 font-normal ml-0.5">{suffix}</span>
            </h3>
          </div>
          <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110", colorClass)}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        
        {(trend || trendValue) && (
          <div className="flex items-center mt-3 gap-2">
            <div className={cn(
              "flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold",
              trend === 'up' ? "bg-emerald-100 text-emerald-700" : 
              trend === 'down' ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"
            )}>
              {trend === 'up' && <ArrowUpRight className="w-3 h-3 mr-1" />}
              {trend === 'down' && <ArrowDownRight className="w-3 h-3 mr-1" />}
              {trend === 'neutral' && <Minus className="w-3 h-3 mr-1" />}
              {trendValue}
            </div>
            <span className="text-xs text-slate-400">vs. mês anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KPIStatCard;