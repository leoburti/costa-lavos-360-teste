import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const ConfiguracaoInput = ({ label, descricao, tipo, valor, onChange, disabled, placeholder }) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={tipo}
        value={valor}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
      />
      {descricao && <p className="text-xs text-muted-foreground">{descricao}</p>}
    </div>
  );
};

export default ConfiguracaoInput;