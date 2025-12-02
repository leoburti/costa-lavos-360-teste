
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronRight, Trophy, ArrowRight, Users } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

const PerformanceMatrix = ({ data, isLoading, onSelectItem, selectedId, title = "Ranking & Performance", entityLabel = "Vendedores" }) => {
  if (isLoading) {
    return (
      <div className="space-y-4 p-4 border border-slate-200 rounded-xl bg-white h-full">
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  // Calculate max sales for relative progress bars, avoiding division by zero
  const maxSales = Math.max(...(data || []).map(d => d.total_revenue || 0), 1);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden ring-1 ring-slate-200">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="text-amber-500" size={18} />
            {title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Matriz de performance</p>
        </div>
        <Badge variant="outline" className="bg-white text-slate-500 text-[10px] font-normal">
          {data?.length || 0} {entityLabel}
        </Badge>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="w-full min-w-full">
          <Table>
            <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <TableRow className="hover:bg-slate-50 border-b border-slate-200">
                <TableHead className="w-[40px] text-center font-bold text-slate-600 text-xs uppercase">#</TableHead>
                <TableHead className="font-bold text-slate-600 text-xs uppercase">Nome</TableHead>
                <TableHead className="text-right font-bold text-slate-600 text-xs uppercase">Vendas</TableHead>
                <TableHead className="text-center font-bold text-slate-600 text-xs uppercase w-[80px]">Eficiência</TableHead>
                <TableHead className="text-center font-bold text-slate-600 text-xs uppercase hidden sm:table-cell">Cresc.</TableHead>
                <TableHead className="w-[40px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!data || data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    Nenhum dado encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => {
                  const isSelected = selectedId === item.name;
                  const efficiencyColor = item.efficiencyIndex >= 80 ? 'bg-emerald-500' : item.efficiencyIndex >= 60 ? 'bg-amber-500' : 'bg-rose-500';
                  
                  return (
                    <TableRow 
                      key={item.name || index}
                      className={`cursor-pointer transition-all border-b border-slate-100 last:border-0 group hover:bg-slate-50/80 ${isSelected ? 'bg-blue-50/60 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}`}
                      onClick={() => onSelectItem && onSelectItem(item)}
                    >
                      <TableCell className="text-center font-bold text-slate-400 group-hover:text-slate-600 text-xs p-3">
                        {index + 1}
                      </TableCell>
                      
                      <TableCell className="p-3">
                        <div className="flex flex-col">
                          <span className={`font-bold text-sm truncate max-w-[180px] ${isSelected ? 'text-blue-700' : 'text-slate-800'}`} title={item.name}>
                            {item.name}
                          </span>
                          {item.subLabel && (
                            <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                              {item.subLabel}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right p-3">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-bold text-sm text-slate-900 whitespace-nowrap">{formatCurrency(item.total_revenue)}</span>
                          <Progress value={(item.total_revenue / maxSales) * 100} className="h-1.5 w-full max-w-[80px]" indicatorClassName="bg-blue-600" />
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center p-3">
                        <div className="flex flex-col items-center gap-1">
                          <Badge variant="secondary" className={`text-[10px] font-bold border-0 px-2 ${efficiencyColor} text-white`}>
                            {Math.round(item.efficiencyIndex || 0)}%
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell className="hidden sm:table-cell p-3">
                        <div className="flex flex-col gap-1 items-center">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm whitespace-nowrap ${item.growth >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {item.growth >= 0 ? '▲' : '▼'} {formatPercentage(Math.abs((item.growth || 0) * 100))}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell className="p-3">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`h-7 w-7 rounded-full ${isSelected ? 'bg-blue-100 text-blue-600' : 'text-slate-300 hover:text-slate-500'}`}
                        >
                          {isSelected ? <ArrowRight size={14} /> : <ChevronRight size={16} />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
};

export default PerformanceMatrix;
