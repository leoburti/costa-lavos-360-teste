import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet-async';
import PermissionsGrid from './PermissionsGrid';
import AprovacaoTypesGrid from './AprovacaoTypesGrid';

const PerfilForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: `Perfil ${isEditing ? 'atualizado' : 'criado'} com sucesso!`,
      description: "🚧 Funcionalidade em desenvolvimento.",
    });
    navigate('/configuracoes/usuarios/perfis');
  };

  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Editar Perfil' : 'Novo Perfil'} - APoio</title>
      </Helmet>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Editar Perfil' : 'Novo Perfil'}</CardTitle>
            <CardDescription>Defina um conjunto de permissões e aprovações para um grupo de usuários.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dados Básicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Perfil</Label>
                  <Input id="nome" placeholder="Ex: Gestor de Operações" required />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox id="ativo" defaultChecked />
                  <Label htmlFor="ativo">Perfil Ativo</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea id="descricao" placeholder="Descreva as responsabilidades e acessos deste perfil." />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Módulos e Permissões</h3>
              <PermissionsGrid permissions={{}} onPermissionChange={() => {}} />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Aprovações Permitidas</h3>
              <AprovacaoTypesGrid selectedTypes={{}} onTypeChange={() => {}} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/configuracoes/usuarios/perfis')}>Cancelar</Button>
            <Button type="submit">Salvar Perfil</Button>
          </CardFooter>
        </Card>
      </form>
    </>
  );
};

export default PerfilForm;