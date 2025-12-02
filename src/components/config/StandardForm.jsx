import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { moduleDefinitions } from '@/config/configModules';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import PageHeader from '@/components/PageHeader';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const StandardForm = ({ type }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const config = moduleDefinitions[type];
  const isEdit = !!id;

  if (!config) return <div>Configuração não encontrada</div>;

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({ 
      title: isEdit ? "Registro atualizado" : "Registro criado", 
      description: "A operação foi realizada com sucesso (simulação).",
      variant: "success"
    });
    navigate(-1);
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet><title>{isEdit ? 'Editar' : 'Novo'} | {config.title}</title></Helmet>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader 
          title={isEdit ? `Editar ${config.title.slice(0, -1)}` : `Novo ${config.title.slice(0, -1)}`}
          breadcrumbs={[
            { label: 'Configurações', path: '/configuracoes' }, 
            { label: config.title, path: `/configuracoes/${type}` },
            { label: isEdit ? 'Editar' : 'Novo' }
          ]}
          className="pb-0"
        />
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Registro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {config.fields?.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>{field.label}</Label>
                {field.type === 'select' ? (
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === 'textarea' ? (
                  <Textarea id={field.name} placeholder={`Digite ${field.label.toLowerCase()}...`} />
                ) : (
                  <Input 
                    id={field.name} 
                    type={field.type} 
                    placeholder={`Digite ${field.label.toLowerCase()}...`} 
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-end gap-2 bg-slate-50 p-4 rounded-b-xl border-t">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit"><Save className="mr-2 h-4 w-4" /> Salvar</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default StandardForm;