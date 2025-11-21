import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import PermissionsGrid from './PermissionsGrid';

const AcessoForm = () => {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: 'Em Desenvolvimento',
      description: 'A funcionalidade de salvar acessos ainda não foi implementada.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Acessos de Usuário</CardTitle>
        <CardDescription>
          Ajuste as permissões de acesso para um usuário específico.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <PermissionsGrid />
        <div className="flex justify-end">
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AcessoForm;