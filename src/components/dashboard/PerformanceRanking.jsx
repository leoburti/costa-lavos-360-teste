import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const PerformanceRanking = ({ data = [], title = "Ranking" }) => {
  const rankingData = Array.isArray(data) ? data : [];

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-slate-50 border-b text-xs font-bold text-slate-500 uppercase">
          <div className="col-span-2 text-center">Pos</div>
          <div className="col-span-6">Nome</div>
          <div className="col-span-4 text-right">Vendas</div>
      </div>
      <ScrollArea className="flex-1 w-full">
          <div className="divide-y divide-slate-100">
              {rankingData.length > 0 ? rankingData.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-slate-50 transition-colors">
                      <div className="col-span-2 text-center font-bold text-slate-400">
                          {index + 1}
                      </div>
                      <div className="col-span-6">
                          <p className="text-sm font-medium text-slate-800 truncate">{item.name || 'Sem nome'}</p>
                      </div>
                      <div className="col-span-4 text-right">
                          <p className="text-sm font-bold text-slate-900">{formatCurrency(item.total_revenue || 0)}</p>
                      </div>
                  </div>
              )) : (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                      Nenhum dado disponível.
                  </div>
              )}
          </div>
      </ScrollArea>
    </div>
  );
};

export default PerformanceRanking;