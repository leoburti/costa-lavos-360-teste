
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay, isToday as isTodayFns, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn, formatCurrency } from '@/lib/utils';
import { ChevronLeft, ChevronRight, TrendingUp, Gift, Wrench, Loader2, Calendar } from 'lucide-react';

const DayCell = ({ day, dayData, onDaySelect, isSelected }) => {
  const hasSales = dayData && dayData.gross > 0;
  const isToday = isTodayFns(day);

  const intensityClass = useMemo(() => {
      if (!hasSales) return "bg-white hover:bg-slate-50 border-slate-100";
      const gross = dayData.gross || 0;
      if (gross > 50000) return "bg-emerald-50 border-emerald-200 hover:bg-emerald-100";
      if (gross > 20000) return "bg-blue-50 border-blue-200 hover:bg-blue-100";
      return "bg-white border-blue-100 hover:bg-blue-50";
  }, [hasSales, dayData]);

  const cellContent = (
    <motion.div
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onDaySelect({ date: format(day, 'yyyy-MM-dd'), ...dayData })}
      className={cn(
        "relative w-full h-24 rounded-xl flex flex-col justify-between p-3 cursor-pointer transition-all border shadow-sm overflow-hidden",
        intensityClass,
        isSelected ? "ring-2 ring-primary ring-offset-2 border-primary z-10" : "",
        !dayData && !isToday ? "opacity-40" : ""
      )}
    >
      <div className="flex justify-between items-start">
        <span className={cn(
            "font-bold text-sm flex items-center justify-center h-6 w-6 rounded-full transition-colors", 
            isToday ? "bg-primary text-white shadow-sm" : "text-slate-500 group-hover:text-slate-700"
        )}>
          {format(day, 'd')}
        </span>
        {hasSales && (
            <div className="flex gap-1">
                {dayData.bonification > 0 && <div className="w-2 h-2 rounded-full bg-purple-500 shadow-sm" title="Tem Bonificação" />}
                {dayData.equipment > 0 && <div className="w-2 h-2 rounded-full bg-orange-500 shadow-sm" title="Tem Equipamento" />}
            </div>
        )}
      </div>
      
      <div className="text-right mt-auto">
        {hasSales ? (
          <div className="flex flex-col items-end">
             {dayData.bonification > 0 && (
                 <span className="text-[10px] text-purple-600 font-medium leading-none mb-1 bg-purple-50 px-1 rounded">
                    + {formatCurrency(dayData.bonification)}
                 </span>
             )}
             <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                {formatCurrency(dayData.gross)}
             </span>
          </div>
        ) : (
            <span className="text-[10px] text-slate-300 self-end font-medium">-</span>
        )}
      </div>
    </motion.div>
  );

  if (!hasSales && !isSelected) return cellContent;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{cellContent}</TooltipTrigger>
        <TooltipContent side="top" className="p-3 bg-slate-900 text-white border-slate-800 shadow-xl min-w-[180px]">
          <div className="flex flex-col space-y-2">
            <p className="font-bold border-b border-slate-700 pb-1 text-xs uppercase tracking-wider text-slate-400">
              {format(day, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-300"><TrendingUp className="text-emerald-400" size={12} /> Líquida</span>
                <span className="font-mono">{dayData ? formatCurrency(dayData.net) : 'R$ 0,00'}</span>
              </div>
              {dayData?.bonification > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-300"><Gift className="text-purple-400" size={12} /> Bonif.</span>
                    <span className="font-mono text-purple-300">{formatCurrency(dayData.bonification)}</span>
                  </div>
              )}
              {dayData?.equipment > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-300"><Wrench className="text-orange-400" size={12} /> Equip.</span>
                    <span className="font-mono text-orange-300">{formatCurrency(dayData.equipment)}</span>
                  </div>
              )}
            </div>
            {!isSelected && <p className="text-[10px] text-slate-500 text-center pt-1">Clique para ver detalhes</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const DailySalesTimeline = ({ dailyData = [], onDaySelect, selectedDate, currentMonth, onMonthChange, isLoading }) => {
  const daysInMonth = useMemo(() => {
    if (!isValid(currentMonth)) return [];
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const firstDayOfMonth = daysInMonth.length > 0 ? getDay(daysInMonth[0]) : 0;
  const weekdays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  
  const dataMap = useMemo(() => {
      const map = {};
      if (Array.isArray(dailyData)) {
          dailyData.forEach(d => {
              map[d.date] = d;
          });
      }
      return map;
  }, [dailyData]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center z-20 rounded-xl">
          <div className="flex flex-col items-center gap-2 animate-in fade-in duration-300">
             <div className="p-3 bg-white rounded-full shadow-lg border border-slate-100">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
             </div>
             <span className="text-sm font-medium text-slate-600 bg-white/90 px-3 py-1 rounded-md shadow-sm">Atualizando dados...</span>
          </div>
        </div>
      )}
      
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-800 capitalize flex items-center gap-2">
          <Calendar className="h-5 w-5 text-slate-500" />
          {isValid(currentMonth) ? format(currentMonth, 'MMMM yyyy', { locale: ptBR }) : '...'}
        </h2>
        <div className="flex items-center gap-1 bg-white border shadow-sm p-1 rounded-lg">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-600" onClick={() => onMonthChange(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" className="h-7 text-xs px-3 font-semibold text-slate-700" onClick={() => onMonthChange(startOfMonth(new Date()))}>Hoje</Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-600" onClick={() => onMonthChange(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-7 gap-2 mb-2">
            {weekdays.map(day => (
            <div key={day} className="text-center text-xs font-bold text-slate-400 tracking-wider py-2">{day}</div>
            ))}
        </div>
        <div className="grid grid-cols-7 gap-2 lg:gap-3">
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="h-24 rounded-xl bg-slate-50/50 border border-transparent opacity-20" />
            ))}
            {daysInMonth.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                return (
                    <DayCell
                        key={dateStr}
                        day={day}
                        dayData={dataMap[dateStr]}
                        onDaySelect={onDaySelect}
                        isSelected={selectedDate === dateStr}
                    />
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default DailySalesTimeline;
