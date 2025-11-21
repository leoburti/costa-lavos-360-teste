import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

const ConfiguracaoCard = ({ titulo, descricao, icone: Icone, children, acao }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        {Icone && <div className="p-2 bg-muted rounded-md"><Icone className="h-6 w-6" /></div>}
        <div className="flex-1">
          <CardTitle>{titulo}</CardTitle>
          <CardDescription>{descricao}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
      {acao && (
        <CardFooter>
          {acao}
        </CardFooter>
      )}
    </Card>
  );
};

export default ConfiguracaoCard;