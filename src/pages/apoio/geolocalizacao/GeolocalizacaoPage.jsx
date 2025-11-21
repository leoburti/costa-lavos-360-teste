import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Route } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet-async';

const GeolocalizacaoPage = () => {
  const { toast } = useToast();

  const handleAction = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "🚧 Esta funcionalidade ainda não foi implementada.",
    });
  };

  return (
    <>
      <Helmet>
        <title>Geolocalização - Módulo de Apoio</title>
        <meta name="description" content="Página de geolocalização no módulo de apoio." />
      </Helmet>
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mapa de Operações</h1>
            <p className="text-muted-foreground">Visualize a localização da sua equipe e clientes em tempo real.</p>
          </div>
          <Button onClick={handleAction}>
            <Route className="w-4 h-4 mr-2" />
            Otimizar Rotas
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mapa em Tempo Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
              <div className="text-center text-muted-foreground">
                <MapPin className="mx-auto h-12 w-12" />
                <p className="mt-2">O mapa interativo está em desenvolvimento.</p>
                <p className="text-sm">Em breve você poderá ver a localização da equipe aqui.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default GeolocalizacaoPage;