import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet-async';

const MotivoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: `Motivo ${isEditing ? 'atualizado' : 'criado'} com sucesso!`,
      description: "🚧 Funcionalidade em desenvolvimento.",
    });
    navigate('/apoio/chamados/motivos');
  };

  return (
    <>
      <Helmet><title>{isEditing ? 'Editar' : 'Novo'} Motivo de Chamado</title></Helmet>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Editar' : 'Novo'} Motivo de Chamado</CardTitle>
            <CardDescription>Crie ou edite um motivo para ser usado na abertura de chamados.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="tipo_chamado">Tipo de Chamado</Label>
                <Select required><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger><SelectContent><SelectItem value="troca">Troca</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo</Label>
                <Input id="motivo" placeholder="Ex: Equipamento com defeito" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea id="descricao" placeholder="Breve descrição do motivo." />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="ativo" defaultChecked />
              <Label htmlFor="ativo">Motivo Ativo</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/apoio/chamados/motivos')}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </CardFooter>
        </Card>
      </form>
    </>
  );
};

export default MotivoForm;