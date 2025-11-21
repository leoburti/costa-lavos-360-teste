import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/ui/use-toast';

const DeliverySettings = () => {
  const { toast } = useToast();

  const handleNotImplemented = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "🚧 Este recurso ainda não foi implementado. Você pode solicitar em um próximo prompt! 🚀",
    });
  };

  return (
    <>
      <Helmet>
        <title>Configurações - Gestão de Entregas</title>
        <meta name="description" content="Página para configurações do módulo de gestão de entregas." />
      </Helmet>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Configurações de Entregas</h1>
        <div className="flex items-center justify-center h-96 bg-muted rounded-md border border-dashed">
          <p className="text-muted-foreground">Conteúdo das Configurações virá aqui.</p>
        </div>
        <button onClick={handleNotImplemented} className="p-2 bg-primary text-primary-foreground rounded">
            Salvar Configurações
        </button>
      </div>
    </>
  );
};

export default DeliverySettings;