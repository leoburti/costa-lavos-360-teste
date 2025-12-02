import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { useDeliveryMock } from '@/hooks/useDeliveryMock';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Map, Settings2, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const RotasList = () => {
  const navigate = useNavigate();
  const { routes, loading } = useDeliveryMock();

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet><title>Rotas de Entrega | Delivery</title></Helmet>
      
      <PageHeader 
        title="Gestão de Rotas" 
        description="Planejamento e otimização de rotas de distribuição."
        breadcrumbs={[{ label: 'Delivery', path: '/entregas' }, { label: 'Rotas' }]}
        actions={
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate('/entregas/rotas/otimizacao')}>
                    <Settings2 className="mr-2 h-4 w-4" /> Otimização
                </Button>
                <Button onClick={() => navigate('/entregas/rotas/planejamento')}>
                    <Map className="mr-2 h-4 w-4" /> Planejar Nova Rota
                </Button>
            </div>
        }
      />

      <Card>
        <CardContent className="p-0">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead>Rota</TableHead>
                        <TableHead>Motorista</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Entregas</TableHead>
                        <TableHead>Distância / Tempo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={7} className="text-center py-8">Carregando rotas...</TableCell></TableRow>
                    ) : routes.map(rota => (
                        <TableRow key={rota.id} className="hover:bg-slate-50">
                            <TableCell className="font-medium">{rota.name}</TableCell>
                            <TableCell>{rota.driverName}</TableCell>
                            <TableCell>{formatDate(rota.date)}</TableCell>
                            <TableCell>{rota.deliveriesCount}</TableCell>
                            <TableCell>
                                <div className="flex flex-col text-xs text-slate-600">
                                    <span>{rota.distance}</span>
                                    <span>{rota.time}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={rota.status === 'concluida' ? 'success' : 'secondary'} className="capitalize">
                                    {rota.status.replace('_', ' ')}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon">
                                    <Eye className="h-4 w-4 text-slate-500" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RotasList;