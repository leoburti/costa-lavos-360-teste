
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Trash2, Plus, Scale, ArrowRight, Box } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const PERIOD_OPTIONS = [
    { value: 'dia', label: 'Dia', multiplier: 30 },
    { value: 'semana', label: 'Semana', multiplier: 4 },
    { value: 'mes', label: 'Mês', multiplier: 1 }
];

const MonthlyProjection = ({ qty, period }) => {
    if (!qty || isNaN(qty)) return null;
    
    const option = PERIOD_OPTIONS.find(o => o.value === period);
    if (!option) return null;

    const monthly = (parseFloat(qty) * option.multiplier).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
    
    return (
        <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1 bg-slate-50 px-1.5 py-0.5 rounded w-fit">
            <ArrowRight className="h-2 w-2" />
            <span>~{monthly} Kg/mês</span>
        </div>
    );
};

export const QuantitySelector = ({ 
    options = [], 
    selectedItems = [], 
    onChange, 
    title = "Itens", 
    placeholder = "Buscar item...",
    mode = "weight" // 'weight' (Kg/Period) or 'unit' (Simple Integer Quantity)
}) => {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleAdd = (item) => {
        const exists = selectedItems.find(i => i.name === item);
        if (exists) return;
        
        const newItem = { 
            name: item, 
            quantity: 1, 
            // Only add period/unit if mode is weight
            period: mode === 'weight' ? 'dia' : null, 
            unit: mode === 'weight' ? 'kg' : 'un' 
        };
        onChange([...selectedItems, newItem]);
        setSearch('');
        setIsOpen(false);
    };

    const handleRemove = (name) => {
        onChange(selectedItems.filter(i => i.name !== name));
    };

    const updateItem = (name, field, value) => {
        onChange(selectedItems.map(i => {
            if (i.name === name) {
                let updates = { [field]: value };
                
                // Validate quantity based on mode
                if (field === 'quantity') {
                    const num = parseFloat(value);
                    if (mode === 'unit') {
                        // Force integer for units, min 1
                        if (!isNaN(num)) updates.quantity = Math.max(1, Math.round(num));
                    } else {
                        // Allow decimals for weight
                        // We allow the input value to pass through to support typing "0.5"
                    }
                }
                return { ...i, ...updates };
            }
            return i;
        }));
    };

    // Filter options that are NOT already selected
    const filteredOptions = options
        .filter(opt => opt && opt.toLowerCase().includes(search.toLowerCase()))
        .filter(opt => !selectedItems.find(i => i.name === opt))
        .slice(0, 20);

    const totalMonthlyVolume = mode === 'weight' ? selectedItems.reduce((acc, item) => {
        const qty = parseFloat(item.quantity) || 0;
        const option = PERIOD_OPTIONS.find(o => o.value === (item.period || 'dia'));
        return acc + (qty * (option?.multiplier || 30));
    }, 0) : 0;

    const totalUnits = mode === 'unit' ? selectedItems.reduce((acc, item) => {
        return acc + (parseInt(item.quantity) || 0);
    }, 0) : 0;

    return (
        <div className="space-y-4 w-full">
            {/* Search Bar */}
            <div className="relative max-w-xl">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder={placeholder} 
                        value={search} 
                        onChange={e => { setSearch(e.target.value); setIsOpen(true); }}
                        onFocus={() => setIsOpen(true)}
                        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                        className="pl-9 bg-white shadow-sm border-slate-200"
                    />
                </div>
                {isOpen && search && filteredOptions.length > 0 && (
                    <Card className="absolute w-full z-50 mt-1 max-h-60 overflow-hidden shadow-xl border-slate-200 animate-in fade-in zoom-in-95 duration-100">
                        <ScrollArea className="h-full max-h-60">
                            <div className="p-1">
                                {filteredOptions.map((opt, idx) => (
                                    <div 
                                        key={idx}
                                        onClick={() => handleAdd(opt)}
                                        className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-700 p-2.5 rounded-md text-sm text-slate-700 flex items-center gap-2 transition-colors"
                                    >
                                        <Plus className="h-3.5 w-3.5 text-indigo-500" />
                                        {opt}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </Card>
                )}
            </div>

            {/* Visual Summary */}
            {selectedItems.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-900 text-sm">
                    <span className="font-medium flex items-center gap-2">
                        {mode === 'weight' ? <Scale className="h-4 w-4" /> : <Box className="h-4 w-4" />}
                        {mode === 'weight' ? 'Resumo de Volume' : 'Total de Equipamentos'}
                    </span>
                    <Badge variant="secondary" className="bg-white text-indigo-700 hover:bg-white border-indigo-200 shadow-sm">
                        {mode === 'weight' 
                            ? `Total Estimado: ~${totalMonthlyVolume.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} Kg/mês`
                            : `${totalUnits} ${totalUnits === 1 ? 'Unidade' : 'Unidades'}`
                        }
                    </Badge>
                </div>
            )}

            {/* List */}
            <div className="space-y-3">
                {selectedItems.map((item, idx) => (
                    <Card key={idx} className="group border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                        <CardContent className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <span className="font-semibold text-sm text-slate-800 block break-words whitespace-normal" title={item.name}>
                                    {item.name}
                                </span>
                                {mode === 'weight' && (
                                    <MonthlyProjection qty={item.quantity} period={item.period || 'dia'} />
                                )}
                            </div>
                            
                            <div className="flex items-center gap-3 shrink-0">
                                {/* Quantity Input */}
                                <div className="relative w-32">
                                    <Input 
                                        type="number" 
                                        step={mode === 'weight' ? "0.1" : "1"}
                                        min={mode === 'weight' ? "0.1" : "1"}
                                        value={item.quantity} 
                                        onChange={e => updateItem(item.name, 'quantity', e.target.value)}
                                        className="pr-12 h-9 text-right font-mono text-sm border-slate-200 focus:border-indigo-500"
                                        placeholder={mode === 'weight' ? "0.0" : "1"}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium pointer-events-none">
                                        {mode === 'weight' ? 'Kg' : (item.quantity == 1 ? 'Un' : 'Uns')}
                                    </span>
                                </div>

                                {mode === 'weight' && (
                                    <>
                                        <span className="text-slate-300">/</span>
                                        {/* Period Selector only for Weight mode */}
                                        <div className="w-28">
                                            <Select 
                                                value={item.period || 'dia'} 
                                                onValueChange={val => updateItem(item.name, 'period', val)}
                                            >
                                                <SelectTrigger className="h-9 text-xs border-slate-200 focus:ring-indigo-500">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PERIOD_OPTIONS.map(opt => (
                                                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                                            Por {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                )}

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                                onClick={() => handleRemove(item.name)}
                                                type="button"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Remover item</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                
                {selectedItems.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center gap-2">
                        {mode === 'weight' ? <Scale className="h-8 w-8 text-slate-300" /> : <Box className="h-8 w-8 text-slate-300" />}
                        <p>Nenhum item selecionado.</p>
                        <p className="text-xs opacity-70">Adicione {mode === 'weight' ? 'produtos' : 'equipamentos'} acima.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
