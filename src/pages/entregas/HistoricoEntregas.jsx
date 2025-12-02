import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/PageHeader';
import { useDeliveryMock } from '@/hooks/useDeliveryMock';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Search, Filter } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const HistoricoEntregas = () => {
  const { deliveries, loading } = useDeliveryMock();
  const [search, setSearch] = useState('');

  // Filter only completed/cancelled deliveries for history
  const historyDeliveries = useMemo(() => {
    return deliveries.filter(d => 
      ['entregue', 'cancelado', 'falha'].includes(d.status) &&
      (d.client.toLowerCase().includes(search.toLowerCase()) || d.trackingId.toLowerCase().includes(search.toLowerCase()))
    );
  }, [deliveries, search]);

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet><title>Histórico de Entregas | Delivery</title></Helmet>
      
      <PageHeader 
        title="Histórico de Entregas" 
        description="Consulte o registro completo de operações finalizadas."
        breadcrumbs={[{ label: 'Delivery', path: '/entregas' }, { label: 'Histórico' }]}
        actions={
            <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Exportar CSV
            </Button>
        }
      />

      <Card>
        <CardContent className="p-4">
            <div className="flex items-center gap-4 mb-6">
                <div className="relative w-96">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Buscar no histórico..." 
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="ghost"><Filter className="h-4 w-4 mr-2" /> Filtros Avançados</Button>
            </div>

            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead>Data Conclusão</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Motorista</TableHead>
                        <TableHead>Status Final</TableHead>
                        <TableHead>Observações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={6} className="text-center py-8">Carregando...</TableCell></TableRow>
                    ) : historyDeliveries.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum registro encontrado.</TableCell></TableRow>
                    ) : historyDeliveries.map(d => (
                        <TableRow key={d.id}>
                            <TableCell>{formatDate(d.date)}</TableCell>
                            <TableCell className="font-mono text-xs">{d.trackingId}</TableCell>
                            <TableCell>{d.client}</TableCell>
                            <TableCell>{d.driverName}</TableCell>
                            <TableCell>
                                <Badge variant={d.status === 'entregue' ? 'success' : 'destructive'} className="capitalize">
                                    {d.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-slate-500 truncate max-w-[200px]">
                                {d.history[0]?.obs || '-'}
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

export default HistoricoEntregas;