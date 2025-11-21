import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet-async';
import AprovacaoTypesGrid from './AprovacaoTypesGrid';

const AprovadorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: `Aprovador ${isEditing ? 'atualizado' : 'designado'} com sucesso!`,
      description: "🚧 Funcionalidade em desenvolvimento.",
    });
    navigate('/configuracoes/usuarios/aprovadores');
  };

  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Editar Aprovador' : 'Designar Aprovador'}</title>
      </Helmet>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Editar Aprovador' : 'Designar Novo Aprovador'}</CardTitle>
            <CardDescription>Selecione um usuário e defina quais tipos de solicitações ele pode aprovar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuário</Label>
              <Select required><SelectTrigger><SelectValue placeholder="Selecione um usuário" /></SelectTrigger><SelectContent><SelectItem value="1">Admin</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2">
              <Label>Tipos de Aprovação</Label>
              <AprovacaoTypesGrid selectedTypes={{}} onTypeChange={() => {}} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select defaultValue="ativo"><SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/configuracoes/usuarios/aprovadores')}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </CardFooter>
        </Card>
      </form>
    </>
  );
};

export default AprovadorForm;