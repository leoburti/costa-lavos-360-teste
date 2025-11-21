import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay, isSameMonth, isToday as isTodayFns } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, TrendingUp, Gift, Wrench, Loader2 } from 'lucide-react';

const DayCell = ({ day, data, onDaySelect, isSelected }) => {
  const dayString = format(day, 'yyyy-MM-dd');
  const dayData = data.find(d => d.date === dayString);

  const dayTotals = useMemo(() => {
    if (!dayData || !dayData.items) return { total: 0, net: 0, bonification: 0, equipment: 0 };
    return dayData.items.reduce((acc, item) => {
      acc.total += item.totalValue;
      acc.bonification += item.bonification;
      acc.equipment += item.equipment;
      return acc;
    }, { total: 0, bonification: 0, equipment: 0 });
  }, [dayData]);
  dayTotals.net = dayTotals.total - dayTotals.bonification - dayTotals.equipment;

  const maxTotal = useMemo(() => {
    if (data.length === 0) return 1;
    const maxVal = Math.max(...data.map(d => d.items.reduce((sum, item) => sum + item.totalValue, 0)));
    return maxVal > 0 ? maxVal : 1;
  }, [data]);

  const opacity = dayData && dayTotals.total > 0 ? Math.max(0.2, dayTotals.total / maxTotal) : 0;

  const formatCurrency = (value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const isToday = isTodayFns(day);

  const cellContent = (
    <div
      onClick={() => dayData && onDaySelect(dayData)}
      className={cn(
        "relative w-full h-24 rounded-lg flex flex-col justify-between p-2 cursor-pointer transition-all duration-200",
        "bg-card border-2",
        isSelected ? "border-primary shadow-lg" : "border-border",
        dayData ? "hover:border-primary/50 hover:shadow-md" : "bg-muted/50 cursor-not-allowed",
      )}
    >
      <div className="flex justify-between items-center">
        <span className={cn("font-bold text-sm", isToday ? "text-primary" : "text-foreground")}>
          {format(day, 'd')}
        </span>
        {isToday && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
      </div>
      
      {dayData && dayTotals.total > 0 && (
        <div className="absolute inset-0 bg-primary/20 rounded-lg pointer-events-none" style={{ opacity }} />
      )}
      
      <div className="text-right">
        {dayData && dayTotals.total > 0 && (
          <span className="text-xs font-bold text-primary truncate block">
            {formatCurrency(dayTotals.total)}
          </span>
        )}
      </div>
    </div>
  );

  if (!dayData) {
    return cellContent;
  }

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>{cellContent}</TooltipTrigger>
        <TooltipContent className="p-3 bg-background/80 backdrop-blur-sm border-border shadow-lg">
          <div className="flex flex-col space-y-2">
            <p className="font-bold text-foreground">{format(day, "d 'de' MMMM, yyyy", { locale: ptBR })}</p>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden flex">
              <div className="bg-emerald-500 h-1.5" style={{ width: `${(dayTotals.net / dayTotals.total) * 100}%` }}></div>
              <div className="bg-amber-500 h-1.5" style={{ width: `${(dayTotals.bonification / dayTotals.total) * 100}%` }}></div>
              <div className="bg-sky-500 h-1.5" style={{ width: `${(dayTotals.equipment / dayTotals.total) * 100}%` }}></div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-muted-foreground"><TrendingUp className="text-emerald-500" size={12} /> Líquida</span>
                <span className="font-semibold">{formatCurrency(dayTotals.net)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground"><Gift className="text-amber-500" size={12} /> Bonificação</span>
                <span className="font-semibold">{formatCurrency(dayTotals.bonification)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground"><Wrench className="text-sky-500" size={12} /> Equipamento</span>
                <span className="font-semibold">{formatCurrency(dayTotals.equipment)}</span>
              </div>
            </div>
            <Button size="sm" variant="outline" className="mt-2 w-full h-8" onClick={() => onDaySelect(dayData)}>
              {isSelected ? 'Analisando...' : 'Analisar Dia'}
            </Button>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const DailySalesTimeline = ({ dailyData, onDaySelect, selectedDay, currentMonth, onMonthChange, isLoading }) => {
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const firstDayOfMonth = getDay(daysInMonth[0]);
  
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  const handleSetCurrentMonth = (newMonth) => {
    if (!isSameMonth(currentMonth, newMonth)) {
        onMonthChange(newMonth);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card/50 p-4 sm:p-6 rounded-2xl border border-border relative"
    >
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => handleSetCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => handleSetCurrentMonth(startOfMonth(new Date()))}>Hoje</Button>
          <Button variant="outline" size="icon" onClick={() => handleSetCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {weekdays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground pb-2">{day}</div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} />
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
    </motion.div>
  );
};

export default DailySalesTimeline;