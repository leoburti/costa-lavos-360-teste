import React from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/PageHeader';
import { useConfigMock } from '@/hooks/useConfigMock';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

const IntegrationsPage = () => {
  const { integrations, loading } = useConfigMock();

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet><title>Integrações | Config</title></Helmet>
      
      <PageHeader 
        title="Integrações" 
        description="Conecte o sistema a ferramentas externas."
        breadcrumbs={[{ label: 'Configurações', path: '/configuracoes' }, { label: 'Integrações' }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id} className={integration.status === 'conectado' ? 'border-green-200 bg-green-50/30' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{integration.name}</CardTitle>
                <Badge variant={integration.status === 'conectado' ? 'success' : 'secondary'}>
                  {integration.status === 'conectado' ? 'Conectado' : 'Desconectado'}
                </Badge>
              </div>
              <CardDescription>{integration.description}</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">Configurar</Button>
              {integration.status === 'conectado' ? (
                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">Desconectar</Button>
              ) : (
                <Button size="sm">Conectar</Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default IntegrationsPage;