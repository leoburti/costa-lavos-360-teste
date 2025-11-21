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

const BloqueioForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: `Bloqueio ${isEditing ? 'atualizado' : 'criado'} com sucesso!`,
      description: "🚧 Funcionalidade em desenvolvimento.",
    });
    navigate('/apoio/agenda/bloqueios');
  };

  return (
    <>
      <Helmet><title>{isEditing ? 'Editar' : 'Novo'} Bloqueio</title></Helmet>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Editar' : 'Novo'} Bloqueio</CardTitle>
            <CardDescription>Gerencie períodos de indisponibilidade para um profissional.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="profissional">Profissional</Label>
              <Select required><SelectTrigger><SelectValue placeholder="Selecione um profissional" /></SelectTrigger><SelectContent><SelectItem value="1">Técnico Zé</SelectItem></SelectContent></Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><Label htmlFor="data_inicio">Data Início</Label><Input id="data_inicio" type="date" required /></div>
              <div className="space-y-2"><Label htmlFor="data_fim">Data Fim</Label><Input id="data_fim" type="date" required /></div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo_bloqueio">Tipo de Bloqueio</Label>
              <Select required><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger><SelectContent><SelectItem value="ferias">Férias</SelectItem><SelectItem value="doenca">Doença</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo</Label>
              <Textarea id="motivo" placeholder="Descreva o motivo do bloqueio." required />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/apoio/agenda/bloqueios')}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </CardFooter>
        </Card>
      </form>
    </>
  );
};

export default BloqueioForm;