
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';

const EquipmentSearchInput = ({ value, onChange, isLoading, placeholder = "Buscar equipamento..." }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input 
        placeholder={placeholder}
        className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {isLoading && (
        <div className="absolute right-3 top-3">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};

export default EquipmentSearchInput;
