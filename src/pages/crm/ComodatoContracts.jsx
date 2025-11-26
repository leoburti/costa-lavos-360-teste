
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const ComodatoContracts = () => {
  const { user, session } = useSupabaseAuth();
  const { toast } = useToast();

  useEffect(() => {
    console.log('[ComodatoContracts] Page mounted');
    console.log('[ComodatoContracts] User:', user?.email);
    console.log('[ComodatoContracts] Session active:', !!session);
  }, [user, session]);

  const handleNewContract = () => {
    toast({
      title: "Novo Contrato",
      description: "Funcionalidade de criação de contrato em desenvolvimento.",
    });
  };

  return (
    <div className="space-y-6 p-6">
      <Helmet>
        <title>Contratos de Comodato | CRM | Costa Lavos</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Contratos de Comodato</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os contratos de comodato dos seus clientes.
          </p>
        </div>
        <Button onClick={handleNewContract}>
          <Plus className="mr-2 h-4 w-4" /> Novo Contrato
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contratos Ativos</CardTitle>
          <CardDescription>Lista de contratos vigentes e assinados.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar contratos..." className="pl-8" />
            </div>
          </div>
          
          <div className="rounded-md border p-8 text-center text-muted-foreground bg-slate-50">
            <FileText className="mx-auto h-10 w-10 mb-3 text-slate-300" />
            <p>Nenhum contrato encontrado.</p>
            <p className="text-sm">Utilize o botão "Novo Contrato" para iniciar.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComodatoContracts;
