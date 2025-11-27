import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getDateRange } from "@/lib/utils";
import { useFilters } from "@/contexts/FilterContext";

const PeriodSelector = () => {
  const { dateRange, setDateRange } = useFilters();
  const [isOpen, setIsOpen] = useState(false);
  const [label, setLabel] = useState("Este Mês");

  const handlePreset = (preset, labelText) => {
    const range = getDateRange(preset);
    setDateRange(range);
    setLabel(labelText);
    setIsOpen(false);
  };

  const handleCustomSelect = (range) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      setLabel(`${format(range.from, "dd/MM")} - ${format(range.to, "dd/MM")}`);
    } else if (range?.from) {
      setLabel(format(range.from, "dd/MM/yyyy"));
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[180px] justify-between bg-white border-gray-200 shadow-sm hover:bg-gray-50">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-blue-600" />
              <span className="truncate text-gray-700">{label}</span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuItem onClick={() => handlePreset('today', 'Hoje')}>
            Hoje
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePreset('this_week', 'Esta Semana')}>
            Esta Semana
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePreset('this_month', 'Este Mês')}>
            Este Mês
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePreset('last_month', 'Mês Anterior')}>
            Mês Anterior
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePreset('this_year', 'Este Ano')}>
            Este Ano
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Personalizado...
              </DropdownMenuItem>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end" side="left">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleCustomSelect}
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