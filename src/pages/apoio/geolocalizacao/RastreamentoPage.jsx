
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Map as MapIcon, Navigation, User, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/LoadingSpinner';

const libraries = ["places"];

const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '600px'
};

// Default center (São Paulo)
const defaultCenter = {
  lat: -23.550520,
  lng: -46.633308
};

const RastreamentoPage = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const [map, setMap] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { toast } = useToast();

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  const fetchLocations = useCallback(async () => {
    setIsLoadingData(true);
    try {
      // Busca as últimas localizações registradas de cada profissional
      const { data, error } = await supabase.rpc('get_latest_locations');

      if (error) throw error;
      
      const uniqueLocations = data.map(loc => ({
        id: loc.id,
        lat: Number(loc.latitude),
        lng: Number(loc.longitude),
        name: loc.nome || 'Profissional Desconhecido',
        email: loc.email,
        timestamp: loc.data_hora,
        type: loc.tipo,
        address: loc.endereco
      }));
      
      setLocations(uniqueLocations);
      
      if (uniqueLocations.length > 0 && map && !selectedLocation) {
         const bounds = new window.google.maps.LatLngBounds();
         uniqueLocations.forEach(loc => bounds.extend({ lat: loc.lat, lng: loc.lng }));
         if(map) map.fitBounds(bounds);
      }

    } catch (error) {
      console.error('Erro ao buscar localizações:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível buscar as localizações dos profissionais."
      });
    } finally {
      setIsLoadingData(false);
    }
  }, [toast, map, selectedLocation]);

  useEffect(() => {
    if (isLoaded) {
      fetchLocations();
      const interval = setInterval(fetchLocations, 30000); // Atualiza a cada 30 segundos
      return () => clearInterval(interval);
    }
  }, [isLoaded, fetchLocations]);

  if (loadError) {
    return (
      <Card className="m-6">
        <CardHeader>
          <CardTitle>Erro no Mapa</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-10 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg font-semibold">Erro ao carregar o Google Maps.</p>
            <p className="text-sm text-muted-foreground">Verifique a chave da API ou sua conexão com a internet.</p>
        </CardContent>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rastreamento em Tempo Real</h1>
          <p className="text-muted-foreground">Monitore a localização da equipe de campo via Google Maps.</p>
        </div>
        <Button onClick={fetchLocations} variant="outline" disabled={isLoadingData}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingData ? 'animate-spin' : ''}`} />
          {isLoadingData ? 'Atualizando...' : 'Atualizar Agora'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        <Card className="lg:col-span-3 border-0 shadow-md overflow-hidden h-full flex flex-col">
          <CardHeader className="bg-white border-b px-6 py-4 shrink-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapIcon className="h-5 w-5 text-blue-600" />
              Mapa da Equipe
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={defaultCenter}
              zoom={10}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={{
                 streetViewControl: true,
                 mapTypeControl: true,
                 fullscreenControl: true,
                 zoomControl: true,
              }}
            >
              {locations.map(loc => (
                <Marker
                  key={loc.id}
                  position={{ lat: loc.lat, lng: loc.lng }}
                  onClick={() => setSelectedLocation(loc)}
                  title={loc.name}
                  animation={window.google.maps.Animation.DROP}
                />
              ))}

              {selectedLocation && (
                <InfoWindow
                  position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                  onCloseClick={() => setSelectedLocation(null)}
                >
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <h3 className="font-bold text-sm">{selectedLocation.name}</h3>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{selectedLocation.email}</p>
                    
                    <div className="space-y-1 border-t pt-2 mt-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Status:</span>
                        <Badge variant={selectedLocation.type === 'checkin' ? 'success' : 'secondary'} className="text-[10px] px-1 py-0 h-5 capitalize">
                          {selectedLocation.type || 'Ativo'}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Última atualização:</span><br/>
                        {new Date(selectedLocation.timestamp).toLocaleString()}
                      </div>
                      {selectedLocation.address && (
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="font-medium">Local aproximado:</span><br/>
                          {selectedLocation.address}
                        </div>
                      )}
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </CardContent>
        </Card>

        <Card className="h-full flex flex-col">
          <CardHeader className="px-4 py-4 border-b shrink-0">
            <CardTitle className="text-base">Profissionais Ativos</CardTitle>
            <CardDescription>
              {locations.length} {locations.length === 1 ? 'profissional' : 'profissionais'} localizados
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            {locations.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Nenhum profissional localizado recentemente.
              </div>
            ) : (
              <div className="divide-y">
                {locations.map((loc) => (
                  <button
                    key={loc.id}
                    className={`w-full text-left p-3 hover:bg-slate-50 transition-colors flex items-start gap-3 ${selectedLocation?.id === loc.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                    onClick={() => {
                      setSelectedLocation(loc);
                      map?.panTo({ lat: loc.lat, lng: loc.lng });
                      map?.setZoom(15);
                    }}
                  >
                    <div className="bg-blue-100 p-2 rounded-full">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{loc.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{loc.email}</p>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                        <Navigation className="h-3 w-3" />
                        {new Date(loc.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RastreamentoPage;
