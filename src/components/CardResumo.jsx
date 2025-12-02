import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { extractValue, safeNumber } from '@/utils/dataValidator';

const CardResumo = ({ titulo, valor, variacao, icone: Icone, cor }) => {
  // Sanitize inputs
  const safeValor = extractValue(valor);
  const safeTitulo = extractValue(titulo);
  const safeVariacao = safeNumber(variacao);

  const variacaoCor = safeVariacao > 0 ? 'text-green-500' : safeVariacao < 0 ? 'text-red-500' : 'text-muted-foreground';
  const VariacaoIcone = safeVariacao > 0 ? ArrowUp : safeVariacao < 0 ? ArrowDown : Minus;

  return (
    <Card className={cn("transition-all hover:shadow-lg", cor)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{safeTitulo}</CardTitle>
        {Icone && <Icone className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold truncate" title={String(safeValor)}>{safeValor}</div>
        {variacao !== undefined && variacao !== null && (
          <p className={cn("text-xs", variacaoCor, "flex items-center")}>
            <VariacaoIcone className="h-3 w-3 mr-1" />
            {safeVariacao.toFixed(2)}% em relação ao período anterior
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CardResumo;