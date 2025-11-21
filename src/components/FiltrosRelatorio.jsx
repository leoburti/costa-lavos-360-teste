import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

const FiltrosRelatorio = ({ filtros, onAplicar, children }) => {
  return (
    <div className="flex flex-wrap items-end gap-4 p-4 border rounded-lg bg-card">
      {children}
      <Button onClick={onAplicar}>
        <Filter className="mr-2 h-4 w-4" />
        Aplicar Filtros
      </Button>
    </div>
  );
};

export default FiltrosRelatorio;