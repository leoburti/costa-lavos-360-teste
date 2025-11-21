import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker, InfoWindow } from '@react-google-maps/api';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Map as MapIcon, 
  Navigation, 
  Clock, 
  Calendar, 
  User, 
  Car, 
  Bike, 
  Footprints, 
  Bus,
  RefreshCw,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

const libraries = ['places'];

const containerStyle = {
  width: '100%',
  height: '600px'
};

const defaultCenter = {
  lat: -23.550520,
  lng: -46.633308
};

const RotasPage = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyDZ2P7qxLLMJzC-xVs6Q5P6hykQ36XT0JU",
    libraries
  });

  const [map, setMap] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [routeIndex, setRouteIndex] = useState(0);
  const [travelMode, setTravelMode] = useState('DRIVING');
  const [professionals, setProfessionals] = useState([]);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeStats, setRouteStats] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { toast } = useToast();
  
  // Refs for polling
  const selectedProfessionalRef = useRef(selectedProfessional);
  const travelModeRef = useRef(travelMode);

  useEffect(() => {
    selectedProfessionalRef.current = selectedProfessional;
  }, [selectedProfessional]);

  useEffect(() => {
    travelModeRef.current = travelMode;
  }, [travelMode]);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  // Fetch professionals list
  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const { data, error } = await supabase
          .from('apoio_usuarios')
          .select('id, nome, email, status')
          .eq('status', 'ativo');

        if (error) throw error;
        setProfessionals(data || []);
      } catch (error) {
        console.error('Erro ao buscar profissionais:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar a lista de profissionais."
        });
      }
    };

    fetchProfessionals();
  }, []);

  // Calculate Route Function
  const calculateRoute = async () => {
    if (!selectedProfessionalRef.current || !window.google) return;

    setIsLoadingRoute(true);
    try {
      // 1. Get Professional's Current Location
      const { data: locationData, error: locError } = await supabase
        .from('apoio_geolocalizacao')
        .select('latitude, longitude, data_hora')
        .eq('profissional_id', selectedProfessionalRef.current.id)
        .order('data_hora', { ascending: false })
        .limit(1)
        .single();

      // Default start point if no location found (e.g., Office in SP)
      const origin = locationData 
        ? { lat: Number(locationData.latitude), lng: Number(locationData.longitude) }
        : defaultCenter;

      // 2. Get Assigned Tasks (Chamados) for the day as Waypoints
      // Assuming 'apoio_chamados' has client location or we use a mock for demo if addresses are missing
      const { data: tasksData, error: tasksError } = await supabase
        .from('apoio_chamados')
        .select(`
          id, 
          status, 
          prioridade,
          apoio_clientes_comodato (endereco, nome_fantasia)
        `)
        .eq('profissional_sugerido_id', selectedProfessionalRef.current.id)
        .neq('status', 'concluido') // Only pending tasks
        .limit(5); // Limit for demo

      if (tasksError) throw tasksError;

      // Prepare waypoints
      // Note: In a real app, we would geocode these addresses. 
      // For this demo, we'll simulate waypoints around the origin if geocoding isn't available/implemented in backend
      const waypoints = tasksData
        .filter(t => t.apoio_clientes_comodato?.endereco)
        .map(t => ({
          location: t.apoio_clientes_comodato.endereco,
          stopover: true
        }));

      // If no real waypoints, let's add a dummy destination for demonstration of the route
      let destination = waypoints.length > 0 ? waypoints.pop().location : { lat: origin.lat - 0.02, lng: origin.lng - 0.02 };

      const directionsService = new window.google.maps.DirectionsService();
      
      const results = await directionsService.route({
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        travelMode: window.google.maps.TravelMode[travelModeRef.current],
        provideRouteAlternatives: true,
        optimizeWaypoints: true
      });

      setDirectionsResponse(results);
      setRouteIndex(0); // Reset to first route
      setLastUpdated(new Date());

      // Update stats for the first route
      if (results.routes.length > 0) {
        const route = results.routes[0];
        let distance = 0;
        let duration = 0;
        route.legs.forEach(leg => {
          distance += leg.distance.value;
          duration += leg.duration.value;
        });
        setRouteStats({
          distance: (distance / 1000).toFixed(1) + ' km',
          duration: Math.round(duration / 60) + ' min',
          summary: route.summary
        });
      }

    } catch (error) {
      console.error('Erro ao calcular rota:', error);
      if (error.code === 'ZERO_RESULTS') {
        toast({
          title: "Rota não encontrada",
          description: "Não foi possível encontrar um caminho entre os pontos.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro na rota",
          description: "Falha ao calcular o trajeto. Verifique os endereços.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // Trigger route calculation when selection changes
  useEffect(() => {
    if (selectedProfessional && isLoaded) {
      calculateRoute();
    } else {
      setDirectionsResponse(null);
      setRouteStats(null);
    }
  }, [selectedProfessional, travelMode, isLoaded]);

  // Real-time update polling
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedProfessionalRef.current) {
        calculateRoute();
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Handle route index change (Alternative Routes)
  useEffect(() => {
    if (directionsResponse && directionsResponse.routes[routeIndex]) {
      const route = directionsResponse.routes[routeIndex];
      let distance = 0;
      let duration = 0;
      route.legs.forEach(leg => {
        distance += leg.distance.value;
        duration += leg.duration.value;
      });
      setRouteStats({
        distance: (distance / 1000).toFixed(1) + ' km',
        duration: Math.round(duration / 60) + ' min',
        summary: route.summary
      });
    }
  }, [routeIndex, directionsResponse]);


  if (loadError) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="text-center text-red-500">
          <h3 className="text-lg font-bold">Erro ao carregar o Google Maps</h3>
          <p>Verifique a chave da API ou sua conexão.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Navigation className="h-8 w-8 text-blue-600" />
            Navegação e Rotas
          </h1>
          <p className="text-muted-foreground">Planejamento e acompanhamento de rotas em tempo real.</p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Atualizado: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={calculateRoute} variant="outline" size="sm" disabled={isLoadingRoute || !selectedProfessional}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingRoute ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Sidebar - Controls & List */}
        <Card className="lg:col-span-3 flex flex-col h-full border-0 shadow-md">
          <CardHeader className="px-4 py-4 border-b shrink-0">
            <CardTitle className="text-base">Configuração da Rota</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-6 flex-1 overflow-y-auto">
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Data da Rota</label>
              <div className="relative">
                <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Modo de Transporte</label>
              <Tabs value={travelMode} onValueChange={setTravelMode} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="DRIVING" title="Carro"><Car className="h-4 w-4" /></TabsTrigger>
                  <TabsTrigger value="TRANSIT" title="Transporte Público"><Bus className="h-4 w-4" /></TabsTrigger>
                  <TabsTrigger value="BICYCLING" title="Bicicleta"><Bike className="h-4 w-4" /></TabsTrigger>
                  <TabsTrigger value="WALKING" title="A pé"><Footprints className="h-4 w-4" /></TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Profissionais ({professionals.length})</label>
              <ScrollArea className="h-[300px] rounded-md border p-2">
                <div className="space-y-1">
                  {professionals.map((prof) => (
                    <button
                      key={prof.id}
                      onClick={() => setSelectedProfessional(prof)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                        selectedProfessional?.id === prof.id 
                          ? 'bg-blue-100 text-blue-700 font-medium' 
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${selectedProfessional?.id === prof.id ? 'bg-blue-600' : 'bg-slate-300'}`} />
                      <span className="truncate">{prof.nome}</span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {routeStats && (
              <div className="bg-slate-50 p-4 rounded-lg border space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  Resumo da Viagem
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Distância</p>
                    <p className="text-lg font-bold text-slate-900">{routeStats.distance}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tempo Estimado</p>
                    <p className="text-lg font-bold text-slate-900">{routeStats.duration}</p>
                  </div>
                </div>
                {routeStats.summary && (
                  <div>
                    <p className="text-xs text-muted-foreground">Via</p>
                    <p className="text-sm font-medium truncate" title={routeStats.summary}>{routeStats.summary}</p>
                  </div>
                )}
                
                {directionsResponse?.routes.length > 1 && (
                  <div className="pt-2 border-t">
                    <label className="text-xs font-medium mb-1 block">Rotas Alternativas</label>
                    <Select 
                      value={routeIndex.toString()} 
                      onValueChange={(val) => setRouteIndex(parseInt(val))}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Selecione a rota" />
                      </SelectTrigger>
                      <SelectContent>
                        {directionsResponse.routes.map((route, idx) => (
                          <SelectItem key={idx} value={idx.toString()}>
                            Rota {idx + 1} ({route.summary})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {!selectedProfessional && (
              <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <p className="text-xs text-yellow-700">Selecione um profissional para visualizar a rota planejada.</p>
              </div>
            )}

          </CardContent>
        </Card>

        {/* Map Area */}
        <Card className="lg:col-span-9 border-0 shadow-md overflow-hidden flex flex-col">
          <CardContent className="p-0 flex-1 relative">
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={defaultCenter}
              zoom={12}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={{
                streetViewControl: true,
                mapTypeControl: true,
                fullscreenControl: true,
                zoomControl: true,
              }}
            >
              {directionsResponse && (
                <DirectionsRenderer
                  directions={directionsResponse}
                  routeIndex={routeIndex}
                  options={{
                    polylineOptions: {
                      strokeColor: '#2563eb',
                      strokeWeight: 5,
                      strokeOpacity: 0.8
                    },
                    suppressMarkers: false // Let Google render markers A/B
                  }}
                />
              )}
              
              {/* Show current position marker if available separately */}
              {selectedProfessional && !directionsResponse && (
                 <Marker position={defaultCenter} title="Posição Atual (Simulada)" />
              )}
            </GoogleMap>
            
            {isLoadingRoute && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 backdrop-blur-sm">
                <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
                  <LoadingSpinner />
                  <p className="text-sm font-medium mt-2 text-slate-600">Calculando melhor rota...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RotasPage;