import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

const CardResumo = ({ titulo, valor, variacao, icone: Icone, cor }) => {
  const variacaoCor = variacao > 0 ? 'text-green-500' : variacao < 0 ? 'text-red-500' : 'text-muted-foreground';
  const VariacaoIcone = variacao > 0 ? ArrowUp : variacao < 0 ? ArrowDown : Minus;

  return (
    <Card className={cn("transition-all hover:shadow-lg", cor)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{titulo}</CardTitle>
        {Icone && <Icone className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{valor}</div>
        {variacao !== undefined && (
          <p className={cn("text-xs", variacaoCor, "flex items-center")}>
            <VariacaoIcone className="h-3 w-3 mr-1" />
            {variacao.toFixed(2)}% em relação ao período anterior
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CardResumo;