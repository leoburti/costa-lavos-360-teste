import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet-async';
import { PlusCircle, Trash2 } from 'lucide-react';

const ModeloEquipamentoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);
  const [specs, setSpecs] = useState([{ key: '', value: '' }]);

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  const addSpec = () => setSpecs([...specs, { key: '', value: '' }]);
  const removeSpec = (index) => setSpecs(specs.filter((_, i) => i !== index));

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: `Modelo ${isEditing ? 'atualizado' : 'criado'} com sucesso!`,
      description: "🚧 Funcionalidade em desenvolvimento.",
    });
    navigate('/apoio/comodato/modelos');
  };

  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Editar Modelo' : 'Novo Modelo'} de Equipamento</title>
      </Helmet>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Editar Modelo' : 'Novo Modelo de Equipamento'}</CardTitle>
            <CardDescription>Defina um novo modelo de equipamento para o catálogo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nome_modelo">Nome do Modelo</Label>
                <Input id="nome_modelo" placeholder="Ex: Forno Turbo F-2000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Input id="categoria" placeholder="Ex: Fornos" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea id="descricao" placeholder="Breve descrição do modelo e suas funcionalidades." />
            </div>
            <div className="space-y-4">
              <Label>Especificações Técnicas</Label>
              {specs.map((spec, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input placeholder="Característica (Ex: Voltagem)" value={spec.key} onChange={(e) => handleSpecChange(index, 'key', e.target.value)} />
                  <Input placeholder="Valor (Ex: 220V)" value={spec.value} onChange={(e) => handleSpecChange(index, 'value', e.target.value)} />
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeSpec(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addSpec}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Especificação</Button>
            </div>
            <div className="flex items-center space-x-2 pt-4">
              <Checkbox id="ativo" defaultChecked />
              <Label htmlFor="ativo">Modelo ativo e disponível para uso</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/apoio/comodato/modelos')}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </CardFooter>
        </Card>
      </form>
    </>
  );
};

export default ModeloEquipamentoForm;