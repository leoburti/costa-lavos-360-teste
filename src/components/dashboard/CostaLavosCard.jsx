import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

const CostaLavosCard = ({ data }) => {
  const totalRealized = data?.totalRevenue || 0;
  const totalTarget = totalRealized > 0 ? totalRealized * 1.25 : 1000000; // Mock target logic
  const percentage = totalTarget > 0 ? (totalRealized / totalTarget) * 100 : 0;
  
  const activeClients = data?.activeClients || 0;
  const salesCount = data?.salesCount || 0;

  return (
    <Card className="h-full border-slate-200 shadow-sm relative overflow-hidden flex flex-col">
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none"></div>
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-extrabold text-slate-900 tracking-tight">RESUMO GERAL</CardTitle>
            <div className="flex gap-2 mt-3">
              <div className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-blue-100/50 flex flex-col items-center justify-center min-w-[80px]">
                 <span className="text-blue-800 text-sm font-bold">{salesCount > 0 ? salesCount : '-'}</span>
                 <span className="text-[10px] opacity-80">Vendas</span>
              </div>
              <div className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-slate-200/50 flex flex-col items-center justify-center min-w-[80px]">
                 <span className="text-slate-900 text-sm font-bold">{activeClients}</span>
                 <span className="text-[10px] opacity-80">Clientes</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-2 rounded-full shadow-sm border border-slate-100">
             <Activity className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 flex-1 flex flex-col justify-center">
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 mb-6">
            <div className="grid grid-cols-2 gap-8 relative">
                <div className="absolute left-1/2 top-2 bottom-2 w-px bg-slate-200 -translate-x-1/2"></div>

                <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Realizado</span>
                    <div className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
                    {formatCurrency(totalRealized)}
                    </div>
                </div>

                <div className="space-y-1 text-right">
                    <div className="flex items-center justify-end gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Meta (Est.)</span>
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none h-5 px-1.5 text-[10px]">
                            {percentage.toFixed(1)}%
                        </Badge>
                    </div>
                    <div className="text-lg lg:text-xl font-semibold text-slate-500 tracking-tight">
                    {formatCurrency(totalTarget)}
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">
            <span>Progresso</span>
            <span>{percentage.toFixed(1)}%</span>
          </div>
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-primary to-indigo-400 rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            >
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CostaLavosCard;