import { useState, useCallback } from 'react';

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getAddressFromCoordinates = useCallback(async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data && data.display_name) {
        return data.display_name;
      } else {
        return 'Endereço não encontrado';
      }
    } catch (e) {
      console.error("Error fetching address: ", e);
      return 'Erro ao buscar endereço';
    }
  }, []);

  const getLocation = useCallback(() => {
    return new Promise((resolve) => {
      setLoading(true);
      setError(null);
      
      if (!navigator.geolocation) {
        const msg = 'Geolocalização não é suportada pelo seu navegador.';
        console.error(msg);
        setError(msg);
        setLoading(false);
        resolve(null);
        return;
      }

      // Explicit timeout handling to be safe (10 seconds)
      const timeoutId = setTimeout(() => {
        const msg = 'Tempo limite de geolocalização excedido (10s). Verifique se a permissão de localização está ativa ou tente inserir manualmente.';
        console.error(msg);
        setError(msg);
        setLoading(false);
        resolve(null);
      }, 10000);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(timeoutId);
          const { latitude, longitude } = position.coords;
          const currentTimestamp = new Date();
          
          setLocation({ lat: latitude, lng: longitude });
          
          // Fetch address asynchronously but don't block the location return too long if possible
          // For better UX, we await it here so the user sees the address immediately
          const fetchedAddress = await getAddressFromCoordinates(latitude, longitude);
          setAddress(fetchedAddress);

          setLoading(false);
          resolve({
            location: { lat: latitude, lng: longitude },
            address: fetchedAddress,
            timestamp: currentTimestamp
          });
        },
        (err) => {
          clearTimeout(timeoutId);
          let errorMessage;
          switch(err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = "Permissão para geolocalização negada. Permita o acesso ou use a entrada manual.";
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = "Informação de localização indisponível. Verifique seu GPS.";
              break;
            case err.TIMEOUT:
              errorMessage = "A requisição de geolocalização expirou.";
              break;
            default:
              errorMessage = "Ocorreu um erro desconhecido na geolocalização.";
              break;
          }
          console.error("Geolocation error:", err);
          setError(errorMessage);
          setLoading(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 9000, maximumAge: 0 }
      );
    });
  }, [getAddressFromCoordinates]);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { location, address, error, loading, getLocation, clearError };
};