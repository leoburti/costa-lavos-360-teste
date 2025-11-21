import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet-async';

const EquipamentoComodatoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: `Equipamento ${isEditing ? 'atualizado' : 'adicionado'} com sucesso!`,
      description: "🚧 Funcionalidade em desenvolvimento.",
    });
    navigate(-1); // Go back to the previous page
  };

  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Editar Equipamento' : 'Novo Equipamento'} em Comodato</title>
      </Helmet>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Editar Equipamento' : 'Adicionar Equipamento ao Cliente'}</CardTitle>
            <CardDescription>Preencha os dados para adicionar um novo equipamento à base instalada de um cliente.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente</Label>
              <Select required><SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger><SelectContent><SelectItem value="1">Padaria Pão Quente</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo do Equipamento</Label>
              <Select required><SelectTrigger><SelectValue placeholder="Selecione o modelo" /></SelectTrigger><SelectContent><SelectItem value="1">Forno Turbo F-2000</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero_serie">Número de Série</Label>
              <Input id="numero_serie" placeholder="SN-123456789" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select required><SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="em_uso">Em Uso</SelectItem>
                  <SelectItem value="em_transito">Em Trânsito</SelectItem>
                  <SelectItem value="retirado">Retirado</SelectItem>
                  <SelectItem value="defeito">Com Defeito</SelectItem>
                  <SelectItem value="em_manutencao">Em Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_instalacao">Data de Instalação</Label>
              <Input id="data_instalacao" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="local_instalacao">Local de Instalação</Label>
              <Input id="local_instalacao" placeholder="Ex: Cozinha principal" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea id="observacoes" placeholder="Qualquer informação relevante sobre a instalação ou o equipamento." />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </CardFooter>
        </Card>
      </form>
    </>
  );
};

export default EquipamentoComodatoForm;