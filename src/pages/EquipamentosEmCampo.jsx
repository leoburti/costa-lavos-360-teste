import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Loader2, Search, Store, Calendar, User, Package, Users, CheckCircle, XCircle, ChevronRight, Network } from 'lucide-react';
import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDebounce } from '@/hooks/useDebounce';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';

const statusMap = {
  'ATIVO': { variant: 'success', icon: CheckCircle, label: 'Ativo' },
  'INATIVO': { variant: 'destructive', icon: XCircle, label: 'Inativo' },
};

const getEquipmentStatus = (item) => {
  return (item.Fantasia && item.Fantasia.trim().toUpperCase() === 'COSTA LAVOS') ? 'INATIVO' : 'ATIVO';
};

const StatusBadge = ({ status }) => {
  const statusInfo = statusMap[status] || { variant: 'secondary', label: status };
  return (
    <Badge variant={statusInfo.variant} className="flex items-center gap-1.5 whitespace-nowrap">
      {statusInfo.icon && <statusInfo.icon className="h-3 w-3" />}
      {statusInfo.label}
    </Badge>
  );
};

const EquipmentInstanceItem = ({ item }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-3 bg-background/30 rounded-md border border-border/50"
  >
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div className="flex-1">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5" title="Data de Instalação">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(item.Data_Venda)}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate" title="Vendedor">
            <User className="h-3 w-3" />
            <span className="truncate">{item.Nome_Vendedor}</span>
          </div>
        </div>
      </div>
      <StatusBadge status={getEquipmentStatus(item)} />
    </div>
  </motion.div>
);

const EquipmentGroupItem = ({ group }) => (
  <AccordionItem value={group.equipmentName} className="border-b-0">
    <AccordionTrigger className="p-3 bg-muted/50 rounded-t-lg hover:no-underline data-[state=open]:rounded-b-none">
      <div className="flex items-center justify-between w-full gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Package className="h-5 w-5 text-primary" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground truncate">{group.equipmentName}</p>
            <p className="text-xs text-muted-foreground">{group.instances.length} unidade(s)</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />
      </div>
    </AccordionTrigger>
    <AccordionContent className="p-3 bg-muted/20 rounded-b-lg">
      <div className="space-y-2">
        {group.instances.map((instance, index) => (
          <EquipmentInstanceItem key={`${instance['ID Cliente']}-${instance.Cod_Pro}-${index}`} item={instance} />
        ))}
      </div>
    </AccordionContent>
  </AccordionItem>
);

const ClientEquipmentItem = ({ client }) => (
  <AccordionItem value={`${client.clientId}-${client.clientName}`} className="border-b-0">
    <AccordionTrigger className="p-3 bg-card rounded-t-lg hover:no-underline data-[state=open]:rounded-b-none">
      <div className="flex items-center justify-between w-full gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Store className="h-5 w-5 text-primary" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground truncate">{client.clientName}</p>
            <p className="text-xs text-muted-foreground">{client.totalEquipments} equipamento(s) em {client.equipmentGroups.length} tipo(s)</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />
      </div>
    </AccordionTrigger>
    <AccordionContent className="p-3 bg-muted/20 rounded-b-lg">
      <Accordion type="multiple" className="space-y-2">
        {client.equipmentGroups.map((group) => (
          <EquipmentGroupItem key={group.equipmentName} group={group} />
        ))}
      </Accordion>
    </AccordionContent>
  </AccordionItem>
);

const NetworkGroupItem = ({ network }) => (
  <AccordionItem value={network.networkName} className="border-b border-border/50 bg-card rounded-lg mb-3 shadow-sm hover:shadow-md transition-shadow duration-300">
    <AccordionTrigger className="p-4 text-left hover:no-underline">
      <div className="flex items-center justify-between w-full gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-muted rounded-md">
            <Network className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base text-foreground truncate">{network.networkName}</p>
            <p className="text-xs text-muted-foreground">{network.totalEquipments} equipamento(s) em {network.clients.length} cliente(s)</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="border-t border-border/50 px-4 pt-4 pb-2">
        <Accordion type="multiple" className="space-y-2">
          {network.clients.map((client) => (
            <ClientEquipmentItem key={`${client.clientId}-${client.clientName}`} client={client} />
          ))}
        </Accordion>
      </div>
    </AccordionContent>
  </AccordionItem>
);

