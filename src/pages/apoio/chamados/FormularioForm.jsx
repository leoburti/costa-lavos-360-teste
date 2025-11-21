
import React, { useState } from 'react';
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
import { PlusCircle, Trash2 } from 'lucide-react';

const FormularioForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);
  const [fields, setFields] = useState([{ nome_campo: '', tipo_campo: 'texto', obrigatorio: false }]);

  const handleFieldChange = (index, field, value) => {
    const newFields = [...fields];
    newFields[index][field] = value;
    setFields(newFields);
  };

  const addField = () => setFields([...fields, { nome_campo: '', tipo_campo: 'texto', obrigatorio: false }]);
  const removeField = (index) => setFields(fields.filter((_, i) => i !== index));

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: `Formulário ${isEditing ? 'atualizado' : 'criado'} com sucesso!`,
      description: "🚧 Funcionalidade em desenvolvimento.",
    });
    navigate('/admin/apoio/chamados/formularios');
  };

  return (
    <>
      <Helmet><title>{isEditing ? 'Editar' : 'Novo'} Formulário</title></Helmet>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Editar' : 'Novo'} Formulário de Execução</CardTitle>
            <CardDescription>Crie ou edite um formulário para ser usado nos chamados.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label htmlFor="nome">Nome do Formulário</Label><Input id="nome" required /></div>
                <div className="space-y-2"><Label htmlFor="tipo_chamado">Tipo de Chamado</Label><Select required><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="troca">Troca</SelectItem></SelectContent></Select></div>
              </div>
              <div className="space-y-2"><Label htmlFor="descricao">Descrição</Label><Textarea id="descricao" /></div>
              <div className="flex items-center space-x-2"><Checkbox id="ativo" defaultChecked /><Label htmlFor="ativo">Ativo</Label></div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Campos do Formulário</h3>
              {fields.map((field, index) => (
                <div key={index} className="p-4 border rounded-md space-y-4 relative">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2"><Label>Nome do Campo</Label><Input value={field.nome_campo} onChange={(e) => handleFieldChange(index, 'nome_campo', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Tipo do Campo</Label><Select value={field.tipo_campo} onValueChange={(v) => handleFieldChange(index, 'tipo_campo', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="texto">Texto</SelectItem><SelectItem value="foto">Foto</SelectItem></SelectContent></Select></div>
                    <div className="flex items-end pb-2 space-x-4"><Checkbox checked={field.obrigatorio} onCheckedChange={(c) => handleFieldChange(index, 'obrigatorio', c)} /><Label>Obrigatório</Label></div>
                  </div>
                  <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeField(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addField}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Campo</Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/apoio/chamados/formularios')}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </CardFooter>
        </Card>
      </form>
    </>
  );
};

export default FormularioForm;
