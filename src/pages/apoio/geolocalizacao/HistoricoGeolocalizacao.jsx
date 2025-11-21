import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Map } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';

const dummyHistory = [
  { id: 1, tipo: 'checkin', data_hora: '2025-11-19T09:00:00Z', coordenadas: '-23.55, -46.63', distancia: 5, foto: 'url_foto_1', observacoes: 'Iniciando atendimento.' },
  { id: 2, tipo: 'checkout', data_hora: '2025-11-19T10:30:00Z', coordenadas: '-23.55, -46.63', distancia: 8, foto: null, observacoes: 'Atendimento finalizado.' },
];

const HistoricoGeolocalizacao = ({ chamadoId }) => {
  const { toast } = useToast();

  const handleAction = (action, id) => {
    toast({ title: "Funcionalidade em desenvolvimento", description: `🚧 A ação "${action}" para o item ${id} ainda não foi implementada.` });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Geolocalização</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Coordenadas</TableHead>
              <TableHead>Distância (m)</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dummyHistory.map((item) => (
              <TableRow key={item.id}>
                <TableCell><Badge variant={item.tipo === 'checkin' ? 'success' : 'destructive'}>{item.tipo}</Badge></TableCell>
                <TableCell>{new Date(item.data_hora).toLocaleString('pt-BR')}</TableCell>
                <TableCell>{item.coordenadas}</TableCell>
                <TableCell>{item.distancia}</TableCell>
                <TableCell>{item.observacoes}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {item.foto && <DropdownMenuItem onClick={() => handleAction('Ver Foto', item.id)}><Eye className="mr-2 h-4 w-4" /> Ver Foto</DropdownMenuItem>}
                      <DropdownMenuItem onClick={() => handleAction('Ver no Mapa', item.id)}><Map className="mr-2 h-4 w-4" /> Ver no Mapa</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default HistoricoGeolocalizacao;