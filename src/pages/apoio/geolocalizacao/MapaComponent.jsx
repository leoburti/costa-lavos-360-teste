import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default icon issue with webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapaComponent = ({ professionalLocation, clientLocation, routePoints = [], radius = 150 }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return; // initialize map only once

    mapRef.current = L.map('map-container').setView([-23.5505, -46.6333], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapRef.current);

  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear previous layers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.Circle) {
        mapRef.current.removeLayer(layer);
      }
    });

    const markers = [];

    if (professionalLocation) {
      const profMarker = L.marker([professionalLocation.lat, professionalLocation.lng]).addTo(mapRef.current);
      profMarker.bindPopup("Sua Posição");
      markers.push(profMarker);
    }

    if (clientLocation) {
      const clientMarker = L.marker([clientLocation.lat, clientLocation.lng]).addTo(mapRef.current);
      clientMarker.bindPopup("Posição do Cliente");
      markers.push(clientMarker);

      // Draw radius circle
      L.circle([clientLocation.lat, clientLocation.lng], {
        color: 'blue',
        fillColor: '#3b82f6',
        fillOpacity: 0.2,
        radius: radius
      }).addTo(mapRef.current);
    }

    if (routePoints && routePoints.length > 1) {
      const latlngs = routePoints.map(p => [p.lat, p.lng]);
      L.polyline(latlngs, { color: 'red' }).addTo(mapRef.current);
    }
    
    if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        mapRef.current.fitBounds(group.getBounds().pad(0.5));
    }

  }, [professionalLocation, clientLocation, routePoints, radius]);

  return (
    <Card>
      <CardContent className="p-0">
        <div id="map-container" style={{ height: '400px', width: '100%' }}></div>
      </CardContent>
    </Card>
  );
};

export default MapaComponent;