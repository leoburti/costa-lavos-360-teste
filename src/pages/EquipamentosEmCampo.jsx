import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useFilters } from '@/contexts/FilterContext';
import { useClientEquipments } from '@/hooks/useClientEquipments';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HardHat, ServerCrash, PackageSearch, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import PageSkeleton from '@/components/PageSkeleton';
import { EmptyState } from '@/components/common';

const EquipmentsTable = ({ data, loading, error }) => {
  if (loading) return null; 

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
        <p className="text-sm text-muted-foreground">Este cliente não possui equipamentos registrados ou nenhum cliente foi selecionado.</p>
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
        {data.map((equip, idx) => (
          <TableRow key={equip.id || idx}>
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
  
  // Only use the FIRST client if multiple are selected, as the RPC/Component is designed for single client view.
  // This is a limitation of the current RPC structure which we preserve.
  const selectedClientId = filters.clients && filters.clients.length > 0 ? filters.clients[0] : null;

  const { data, loading, error } = useClientEquipments(selectedClientId);

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      <Helmet>
        <title>Equipamentos em Campo - Costa Lavos</title>
      </Helmet>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
              <h1 className="text-3xl font-bold tracking-tight">Equipamentos em Campo</h1>
              <p className="text-muted-foreground">Consulte os equipamentos instalados por cliente.</p>
          </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardHat className="h-5 w-5" />
            {selectedClientId ? (
               <>Equipamentos do Cliente: <span className="text-primary">{selectedClientId}</span></>
            ) : (
               "Selecione um Cliente"
            )}
          </CardTitle>
          <CardDescription>
            {selectedClientId 
              ? "Lista de equipamentos (ERP e locais) vinculados." 
              : "Utilize o filtro global no cabeçalho para selecionar um cliente e visualizar seus equipamentos."}
          </CardDescription>
        </CardHeader>
        <CardContent>
            {!selectedClientId ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-blue-50 p-4 rounded-full mb-4">
                        <Users className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Nenhum Cliente Selecionado</h3>
                    <p className="text-slate-500 max-w-md">
                        Para visualizar os equipamentos em campo, por favor selecione um cliente específico usando o filtro global (ícone de filtros no topo à direita).
                    </p>
                </div>
            ) : (
                <EquipmentsTable data={data} loading={loading} error={error} />
            )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipamentosEmCampo;