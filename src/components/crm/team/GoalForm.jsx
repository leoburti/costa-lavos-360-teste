import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

const GoalForm = ({ onSubmit, loading = false, onCancel }) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      type: 'revenue',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    }
  });

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título da Meta</Label>
        <Input 
          id="title" 
          placeholder="Ex: Faturamento Q3" 
          {...register('title', { required: 'Título é obrigatório' })} 
        />
        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Select onValueChange={(val) => setValue('type', val)} defaultValue="revenue">
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Receita (R$)</SelectItem>
              <SelectItem value="deals">Vendas (Qtd)</SelectItem>
              <SelectItem value="calls">Ligações</SelectItem>
              <SelectItem value="meetings">Reuniões</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="target">Meta (Alvo)</Label>
          <Input 
            id="target" 
            type="number" 
            step="0.01"
            placeholder="0.00" 
            {...register('target_value', { required: 'Valor é obrigatório' })} 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Início</Label>
          <Input 
            id="start_date" 
            type="date" 
            {...register('start_date', { required: true })} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">Fim</Label>
          <Input 
            id="end_date" 
            type="date" 
            {...register('end_date', { required: true })} 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição (Opcional)</Label>
        <Input 
          id="description" 
          placeholder="Detalhes adicionais..." 
          {...register('description')} 
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Criar Meta
        </Button>
      </DialogFooter>
    </form>
  );
};

export default GoalForm;