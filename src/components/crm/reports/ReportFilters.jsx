
import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { CalendarPlus as CalendarIcon, FilterX } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn, formatDate } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ReportFilters = ({ 
    period, 
    setPeriod, 
    dateRange, 
    setDateRange, 
    users, 
    selectedSeller, 
    setSelectedSeller, 
    onClear 
}) => {
    return (
        <div className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-lg border shadow-sm mb-6">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Period Selector */}
                <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Período</label>
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="this_month">Este Mês</SelectItem>
                            <SelectItem value="last_month">Mês Passado</SelectItem>
                            <SelectItem value="this_quarter">Este Trimestre</SelectItem>
                            <SelectItem value="this_year">Este Ano</SelectItem>
                            <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Custom Date Range (Conditional) */}
                {period === 'custom' && (
                    <div className="flex flex-col space-y-1.5 md:col-span-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Intervalo</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !dateRange && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(dateRange.from, "dd/MM/y", { locale: ptBR })} -{" "}
                                                {format(dateRange.to, "dd/MM/y", { locale: ptBR })}
                                            </>
                                        ) : (
                                            format(dateRange.from, "dd/MM/y", { locale: ptBR })
                                        )
                                    ) : (
                                        <span>Selecione datas</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                    locale={ptBR}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                )}

                {/* Seller Filter */}
                <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Vendedor</label>
                    <Select value={selectedSeller} onValueChange={setSelectedSeller}>
                        <SelectTrigger>
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                    {user.full_name || user.email || 'Usuário'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex items-end">
                <Button variant="ghost" size="icon" onClick={onClear} title="Limpar Filtros">
                    <FilterX className="h-4 w-4 text-muted-foreground" />
                </Button>
            </div>
        </div>
    );
};

export default ReportFilters;
