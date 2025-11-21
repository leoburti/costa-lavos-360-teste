import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet-async';

const DisponibilidadeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: `Disponibilidade ${isEditing ? 'atualizada' : 'criada'} com sucesso!`,
      description: "🚧 Funcionalidade em desenvolvimento.",
    });
    navigate('/apoio/agenda/disponibilidade');
  };

  return (
    <>
      <Helmet><title>{isEditing ? 'Editar' : 'Nova'} Disponibilidade</title></Helmet>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Editar' : 'Nova'} Disponibilidade</CardTitle>
            <CardDescription>Defina os horários de trabalho de um profissional.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="profissional">Profissional</Label>
              <Select required><SelectTrigger><SelectValue placeholder="Selecione um profissional" /></SelectTrigger><SelectContent><SelectItem value="1">Técnico Zé</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dia_semana">Dia da Semana</Label>
              <Select required><SelectTrigger><SelectValue placeholder="Selecione o dia" /></SelectTrigger><SelectContent><SelectItem value="1">Segunda-feira</SelectItem><SelectItem value="2">Terça-feira</SelectItem></SelectContent></Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><Label htmlFor="hora_inicio">Hora Início</Label><Input id="hora_inicio" type="time" required /></div>
              <div className="space-y-2"><Label htmlFor="hora_fim">Hora Fim</Label><Input id="hora_fim" type="time" required /></div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="ativo" defaultChecked />
              <Label htmlFor="ativo">Ativo</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/apoio/agenda/disponibilidade')}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </CardFooter>
        </Card>
      </form>
    </>
  );
};

export default DisponibilidadeForm;