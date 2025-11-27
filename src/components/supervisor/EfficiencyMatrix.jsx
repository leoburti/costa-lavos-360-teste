
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
import { ChevronRight, Trophy, ArrowRight, Users, TrendingUp } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

const EfficiencyMatrix = ({ data, isLoading, onSelectSupervisor, selectedId }) => {
  if (isLoading) {
    return (
      <div className="space-y-4 p-4 border border-slate-200 rounded-xl bg-white">
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  const maxSales = Math.max(...data.map(d => d.total_revenue), 1);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden ring-1 ring-slate-200">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="text-amber-500" size={18} />
            Matriz de Eficiência
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Ranking consolidado por performance</p>
        </div>
        <Badge variant="outline" className="bg-white text-slate-500 text-[10px] font-normal">
          {data.length} Supervisores
        </Badge>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="w-full min-w-[600px]"> {/* Ensure table doesn't crush on small screens */}
          <Table>
            <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <TableRow className="hover:bg-slate-50 border-b border-slate-200">
                <TableHead className="w-[50px] text-center font-bold text-slate-600 text-xs uppercase">#</TableHead>
                <TableHead className="font-bold text-slate-600 text-xs uppercase w-[30%]">Supervisor</TableHead>
                <TableHead className="text-right font-bold text-slate-600 text-xs uppercase w-[25%]">Vendas</TableHead>
                <TableHead className="text-center font-bold text-slate-600 text-xs uppercase w-[15%]">Score</TableHead>
                <TableHead className="text-center font-bold text-slate-600 text-xs uppercase w-[15%]">KPIs</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
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
                      key={item.name}
                      className={`cursor-pointer transition-all border-b border-slate-100 last:border-0 group hover:bg-slate-50/80 ${isSelected ? 'bg-blue-50/60 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}`}
                      onClick={() => onSelectSupervisor(item.name)}
                    >
                      <TableCell className="text-center font-bold text-slate-400 group-hover:text-slate-600 text-xs">
                        {index + 1}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col">
                          <span className={`font-bold text-sm ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Users size={10} /> {item.activeSellers} vendedores
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-bold text-sm text-slate-900">{formatCurrency(item.total_revenue)}</span>
                          <Progress value={(item.total_revenue / maxSales) * 100} className="h-1.5 w-full max-w-[100px]" indicatorClassName="bg-blue-600" />
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Badge variant="secondary" className={`text-[10px] font-bold border-0 px-2 ${efficiencyColor} text-white`}>
                            {Math.round(item.efficiencyIndex)} pts
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col gap-1 items-center">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${item.growth >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {item.growth >= 0 ? '▲' : '▼'} {formatPercentage(Math.abs(item.growth * 100))}
                          </span>
                          <span className="text-[10px] text-slate-400">ROI: {item.roi}x</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
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

export default EfficiencyMatrix;
