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
import { TestTube2 } from 'lucide-react';

const IntegracaoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: `Integração ${isEditing ? 'atualizada' : 'criada'} com sucesso!`,
      description: "🚧 Funcionalidade em desenvolvimento.",
    });
    navigate('/apoio/geolocalizacao/integracoes');
  };

  return (
    <>
      <Helmet><title>{isEditing ? 'Editar' : 'Nova'} Integração</title></Helmet>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Editar' : 'Nova'} Integração de API</CardTitle>
            <CardDescription>Configure a conexão com APIs externas como Google Maps, ERPs e CRMs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Integração</Label>
              <Input id="nome" placeholder="Ex: ERP Protheus" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select required><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger><SelectContent>
                <SelectItem value="google_maps">Google Maps</SelectItem>
                <SelectItem value="erp">ERP</SelectItem>
                <SelectItem value="crm">CRM</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent></Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="url_base">URL Base</Label>
              <Input id="url_base" placeholder="https://api.exemplo.com/v1" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chave_api">Chave da API (API Key)</Label>
              <Input id="chave_api" type="password" placeholder="••••••••••••••••" required />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="ativo" defaultChecked />
              <Label htmlFor="ativo">Ativo</Label>
            </div>
            <Button type="button" variant="outline"><TestTube2 className="mr-2 h-4 w-4" /> Testar Conexão</Button>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/apoio/geolocalizacao/integracoes')}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </CardFooter>
        </Card>
      </form>
    </>
  );
};

export default IntegracaoForm;