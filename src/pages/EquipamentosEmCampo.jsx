import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useFilters } from '@/contexts/FilterContext';
import { useClientEquipments } from '@/hooks/useClientEquipments';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ClientSearch from '@/components/ClientSearch'; // Updated import
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HardHat, ServerCrash, PackageSearch } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';

const EquipmentsTable = ({ data, loading, error }) => {
  if (loading) {
    return (
      <div className="space-y-2 mt-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10 px-4 bg-muted/50 rounded-lg">
        <ServerCrash className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-semibold text-destructive">Erro ao carregar equipamentos</p>
        <p className="text-sm text-muted-foreground max-w-sm">{error.message || String(error)}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10 px-4 bg-muted/50 rounded-lg">
        <PackageSearch className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-semibold text-foreground">Nenhum equipamento encontrado</p>
        <p className="text-sm text-muted-foreground">Este cliente não possui equipamentos registrados.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Modelo</TableHead>
          <TableHead>Série</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Data de Instalação</TableHead>
          <TableHead>Fonte</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((equip) => (
          <TableRow key={equip.id}>
            <TableCell>{equip.nome}</TableCell>
            <TableCell>{equip.modelo}</TableCell>
            <TableCell>{equip.serie}</TableCell>
            <TableCell>
              <Badge variant={equip.status === 'Ativo' || equip.status === 'instalado' ? 'default' : 'secondary'}>
                {equip.status}
              </Badge>
            </TableCell>
            <TableCell>
              {equip.data_instalacao ? format(parseISO(equip.data_instalacao), 'dd/MM/yyyy') : 'N/A'}
            </TableCell>
            <TableCell>
              <Badge variant={equip.source === 'erp' ? 'outline' : 'default'} className="capitalize">
                {equip.source}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const EquipamentosEmCampo = () => {
  const { filters } = useFilters();
  const [selectedClient, setSelectedClient] = useState(null);

  const clientParams = useMemo(() => ({
    ...filters,
    p_cliente_id: selectedClient ? `${selectedClient.cliente_id}-${selectedClient.loja}` : null,
  }), [filters, selectedClient]);
  
  const { data, loading, error } = useClientEquipments(clientParams.p_cliente_id);

  return (
    <>
      <Helmet>
        <title>Equipamentos em Campo - Costa Lavos</title>
      </Helmet>
      <div className="space-y-6 p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0">
                <h1 className="text-3xl font-bold tracking-tight">Equipamentos em Campo</h1>
                <p className="text-muted-foreground">Consulte os equipamentos instalados por cliente.</p>
            </div>
        </div>

        <Card>
            <CardHeader>
              <CardTitle>Filtro por Cliente</CardTitle>
              <CardDescription>Busque e selecione um cliente para visualizar a lista de equipamentos vinculados a ele.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-md">
                <ClientSearch 
                  selectedValue={selectedClient}
                  onSelect={setSelectedClient} 
                  placeholder="Selecione um cliente..."
                />
              </div>
            </CardContent>
        </Card>
        
        {selectedClient && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HardHat className="mr-2 h-5 w-5" />
                Equipamentos de: <span className="ml-2 font-semibold text-primary">{selectedClient.nome_fantasia || selectedClient.razao_social}</span>
              </CardTitle>
              <CardDescription>
                Lista de todos os equipamentos (ERP e locais) associados ao cliente selecionado.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <EquipmentsTable data={data} loading={loading} error={error} />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default EquipamentosEmCampo;