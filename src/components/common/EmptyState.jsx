import React from 'react';
import { SearchX } from 'lucide-react';

export const EmptyState = ({ 
  title = "Nenhum dado encontrado", 
  description = "Tente ajustar os filtros selecionados para ver resultados.",
  icon: Icon = SearchX
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center p-8 border-2 border-dashed rounded-xl border-muted bg-muted/5">
      <div className="bg-background p-4 rounded-full shadow-sm mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">{description}</p>
    </div>
  );
};

export default EmptyState;