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
import { ChevronRight, ArrowRight, Users, Package, TrendingUp, Target, DollarSign, PieChart } from 'lucide-react';
import { formatCurrency, formatPercentage, formatNumber } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const SellerEfficiencyMatrix = ({ data, isLoading, onSelectSeller, selectedId }) => {
  if (isLoading) {
    return (
      <div className="space-y-4 p-4 border border-slate-200 rounded-xl bg-white">
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  const maxSales = Math.max(...data.map(d => d.total_revenue), 1);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden ring-1 ring-slate-200">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={18} />
            Matriz de Eficiência
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Desempenho detalhado por vendedor</p>
        </div>
        <Badge variant="outline" className="bg-white text-slate-500 text-[10px] font-normal">
          {data.length} Vendedores
        </Badge>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="w-full min-w-[800px] xl:min-w-full">
          <Table>
            <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <TableRow className="hover:bg-slate-50 border-b border-slate-200">
                <TableHead className="w-[40px] text-center font-bold text-slate-600 text-xs uppercase">#</TableHead>
                <TableHead className="font-bold text-slate-600 text-xs uppercase w-[200px]">Vendedor</TableHead>
                <TableHead className="text-right font-bold text-slate-600 text-xs uppercase">Vendas</TableHead>
                
                {/* Collapsible Columns based on view mode (simplified logic: hidden when selectedId is present in parent grid, but here we use CSS classes for responsiveness) */}
                <TableHead className={`text-center font-bold text-slate-600 text-xs uppercase ${selectedId ? 'hidden 2xl:table-cell' : 'hidden md:table-cell'}`}>Pedidos</TableHead>
                <TableHead className={`text-right font-bold text-slate-600 text-xs uppercase ${selectedId ? 'hidden' : 'hidden lg:table-cell'}`}>Ticket Médio</TableHead>
                <TableHead className={`text-center font-bold text-slate-600 text-xs uppercase ${selectedId ? 'hidden' : 'hidden xl:table-cell'}`}>Conv.</TableHead>
                
                <TableHead className="text-center font-bold text-slate-600 text-xs uppercase w-[80px]">Meta</TableHead>
                <TableHead className={`text-center font-bold text-slate-600 text-xs uppercase ${selectedId ? 'hidden' : 'hidden sm:table-cell'}`}>Cresc.</TableHead>
                <TableHead className="w-[40px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                    Nenhum dado encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => {
                  const isSelected = selectedId === item.name;
                  // Status Color logic based on Meta Achievement
                  const metaPercent = item.goal_percent || 0;
                  const statusColor = metaPercent >= 100 ? 'bg-emerald-500' : metaPercent >= 80 ? 'bg-amber-500' : 'bg-rose-500';
                  
                  return (
                    <TableRow 
                      key={item.name}
                      className={`cursor-pointer transition-all border-b border-slate-100 last:border-0 group hover:bg-slate-50/80 ${isSelected ? 'bg-indigo-50/60 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'}`}
                      onClick={() => onSelectSeller(item.name)}
                    >
                      <TableCell className="text-center font-bold text-slate-400 group-hover:text-slate-600 text-xs p-3">
                        {index + 1}
                      </TableCell>
                      
                      <TableCell className="p-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${statusColor}`} />
                          <div className="flex flex-col min-w-0">
                            <span className={`font-bold text-sm truncate max-w-[150px] ${isSelected ? 'text-indigo-700' : 'text-slate-800'}`} title={item.name}>
                              {item.name}
                            </span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                              <Users size={10} /> {item.active_clients || 0} clientes
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right p-3">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-bold text-sm text-slate-900 whitespace-nowrap">{formatCurrency(item.total_revenue)}</span>
                          <Progress value={(item.total_revenue / maxSales) * 100} className="h-1.5 w-full max-w-[80px] bg-slate-100" indicatorClassName={isSelected ? "bg-indigo-600" : "bg-slate-400"} />
                        </div>
                      </TableCell>
                      
                      {/* Pedidos */}
                      <TableCell className={`text-center p-3 ${selectedId ? 'hidden 2xl:table-cell' : 'hidden md:table-cell'}`}>
                        <div className="flex items-center justify-center gap-1 text-slate-600 font-medium text-xs">
                          <Package size={12} className="text-slate-400" />
                          {formatNumber(item.total_orders)}
                        </div>
                      </TableCell>

                      {/* Ticket Médio */}
                      <TableCell className={`text-right p-3 ${selectedId ? 'hidden' : 'hidden lg:table-cell'}`}>
                        <div className="font-medium text-xs text-slate-600">
                          {formatCurrency(item.avgTicket)}
                        </div>
                      </TableCell>

                      {/* Conversão/Positivação */}
                      <TableCell className={`text-center p-3 ${selectedId ? 'hidden' : 'hidden xl:table-cell'}`}>
                         <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="secondary" className="bg-slate-50 text-slate-600 border-slate-200 font-normal text-[10px]">
                                  {formatPercentage(item.positivation_rate || 0)}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>Taxa de Positivação</TooltipContent>
                            </Tooltip>
                         </TooltipProvider>
                      </TableCell>
                      
                      {/* Meta */}
                      <TableCell className="text-center p-3">
                        <Badge variant="outline" className={`text-[10px] font-bold border px-2 py-0.5 ${
                          metaPercent >= 100 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : metaPercent >= 80 
                              ? 'bg-amber-50 text-amber-700 border-amber-200' 
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {Math.round(metaPercent)}%
                        </Badge>
                      </TableCell>
                      
                      {/* Crescimento YoY */}
                      <TableCell className={`text-center p-3 ${selectedId ? 'hidden' : 'hidden sm:table-cell'}`}>
                        <div className={`flex items-center justify-center gap-1 text-[10px] font-bold ${item.growth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {item.growth >= 0 ? '▲' : '▼'} {formatPercentage(Math.abs(item.growth * 100))}
                        </div>
                      </TableCell>
                      
                      <TableCell className="p-3">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`h-7 w-7 rounded-full transition-colors ${isSelected ? 'bg-indigo-100 text-indigo-600' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100'}`}
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

export default SellerEfficiencyMatrix;