import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Schema de validação
const equipmentSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  type: z.string().min(1, "Selecione um tipo"),
  brand: z.string().min(2, "Marca é obrigatória"),
  model: z.string().min(2, "Modelo é obrigatório"),
  serial: z.string().min(2, "Número de série é obrigatório"),
  status: z.string().min(1, "Status é obrigatório"),
  location: z.string().min(3, "Localização é obrigatória"),
  acquisitionDate: z.string().optional(), // Pode refinar para data válida
  value: z.string().optional(), // Vem como string do input
  warrantyExpiration: z.string().optional(),
  description: z.string().optional(),
});

const EquipmentForm = ({ initialData, onSubmit, loading, isEdit = false }) => {
  const navigate = useNavigate();
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      name: '',
      type: '',
      brand: '',
      model: '',
      serial: '',
      status: 'ativo',
      location: '',
      acquisitionDate: '',
      value: '',
      warrantyExpiration: '',
      description: '',
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        acquisitionDate: initialData.acquisitionDate ? initialData.acquisitionDate.split('T')[0] : '',
        warrantyExpiration: initialData.warrantyExpiration ? initialData.warrantyExpiration.split('T')[0] : '',
        value: initialData.value ? String(initialData.value) : ''
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>{isEdit ? 'Dados do Equipamento' : 'Informações Básicas'}</CardTitle>
          <CardDescription>Preencha os detalhes técnicos do ativo.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nome do Equipamento *</label>
              <Input {...register('name')} placeholder="Ex: Freezer Horizontal 500L" className={errors.name ? 'border-red-500' : ''} />
              {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tipo *</label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Freezer">Freezer</SelectItem>
                      <SelectItem value="Geladeira">Geladeira</SelectItem>
                      <SelectItem value="Forno">Forno</SelectItem>
                      <SelectItem value="Balcão">Balcão</SelectItem>
                      <SelectItem value="Expositor">Expositor</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && <span className="text-xs text-red-500">{errors.type.message}</span>}
            </div>

            {/* Marca */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Marca *</label>
              <Input {...register('brand')} placeholder="Ex: Consul" className={errors.brand ? 'border-red-500' : ''} />
              {errors.brand && <span className="text-xs text-red-500">{errors.brand.message}</span>}
            </div>

            {/* Modelo */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Modelo *</label>
              <Input {...register('model')} placeholder="Ex: CH500" className={errors.model ? 'border-red-500' : ''} />
              {errors.model && <span className="text-xs text-red-500">{errors.model.message}</span>}
            </div>

            {/* Série */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Número de Série *</label>
              <Input {...register('serial')} placeholder="Ex: 123456789" className={errors.serial ? 'border-red-500' : ''} />
              {errors.serial && <span className="text-xs text-red-500">{errors.serial.message}</span>}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Status *</label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="manutencao">Em Manutenção</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="baixado">Baixado</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && <span className="text-xs text-red-500">{errors.status.message}</span>}
            </div>

            {/* Localização */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Localização *</label>
              <Input {...register('location')} placeholder="Ex: Loja Matriz - Cozinha" className={errors.location ? 'border-red-500' : ''} />
              {errors.location && <span className="text-xs text-red-500">{errors.location.message}</span>}
            </div>

            {/* Data Aquisição */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Data de Aquisição</label>
              <Input type="date" {...register('acquisitionDate')} />
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Valor (R$)</label>
              <Input type="number" step="0.01" {...register('value')} placeholder="0.00" />
            </div>

            {/* Garantia */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Validade da Garantia</label>
              <Input type="date" {...register('warrantyExpiration')} />
            </div>

            {/* Descrição */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Descrição / Observações</label>
              <Textarea {...register('description')} placeholder="Informações adicionais..." rows={4} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={() => navigate('/equipamentos')} disabled={loading}>
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="min-w-[140px]">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {isEdit ? 'Salvar Alterações' : 'Criar Equipamento'}
        </Button>
      </div>
    </form>
  );
};

export default EquipmentForm;