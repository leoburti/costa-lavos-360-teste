
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, MapPin, CheckCircle, AlertCircle, Clock, Navigation } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const GeolocationDisplay = ({ label, timestamp, address, lat, lng }) => {
  if (!timestamp) return null;

  // Using Google Maps Embed API for simple coordinate display
  const mapSrc = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

  return (
    <div className="text-sm p-3 bg-muted rounded-md mt-2 border">
      <p className="font-semibold text-foreground flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-600" />
        {label}
      </p>
      <div className="text-muted-foreground mt-1 space-y-1 pl-6">
        <p className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          {format(new Date(timestamp), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
        </p>
        {address && (
            <p className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                {address}
            </p>
        )}
        <p className="text-xs">
          (Lat: {Number(lat)?.toFixed(5)}, Lng: {Number(lng)?.toFixed(5)})
        </p>
        <div className="w-full h-48 mt-3 rounded-md overflow-hidden border bg-background relative">
             <iframe
                title={`${label} Map`}
                width="100%"
                height="100%"
                frameBorder="0"
                src={mapSrc}
                allowFullScreen
                loading="lazy"
                className="absolute inset-0"
             ></iframe>
        </div>
      </div>
    </div>
  );
};

const CheckInCheckOut = ({ 
  record, 
  onCheckIn, 
  onCheckOut,
  disabled = false,
  isCheckInLoading = false,
  isCheckOutLoading = false,
  showCheckIn = true,
  showCheckOut = true,
  title
}) => {
  const { getLocation, error: geoError, clearError: clearGeoError } = useGeolocation();
  const { toast } = useToast();
  const [localCheckInLoading, setLocalCheckInLoading] = useState(false);
  const [localCheckOutLoading, setLocalCheckOutLoading] = useState(false);
  
  // Manual entry state
  const [manualMode, setManualMode] = useState(false);
  const [manualData, setManualData] = useState({ lat: '', lng: '', address: '' });

  const displayTitle = title || (showCheckIn && showCheckOut ? "Controle de Ponto Geográfico" : (showCheckIn ? "Registro de Chegada (Check-in)" : "Registro de Saída (Check-out)"));

  const handleCheckIn = async () => {
    if (manualMode) {
        if (!manualData.lat || !manualData.lng) {
            toast({ variant: 'destructive', title: 'Dados incompletos', description: 'Informe Latitude e Longitude para o modo manual.' });
            return;
        }
        const geoData = {
            check_in_time: new Date().toISOString(),
            check_in_lat: parseFloat(manualData.lat),
            check_in_lng: parseFloat(manualData.lng),
            check_in_address: manualData.address || 'Localização inserida manualmente',
        };
        await onCheckIn(geoData);
        return;
    }

    clearGeoError();
    setLocalCheckInLoading(true);
    const locationData = await getLocation();
    setLocalCheckInLoading(false);

    if (locationData) {
      const geoData = {
        check_in_time: locationData.timestamp.toISOString(),
        check_in_lat: locationData.location.lat,
        check_in_lng: locationData.location.lng,
        check_in_address: locationData.address,
      };
      await onCheckIn(geoData);
    } else {
       // Error is handled by useGeolocation hook and displayed below
       // We don't call onCheckIn here to avoid infinite loading in parent
    }
  };

  const handleCheckOut = async () => {
    if (!record.check_in_time) {
      toast({
        variant: 'destructive',
        title: 'Ação inválida',
        description: 'Você precisa fazer o check-in antes de fazer o check-out.',
      });
      return;
    }

    if (manualMode) {
        if (!manualData.lat || !manualData.lng) {
            toast({ variant: 'destructive', title: 'Dados incompletos', description: 'Informe Latitude e Longitude para o modo manual.' });
            return;
        }
        const geoData = {
            check_out_time: new Date().toISOString(),
            check_out_lat: parseFloat(manualData.lat),
            check_out_lng: parseFloat(manualData.lng),
            check_out_address: manualData.address || 'Localização inserida manualmente',
        };
        await onCheckOut(geoData);
        return;
    }

    clearGeoError();
    setLocalCheckOutLoading(true);
    const locationData = await getLocation();
    setLocalCheckOutLoading(false);

    if (locationData) {
      const geoData = {
        check_out_time: locationData.timestamp.toISOString(),
        check_out_lat: locationData.location.lat,
        check_out_lng: locationData.location.lng,
        check_out_address: locationData.address,
      };
      await onCheckOut(geoData);
    }
  };
  
  const hasCheckIn = !!record?.check_in_time;
  const hasCheckOut = !!record?.check_out_time;
  const loadingCheckIn = isCheckInLoading || localCheckInLoading;
  const loadingCheckOut = isCheckOutLoading || localCheckOutLoading;

  if (!showCheckIn && !showCheckOut) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
            <h3 className="font-semibold text-base">{displayTitle}</h3>
            <p className="text-sm text-muted-foreground">
            {manualMode ? 'Insira as coordenadas manualmente.' : 'Utilize o GPS para registrar o local.'}
            </p>
        </div>
        <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-8"
            onClick={() => setManualMode(!manualMode)}
        >
            {manualMode ? 'Usar GPS Automático' : 'Inserir Manualmente'}
        </Button>
      </div>

      {manualMode && (
        <div className="p-4 border rounded-md bg-muted/50 space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-600 mb-2">
                <AlertCircle className="h-4 w-4" />
                Modo Manual Ativado
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <Label htmlFor="lat" className="text-xs">Latitude</Label>
                    <Input 
                        id="lat" 
                        placeholder="-23.5505" 
                        value={manualData.lat} 
                        onChange={(e) => setManualData(prev => ({...prev, lat: e.target.value}))}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="lng" className="text-xs">Longitude</Label>
                    <Input 
                        id="lng" 
                        placeholder="-46.6333" 
                        value={manualData.lng} 
                        onChange={(e) => setManualData(prev => ({...prev, lng: e.target.value}))}
                    />
                </div>
            </div>
            <div className="space-y-1">
                <Label htmlFor="addr" className="text-xs">Endereço (Opcional)</Label>
                <Input 
                    id="addr" 
                    placeholder="Rua Exemplo, 123" 
                    value={manualData.address} 
                    onChange={(e) => setManualData(prev => ({...prev, address: e.target.value}))}
                />
            </div>
        </div>
      )}

      <div className={`grid gap-4 ${showCheckIn && showCheckOut ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
        {showCheckIn && (
            <Button
            onClick={handleCheckIn}
            disabled={loadingCheckIn || hasCheckIn || disabled}
            variant={hasCheckIn ? "secondary" : "default"}
            className="w-full"
            >
            {loadingCheckIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (manualMode ? <Navigation className="mr-2 h-4 w-4" /> : <MapPin className="mr-2 h-4 w-4" />)}
            {hasCheckIn ? 'Check-in Realizado' : (manualMode ? 'Salvar Check-in Manual' : 'Fazer Check-in GPS')}
            </Button>
        )}
        
        {showCheckOut && (
            <Button
            onClick={handleCheckOut}
            disabled={loadingCheckOut || !hasCheckIn || hasCheckOut || disabled}
            variant={hasCheckOut ? "secondary" : "default"}
            className="w-full"
            >
            {loadingCheckOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (manualMode ? <Navigation className="mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />)}
            {hasCheckOut ? 'Check-out Realizado' : (manualMode ? 'Salvar Check-out Manual' : 'Fazer Check-out GPS')}
            </Button>
        )}
      </div>

      {geoError && !manualMode && (
        <div className="text-sm text-destructive flex flex-col gap-2 p-3 border border-destructive/20 bg-destructive/10 rounded">
            <div className="flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4"/>
                Erro de Localização
            </div>
            <p>{geoError}</p>
            <Button variant="outline" size="sm" className="w-full mt-1 border-destructive/30 hover:bg-destructive/20" onClick={() => setManualMode(true)}>
                Mudar para Inserção Manual
            </Button>
        </div>
      )}

      <div className="space-y-2">
        {showCheckIn && (
            <GeolocationDisplay
            label="Check-in (Chegada)"
            timestamp={record?.check_in_time}
            address={record?.check_in_address}
            lat={record?.check_in_lat}
            lng={record?.check_in_lng}
            />
        )}
        {showCheckOut && (
            <GeolocationDisplay
            label="Check-out (Saída)"
            timestamp={record?.check_out_time}
            address={record?.check_out_address}
            lat={record?.check_out_lat}
            lng={record?.check_out_lng}
            />
        )}
      </div>
    </div>
  );
};

export default CheckInCheckOut;
