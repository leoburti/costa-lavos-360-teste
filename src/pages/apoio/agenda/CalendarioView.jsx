import React, { useState } from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, isWithinInterval, addMonths, subMonths, addWeeks, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CalendarDays, Calendar as CalendarIcon, CalendarRange } from 'lucide-react';
import { cn } from '@/lib/utils';

const CalendarioView = ({ events = [], currentDate, onDateChange, onEventClick, onEmptySlotClick }) => {
  const [viewMode, setViewMode] = useState('month');

  // Ensure currentDate is valid
  const safeDate = currentDate instanceof Date && !isNaN(currentDate) ? currentDate : new Date();

  const renderHeader = () => {
    switch (viewMode) {
      case 'day':
        return format(safeDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
      case 'week':
        const start = startOfWeek(safeDate, { weekStartsOn: 0 });
        const end = endOfWeek(safeDate, { weekStartsOn: 0 });
        return `${format(start, "dd/MM", { locale: ptBR })} - ${format(end, "dd/MM/yyyy", { locale: ptBR })}`;
      case 'month':
      default:
        return format(safeDate, "MMMM 'de' yyyy", { locale: ptBR });
    }
  };

  const nextPeriod = () => {
    if (!onDateChange) return;
    switch (viewMode) {
      case 'day': onDateChange(addDays(safeDate, 1)); break;
      case 'week': onDateChange(addWeeks(safeDate, 1)); break;
      case 'month': default: onDateChange(addMonths(safeDate, 1)); break;
    }
  };

  const prevPeriod = () => {
    if (!onDateChange) return;
    switch (viewMode) {
      case 'day': onDateChange(subDays(safeDate, 1)); break;
      case 'week': onDateChange(subWeeks(safeDate, 1)); break;
      case 'month': default: onDateChange(subMonths(safeDate, 1)); break;
    }
  };
  
  const getDayEvents = (date) => {
    return events.filter(event => event.data_evento && isSameDay(new Date(event.data_evento), date));
  };

  const getEventColor = (eventType) => {
    const colors = {
      reuniao: 'bg-blue-500 hover:bg-blue-600 border-blue-600',
      visita_tecnica: 'bg-green-500 hover:bg-green-600 border-green-600',
      manutencao: 'bg-orange-500 hover:bg-orange-600 border-orange-600',
      instalacao: 'bg-indigo-500 hover:bg-indigo-600 border-indigo-600',
      treinamento: 'bg-pink-500 hover:bg-pink-600 border-pink-600',
      outros: 'bg-gray-500 hover:bg-gray-600 border-gray-600'
    };
    return colors[eventType] || 'bg-primary hover:bg-primary/90 border-primary';
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const todayEvents = getDayEvents(safeDate);

    return (
      <div className="grid grid-cols-1 divide-y divide-border h-full overflow-y-auto">
        {hours.map(hour => (
          <div key={hour} className="flex min-h-[60px] relative group" onClick={() => onEmptySlotClick && onEmptySlotClick(safeDate, `${hour.toString().padStart(2, '0')}:00`)}>
            <div className="w-16 flex-shrink-0 text-xs text-muted-foreground pt-2 pr-2 text-right border-r border-border bg-muted/5">
              {`${hour.toString().padStart(2, '0')}:00`}
            </div>
            <div className="flex-1 p-1 relative group-hover:bg-muted/20 transition-colors">
              {todayEvents.filter(e => e.hora_inicio && parseInt(e.hora_inicio.split(':')[0]) === hour).map(event => (
                <div 
                    key={event.id} 
                    className={cn("mb-1 p-2 rounded text-xs text-white cursor-pointer shadow-sm border-l-4", getEventColor(event.tipo_evento))}
                    onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                >
                  <div className="font-bold">{event.titulo}</div>
                  <div>{event.hora_inicio.slice(0,5)} - {event.hora_fim.slice(0,5)}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderWeekView = () => {
    const startWeek = startOfWeek(safeDate, { weekStartsOn: 0 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startWeek, i));
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border bg-muted/10">
            <div className="p-2 border-r border-border"></div>
            {weekDays.map(day => (
            <div key={day.toISOString()} className={cn("text-center p-2 border-r border-border last:border-r-0", isSameDay(day, new Date()) && "bg-primary/5")}>
                <div className="font-semibold text-sm">{format(day, 'EEE', { locale: ptBR })}</div>
                <div className={cn("text-sm w-8 h-8 flex items-center justify-center mx-auto rounded-full", isSameDay(day, new Date()) ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
                    {format(day, 'd')}
                </div>
            </div>
            ))}
        </div>
        <div className="overflow-y-auto flex-1">
            <div className="grid grid-cols-[60px_repeat(7,1fr)] divide-x divide-border">
                <div className="divide-y divide-border">
                    {hours.map(hour => (
                        <div key={hour} className="h-20 text-xs text-muted-foreground pr-2 pt-1 text-right bg-muted/5">
                            {`${hour.toString().padStart(2, '0')}:00`}
                        </div>
                    ))}
                </div>
                {weekDays.map(day => (
                    <div key={day.toISOString()} className="divide-y divide-border relative">
                        {hours.map(hour => {
                             const slotEvents = getDayEvents(day).filter(e => e.hora_inicio && parseInt(e.hora_inicio.split(':')[0]) === hour);
                             return (
                                <div key={`${day}-${hour}`} className="h-20 p-1 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => onEmptySlotClick && onEmptySlotClick(day, `${hour.toString().padStart(2, '0')}:00`)}>
                                    {slotEvents.map(event => (
                                        <div 
                                            key={event.id} 
                                            className={cn("text-[10px] p-1 rounded text-white mb-1 truncate cursor-pointer shadow-sm", getEventColor(event.tipo_evento))}
                                            onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                                            title={event.titulo}
                                        >
                                            {event.hora_inicio.slice(0,5)} {event.titulo}
                                        </div>
                                    ))}
                                </div>
                             )
                        })}
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  };
  
  const renderMonthView = () => {
    const startMonth = startOfMonth(safeDate);
    const endMonth = endOfMonth(safeDate);
    const startDate = startOfWeek(startMonth, { weekStartsOn: 0 });
    const endDate = endOfWeek(endMonth, { weekStartsOn: 0 });

    const days = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    const today = new Date();

    return (
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-7 border-b border-border bg-muted/10">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dayName => (
            <div key={dayName} className="p-3 text-center font-semibold text-sm text-muted-foreground">{dayName}</div>
            ))}
        </div>
        <div className="grid grid-cols-7 grid-rows-5 flex-1">
            {days.map(d => {
            const dayEvents = getDayEvents(d);
            const isCurrentMonth = isSameDay(d, startMonth) || isSameDay(d, endMonth) || isWithinInterval(d, { start: startMonth, end: endMonth });
            
            return (
                <div
                key={d.toISOString()}
                className={cn(
                    "relative p-1 border-b border-r border-border cursor-pointer hover:bg-muted/10 transition-colors min-h-[100px]",
                    !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                    isSameDay(d, today) && 'bg-primary/5'
                )}
                onClick={() => onEmptySlotClick && onEmptySlotClick(d)}
                >
                <div className="flex justify-between items-start p-1">
                    <span className={cn("text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full", isSameDay(d, today) && "bg-primary text-primary-foreground")}>
                        {format(d, 'd')}
                    </span>
                </div>
                <div className="space-y-1 mt-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                    {dayEvents.slice(0, 4).map(event => (
                    <div 
                        key={event.id} 
                        className={cn("px-1.5 py-0.5 text-[10px] rounded text-white truncate shadow-sm", getEventColor(event.tipo_evento))}
                        onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                        title={`${event.hora_inicio.slice(0,5)} - ${event.titulo}`}
                    >
                        {event.hora_inicio.slice(0,5)} {event.titulo}
                    </div>
                    ))}
                    {dayEvents.length > 4 && (
                    <span className="text-[10px] text-muted-foreground pl-1 block">+ {dayEvents.length - 4} mais</span>
                    )}
                </div>
                </div>
            );
            })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <CardHeader className="border-b px-4 py-3">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevPeriod} className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
            <CardTitle className="text-lg font-semibold min-w-[200px] text-center">{renderHeader()}</CardTitle>
            <Button variant="outline" size="icon" onClick={nextPeriod} className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => onDateChange && onDateChange(new Date())}>Hoje</Button>
          </div>
          <div className="flex bg-muted p-1 rounded-lg">
            <Button variant={viewMode === 'day' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('day')} className="h-7"><CalendarDays className="mr-2 h-3 w-3" /> Dia</Button>
            <Button variant={viewMode === 'week' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('week')} className="h-7"><CalendarRange className="mr-2 h-3 w-3" /> Semana</Button>
            <Button variant={viewMode === 'month' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('month')} className="h-7"><CalendarIcon className="mr-2 h-3 w-3" /> Mês</Button>
          </div>
        </div>
      </CardHeader>
      <div className="flex-1 overflow-hidden bg-background">
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'month' && renderMonthView()}
      </div>
    </div>
  );
};

export default CalendarioView;