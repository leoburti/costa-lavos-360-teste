import { supabase } from '@/lib/customSupabaseClient';

/**
 * Gets the current user's geographical position.
 * @returns {Promise<GeolocationPosition>} A promise that resolves with the position object.
 */
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocalização não é suportada por este navegador."));
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000, // Increased timeout for better results
      maximumAge: 0,
    });
  });
};

/**
 * Converts GPS coordinates to a human-readable address using Nominatim (OpenStreetMap).
 * @param {number} lat - The latitude.
 * @param {number} lng - The longitude.
 * @returns {Promise<string>} A promise that resolves with the formatted address.
 */
export const getAddressFromCoordinates = async (lat, lng) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    if (!response.ok) {
      throw new Error(`Serviço de geolocalização indisponível. Status: ${response.status}`);
    }
    const data = await response.json();
    
    if (data && data.display_name) {
      return data.display_name;
    }
    
    if(data.error){
        throw new Error(`Erro do Nominatim: ${data.error}`);
    }

    throw new Error("Não foi possível encontrar um endereço para as coordenadas.");
  } catch (error) {
    console.error("Erro ao obter endereço das coordenadas via Nominatim:", error);
    // Return null instead of throwing to allow fallback
    return null; 
  }
};


/**
 * Calculates the distance between two geographical points using the Haversine formula.
 * @param {number} lat1 - Latitude of the first point.
 * @param {number} lon1 - Longitude of the first point.
 * @param {number} lat2 - Latitude of the second point.
 * @param {number} lon2 - Longitude of the second point.
 * @returns {number} The distance in kilometers.
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    return 0;
  }
    
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};