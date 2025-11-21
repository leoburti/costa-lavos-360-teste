import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function GeoKPIs({ data }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <MapPin className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Distância Total</p>
            <h3 className="text-2xl font-bold">{data.distanciaTotal.toFixed(1)} km</h3>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-full">
            <Clock className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tempo em Campo</p>
            <h3 className="text-2xl font-bold">{data.tempoTotal.toFixed(1)} h</h3>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-full">
            <CheckCircle className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Chamados Concluídos</p>
            <h3 className="text-2xl font-bold">{data.chamadosConcluidos}</h3>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Alertas Geofencing</p>
            <h3 className="text-2xl font-bold">{data.alertasTotal}</h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}