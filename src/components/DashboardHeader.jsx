import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RefreshCw, Database, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const DashboardHeader = ({ lastUpdated, onRefresh, isRefreshing, source }) => {
  const timeAgo = lastUpdated 
    ? formatDistanceToNow(new Date(lastUpdated), { addSuffix: true, locale: ptBR })
    : 'Desconhecido';

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Visão Geral Comercial</h1>
        <p className="text-sm text-slate-500">Acompanhamento de KPIs e performance de vendas</p>
      </div>

      <div className="flex items-center gap-3">
        {source === 'cache' ? (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 flex gap-1">
                <Database size={12} />
                Dados em Cache
            </Badge>
        ) : (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex gap-1">
                <AlertCircle size={12} />
                Dados em Tempo Real
            </Badge>
        )}

        <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Atualizado {timeAgo}</span>
        </div>

        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={onRefresh} 
                        disabled={isRefreshing}
                        className="gap-2"
                    >
                        <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                        {isRefreshing ? 'Atualizando...' : 'Atualizar'}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Recalcular dados manualmente (pode levar alguns minutos)</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default DashboardHeader;