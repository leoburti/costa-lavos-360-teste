
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay, isSameMonth, isToday as isTodayFns, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, TrendingUp, Gift, Wrench, Loader2, Calendar } from 'lucide-react';

const DayCell = ({ day, data, onDaySelect, isSelected }) => {
  const dayString = format(day, 'yyyy-MM-dd');
  const dayData = data.find(d => d.date === dayString);

  const dayTotals = useMemo(() => {
    if (!dayData || !dayData.items) return { total: 0, net: 0, bonification: 0, equipment: 0 };
    return dayData.items.reduce((acc, item) => {
      acc.total += (item.totalValue || 0);
      acc.bonification += (item.bonification || 0);
      acc.equipment += (item.equipment || 0);
      return acc;
    }, { total: 0, bonification: 0, equipment: 0 });
  }, [dayData]);
  dayTotals.net = dayTotals.total - dayTotals.bonification - dayTotals.equipment;

  const hasSales = dayData && dayTotals.total > 0;
  const isToday = isTodayFns(day);

  const formatCurrency = (value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const intensityClass = useMemo(() => {
      if (!hasSales) return "bg-card hover:bg-accent/50";
      if (dayTotals.total > 50000) return "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800";
      if (dayTotals.total > 20000) return "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800";
      return "bg-card border-border hover:border-primary/50";
  }, [hasSales, dayTotals.total]);

  const cellContent = (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => dayData && onDaySelect(dayData)}
      className={cn(
        "relative w-full h-20 sm:h-24 rounded-lg flex flex-col justify-between p-2 cursor-pointer transition-colors border-2",
        intensityClass,
        isSelected ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-background border-primary" : "",
        !dayData ? "opacity-50 cursor-default" : "cursor-pointer shadow-sm hover:shadow-md"
      )}
    >
      <div className="flex justify-between items-start">
        <span className={cn("font-bold text-sm", isToday ? "text-primary bg-primary/10 px-1.5 rounded" : "text-muted-foreground")}>
          {format(day, 'd')}
        </span>
        {hasSales && (
            <div className="flex gap-0.5">
                {dayTotals.bonification > 0 && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Bonificação" />}
                {dayTotals.equipment > 0 && <div className="w-1.5 h-1.5 rounded-full bg-sky-500" title="Equipamento" />}
            </div>
        )}
      </div>
      
      <div className="text-right">
        {hasSales ? (
          <div className="flex flex-col items-end">
             <span className="text-[10px] text-muted-foreground font-medium">Total</span>
             <span className="text-xs sm:text-sm font-bold text-foreground">
                {formatCurrency(dayTotals.total)}
             </span>
          </div>
        ) : (
            <span className="text-[10px] text-muted-foreground self-end opacity-50">-</span>
        )}
      </div>
    </motion.div>
  );

  if (!dayData) return cellContent;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{cellContent}</TooltipTrigger>
        <TooltipContent side="top" className="p-3 bg-popover border-border shadow-xl min-w-[180px]">
          <div className="flex flex-col space-y-2">
            <p className="font-bold text-popover-foreground border-b border-border/50 pb-1">{format(day, "d 'de' MMMM, yyyy", { locale: ptBR })}</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-muted-foreground"><TrendingUp className="text-emerald-500" size={12} /> Líquida</span>
                <span className="font-semibold text-foreground">{formatCurrency(dayTotals.net)}</span>
              </div>
              {dayTotals.bonification > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-muted-foreground"><Gift className="text-amber-500" size={12} /> Bonif.</span>
                    <span className="font-semibold text-foreground">{formatCurrency(dayTotals.bonification)}</span>
                  </div>
              )}
              {dayTotals.equipment > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-muted-foreground"><Wrench className="text-sky-500" size={12} /> Equip.</span>
                    <span className="font-semibold text-foreground">{formatCurrency(dayTotals.equipment)}</span>
                  </div>
              )}
            </div>
            {!isSelected && <p className="text-[10px] text-primary text-center pt-1">Clique para detalhes</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const DailySalesTimeline = ({ dailyData = [], onDaySelect, selectedDay, currentMonth, onMonthChange, isLoading }) => {
  const daysInMonth = useMemo(() => {
    if (!isValid(currentMonth)) return [];
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const firstDayOfMonth = daysInMonth.length > 0 ? getDay(daysInMonth[0]) : 0;
  
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  const handleSetCurrentMonth = (newMonth) => {
    if (!isSameMonth(currentMonth, newMonth)) {
        onMonthChange(newMonth);
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm relative overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center z-20 rounded-xl">
          <div className="flex flex-col items-center gap-2">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
             <span className="text-sm font-medium text-muted-foreground">Carregando dados...</span>
          </div>
        </div>
      )}
      
      <div className="p-4 sm:p-6 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-foreground capitalize flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          {isValid(currentMonth) ? format(currentMonth, 'MMMM yyyy', { locale: ptBR }) : 'Selecione um mês'}
        </h2>
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSetCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" className="h-8 text-xs px-3 font-semibold" onClick={() => handleSetCurrentMonth(startOfMonth(new Date()))}>Hoje</Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSetCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-7 gap-2 mb-2">
            {weekdays.map(day => (
            <div key={day} className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">{day}</div>
            ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="h-20 sm:h-24 rounded-lg bg-muted/20" />
            ))}
            {daysInMonth.map(day => (
            <DayCell
                key={day.toString()}
                day={day}
                data={dailyData}
                onDaySelect={onDaySelect}
                isSelected={selectedDay && selectedDay.date === format(day, 'yyyy-MM-dd')}
            />
            ))}
        </div>
      </div>
    </div>
  );
};

export default DailySalesTimeline;
