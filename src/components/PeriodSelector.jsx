import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useFilters } from "@/contexts/FilterContext";
import { getDateRange } from "@/lib/utils";

const PeriodSelector = () => {
  const { dateRange, setDateRange } = useFilters();
  const [customPopoverOpen, setCustomPopoverOpen] = useState(false);

  const handlePresetSelect = (preset) => {
    const newRange = getDateRange(preset);
    if (newRange) {
      setDateRange(newRange);
    }
  };
  
  const handleCustomDateSelect = (range) => {
    setDateRange(range);
    if (range?.from && range?.to) {
        setCustomPopoverOpen(false);
    }
  }

  const from = dateRange?.from;
  const to = dateRange?.to;

  let displayLabel = "Selecione o período";

  if (from && to && isValid(from) && isValid(to)) {
    if (format(from, 'yyyy-MM-dd') === format(to, 'yyyy-MM-dd')) {
      displayLabel = format(from, "dd 'de' MMM, yyyy", { locale: ptBR });
    } else {
      displayLabel = `${format(from, "dd/MM/yy", { locale: ptBR })} - ${format(to, "dd/MM/yy", { locale: ptBR })}`;
    }
  } else if (from && isValid(from)) {
     displayLabel = format(from, "dd 'de' MMM, yyyy", { locale: ptBR });
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[240px] justify-between font-normal">
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span className="truncate">{displayLabel}</span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handlePresetSelect('today')}>Hoje</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePresetSelect('this_week')}>Esta semana</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePresetSelect('this_month')}>Este mês</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePresetSelect('last_30_days')}>Últimos 30 dias</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePresetSelect('last_month')}>Mês passado</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePresetSelect('this_year')}>Este ano</DropdownMenuItem>
          <DropdownMenuSeparator />
            <Popover open={customPopoverOpen} onOpenChange={setCustomPopoverOpen}>
                <PopoverTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Personalizado...
                    </DropdownMenuItem>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={handleCustomDateSelect}
                    numberOfMonths={2}
                    locale={ptBR}
                  />
                </PopoverContent>
            </Popover>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default PeriodSelector;