const EquipamentosEmCampo = () => {
  const { filters } = useFilters();
  const [loading, setLoading] = useState(true);
  const [allInventoryData, setAllInventoryData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { toast } = useToast();

  const fetchAllInventory = useCallback(async () => {
    setLoading(true);
    console.log('[EquipamentosEmCampo] Attempting to fetch all inventory data via Edge Function.');
    const { data, error } = await supabase.functions.invoke('get-all-inventory');

    if (error) {
      console.error('[EquipamentosEmCampo] Error fetching inventory from Edge Function:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao buscar inventário.',
        description: `Não foi possível carregar os dados de equipamentos: ${error.message}.`,
      });
      setAllInventoryData([]);
      setLoading(false);
      return;
    }
    
    console.log('[EquipamentosEmCampo] Successfully fetched inventory data.');
    const processedInvData = data.map(item => ({
      ...item,
      QTD: (item.QTD === null || item.QTD === undefined || Number(item.QTD) === 0) ? 1 : Number(item.QTD)
    }));
    setAllInventoryData(processedInvData);
    setLoading(false);
  }, [toast]);


  useEffect(() => {
    fetchAllInventory();
  }, [fetchAllInventory]);
  
  const networkDrilldownData = useMemo(() => {
    if (loading) return [];
    
    let data = allInventoryData;

    if (debouncedSearchTerm) {
      const lowercasedFilter = debouncedSearchTerm.toLowerCase();
      data = data.filter(item =>
        (item.Fantasia && item.Fantasia.toLowerCase().includes(lowercasedFilter)) ||
        (item.Equipamento && item.Equipamento.toLowerCase().includes(lowercasedFilter)) ||
        (item['ID Cliente'] && item['ID Cliente'].toString().toLowerCase().includes(lowercasedFilter)) ||
        (item.Nome_Vendedor && item.Nome_Vendedor.toLowerCase().includes(lowercasedFilter)) ||
        (item.Nome_Supervisor && item.Nome_Supervisor.toLowerCase().includes(lowercasedFilter)) ||
        (item.Nome_Rede && item.Nome_Rede.toLowerCase().includes(lowercasedFilter))
      );
    }
    
    if (statusFilter !== 'all') {
      data = data.filter(item => getEquipmentStatus(item) === statusFilter);
    }

    const contextFilteredData = data.filter(item => {
      const supervisorMatch = !filters.supervisors || filters.supervisors.length === 0 || filters.supervisors.includes(item.Nome_Supervisor);
      const sellerMatch = !filters.sellers || filters.sellers.length === 0 || filters.sellers.includes(item.Nome_Vendedor);
      const regionMatch = !filters.regions || filters.regions.length === 0 || filters.regions.includes(item.REGIAO);
      return supervisorMatch && sellerMatch && regionMatch;
    });

    const groupedByNetwork = contextFilteredData.reduce((acc, item) => {
      const networkName = item.Nome_Rede || 'Sem Rede';
      if (!acc[networkName]) {
        acc[networkName] = [];
      }
      acc[networkName].push(item);
      return acc;
    }, {});

    return Object.entries(groupedByNetwork).map(([networkName, networkItems]) => {
      const groupedByClient = networkItems.reduce((acc, item) => {
        const clientId = item['ID Cliente'] || 'unknown';
        const clientName = item.Fantasia || `Cliente ${clientId}`;
        const clientKey = `${clientId}-${clientName}`;

        if (!acc[clientKey]) {
          acc[clientKey] = { clientId, clientName, equipments: [] };
        }
        acc[clientKey].equipments.push(item);
        return acc;
      }, {});

      const clients = Object.values(groupedByClient).map(({ clientId, clientName, equipments }) => {
        const groupedByEquipment = equipments.reduce((acc, item) => {
          const equipmentName = item.Equipamento || 'Equipamento não identificado';
          if (!acc[equipmentName]) {
            acc[equipmentName] = [];
          }
          acc[equipmentName].push(item);
          return acc;
        }, {});

        const equipmentGroups = Object.entries(groupedByEquipment).map(([equipmentName, instances]) => ({
          equipmentName,
          instances: instances.sort((a, b) => new Date(b.Data_Venda) - new Date(a.Data_Venda)),
        })).sort((a, b) => b.instances.length - a.instances.length);

        return { clientId, clientName, totalEquipments: equipments.length, equipmentGroups };
      }).sort((a, b) => b.totalEquipments - a.totalEquipments);

      return {
        networkName,
        clients,
        totalEquipments: networkItems.length,
        clientCount: clients.length,
      };
    }).sort((a, b) => {
      if (a.networkName === 'Sem Rede') return 1;
      if (b.networkName === 'Sem Rede') return -1;
      return b.totalEquipments - a.totalEquipments;
    });
  }, [allInventoryData, filters, statusFilter, debouncedSearchTerm, loading]);

  const kpis = useMemo(() => {
    const dataForKpis = networkDrilldownData.flatMap(network => network.clients.flatMap(client => client.equipmentGroups.flatMap(group => group.instances)));
    const totalEquipments = dataForKpis.length;
    const clientsWithEquipmentCount = new Set(dataForKpis.map(item => item['ID Cliente'])).size;
    
    let activeCount = 0;
    let inactiveCount = 0;

    dataForKpis.forEach(item => {
      if (getEquipmentStatus(item) === 'ATIVO') {
        activeCount++;
      } else {
        inactiveCount++;
      }
    });

    return {
      totalEquipments,
      clientsWithEquipment: clientsWithEquipmentCount,
      active: activeCount,
      inactive: inactiveCount,
    };
  }, [networkDrilldownData]);

  return (
    <>
      <Helmet>
        <title>Equipamentos em Campo - Costa Lavos</title>
        <meta name="description" content="Inventário de todos os equipamentos instalados em clientes." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 sm:p-6 space-y-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Equipamentos em Campo
            </h1>
            <p className="text-muted-foreground mt-1">Inventário de equipamentos por Rede e Cliente.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Equipamentos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? <Loader2 className="h-6 w-6 animate-spin" /> : kpis.totalEquipments}</div>
              <p className="text-xs text-muted-foreground">de {allInventoryData.length} linhas carregadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes com Equipamentos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? <Loader2 className="h-6 w-6 animate-spin" /> : kpis.clientsWithEquipment}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipamentos Ativos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? <Loader2 className="h-6 w-6 animate-spin" /> : kpis.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipamentos Inativos</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? <Loader2 className="h-6 w-6 animate-spin" /> : kpis.inactive}</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-card rounded-lg border">
            <h2 className="text-lg font-semibold">Inventário por Rede ({networkDrilldownData.length})</h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  {Object.entries(statusMap).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea className="h-[55vh] pr-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-semibold">Buscando todos os registros via Edge Function...</p>
                <p className="text-muted-foreground">Esta é a abordagem definitiva para garantir que nenhum dado seja deixado para trás.</p>
              </div>
            ) : networkDrilldownData.length > 0 ? (
              <Accordion type="multiple" className="space-y-0">
                {networkDrilldownData.map((network) => (
                  <NetworkGroupItem key={network.networkName} network={network} />
                ))}
              </Accordion>
            ) : (
              <div className="flex items-center justify-center h-full bg-card rounded-lg border border-dashed">
                <p className="text-muted-foreground">Nenhum equipamento encontrado para os filtros selecionados.</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </motion.div>
    </>
  );
};

export default EquipamentosEmCampo;