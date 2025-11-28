import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { searchEquipmentInventory } from '@/services/apoioSyncService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, RefreshCw, Layers, MapPin, Wrench } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from "@/components/ui/use-toast";
import CheckInCheckOut from '@/components/CheckInCheckOut';
import { supabase } from '@/lib/customSupabaseClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const InventoryItemActions = React.memo(({ item, onStartMaintenance, refreshInventory }) => {
  const { toast } = useToast();
  const [maintenanceRecord, setMaintenanceRecord] = useState(item.maintenance || {});

  useEffect(() => {
    // Only update if data actually changed to avoid loop
    if (JSON.stringify(item.maintenance || {}) !== JSON.stringify(maintenanceRecord)) {
        setMaintenanceRecord(item.maintenance || {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.maintenance]);

  const updateMaintenanceStatus = useCallback(async (updateData) => {
    try {
      let { data: existingMaint, error: findError } = await supabase
          .from('maintenance')
          .select('id')
          .eq('inventory_item_id', item.Chave_ID)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
      
      if (findError && findError.code !== 'PGRST116') {
          toast({ variant: 'destructive', title: 'Erro', description: findError.message });
          return;
      }

      let result;
      if (existingMaint) {
          result = await supabase.from('maintenance').update(updateData).eq('id', existingMaint.id).select().single();
      } else {
          let { data: eq, error: eqError } = await supabase.from('equipment').select('id').eq('serial', item.AA3_CHAPA).single();

          if (eqError && eqError.code !== 'PGRST116') {
              toast({ variant: "destructive", title: "Erro", description: eqError.message });
              return;
          }

          let equipmentId = eq?.id;
          if (!equipmentId) {
               const { data: newEq, error: createEqError } = await supabase.from('equipment').insert({ 
                 nome: item.Equipamento, 
                 serial: item.AA3_CHAPA, 
                 status: 'ativo' 
               }).select('id').single();
               
               if (createEqError) {
                  toast({ variant: "destructive", title: "Erro", description: createEqError.message });
                  return;
               }
               equipmentId = newEq.id;
          }
          
          result = await supabase.from('maintenance').insert({ 
            ...updateData, 
            inventory_item_id: item.Chave_ID, 
            equipment_id: equipmentId 
          }).select().single();
      }

      if (result.error) {
          toast({ variant: 'destructive', title: 'Erro', description: result.error.message });
      } else {
          setMaintenanceRecord(result.data);
          if(refreshInventory) refreshInventory();
      }
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Erro inesperado', description: e.message });
    }
  }, [item, toast, refreshInventory]);

  return (
    <Dialog>
        <TableRow>
            <TableCell>
            <div className="font-medium">{item.Equipamento}</div>
            <div className="text-xs text-muted-foreground">Cód: {item.Codigo} | Chapa: {item.AA3_CHAPA || 'N/A'}</div>
            </TableCell>
            <TableCell>
                <div>{item.Fantasia}</div>
                <div className="text-xs text-muted-foreground">{item.derivedLocation}</div>
            </TableCell>
            <TableCell>{item.Nome_Vendedor}</TableCell>
            <TableCell><Badge variant={item.derivedStatus === 'Ativo' ? 'success' : 'destructive'}>{item.derivedStatus}</Badge></TableCell>
            <TableCell className="text-right">{formatDate(item.Data_Venda)}</TableCell>
            <TableCell className="text-right space-x-2">
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <MapPin className="h-4 w-4 mr-2" />
                        Check-in/Out
                    </Button>
                </DialogTrigger>
                <Button variant="default" size="sm" onClick={() => onStartMaintenance(item)}>
                  <Wrench className="h-4 w-4 mr-2" />
                  Manutenção
                </Button>
            </TableCell>
        </TableRow>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Check-in/Check-out para {item.Equipamento}</DialogTitle>
            </DialogHeader>
            <CheckInCheckOut 
              record={maintenanceRecord}
              onCheckIn={updateMaintenanceStatus}
              onCheckOut={updateMaintenanceStatus}
            />
        </DialogContent>
    </Dialog>
  );
});

const EquipmentInventoryList = ({ onStartMaintenance }) => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [groupBy, setGroupBy] = useState('Fantasia');
  const [inventoryData, setInventoryData] = useState([]);
  const { toast } = useToast();
  
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isMounted.current) setDebouncedTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchInventory = useCallback(async () => {
    if (!isMounted.current) return;
    setLoading(true);
    
    try {
      console.log('[Inventory] Fetching with term:', debouncedTerm);
      const data = await searchEquipmentInventory(debouncedTerm);
      
      if (!isMounted.current) return;

      const processedData = (data || []).map((item, idx) => ({
        ...item,
        uniqueKey: item.Chave_ID || item.AA3_CHAPA || `temp-${idx}`,
        derivedStatus: item.AA3_STATUS || item.STAT || 'Ativo',
        derivedLocation: item.Loja_texto || item.Loja || 'Local N/A'
      }));
      
      setInventoryData(processedData);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      if (isMounted.current) {
        toast({ variant: 'destructive', title: 'Erro ao carregar inventário', description: error.message });
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [debouncedTerm]);

  const groupedInventory = useMemo(() => {
    const grouped = {};
    inventoryData.forEach(item => {
      let key = item[groupBy];
      if (!key || key === 'null') key = 'Não Definido';
      
      if (!grouped[key]) {
        grouped[key] = { active: [], inactive: [] };
      }
      
      const isActive = item.derivedStatus === 'Ativo' || !item.derivedStatus;
      if (isActive) {
        grouped[key].active.push(item);
      } else {
        grouped[key].inactive.push(item);
      }
    });
    return grouped;
  }, [inventoryData, groupBy]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const totalItems = inventoryData.length;
  const hasContent = Object.keys(groupedInventory).length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex sm:flex-row flex-col sm:items-center sm:justify-between gap-4">
            <div>
                <CardTitle>Inventário de Equipamentos em Campo</CardTitle>
                <CardDescription>
                    {loading ? 'Carregando inventário...' : `Total de ${totalItems} registros encontrados.`}
                </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Button variant="outline" size="sm" onClick={fetchInventory} disabled={loading}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
              </Button>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger className="w-[180px]">
                  <Layers className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Agrupar por..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fantasia">Por Fantasia</SelectItem>
                  <SelectItem value="Loja">Por Loja</SelectItem>
                  <SelectItem value="Nome_Vendedor">Por Vendedor</SelectItem>
                  <SelectItem value="AA3_STATUS">Por Status</SelectItem>
                  <SelectItem value="REDE">Por Rede</SelectItem>
                </SelectContent>
              </Select>
            </div>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por Fantasia, Equipamento, Chapa..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : !hasContent ? (
          <div className="text-center text-muted-foreground py-16">
            <p>Nenhum equipamento encontrado.</p>
          </div>
        ) : (
          <Accordion type="multiple" className="w-full">
            {Object.entries(groupedInventory).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)).map(([groupKey, groupData]) => {
              const activeCount = groupData.active.length;
              const inactiveCount = groupData.inactive.length;
              const totalGroupCount = activeCount + inactiveCount;

              if (totalGroupCount === 0) return null;

              return (
                <AccordionItem value={groupKey} key={groupKey}>
                  <AccordionTrigger>
                    <div className="flex justify-between items-center w-full pr-4">
                        <span className="font-semibold truncate max-w-[200px] sm:max-w-md" title={groupKey}>{groupKey}</span>
                        <div className="flex items-center gap-2 text-sm">
                            <Badge variant="outline">{totalGroupCount}</Badge>
                        </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="rounded-md border">
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Equipamento</TableHead>
                            <TableHead>Local</TableHead>
                            <TableHead>Vendedor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Data</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...groupData.active, ...groupData.inactive].map((item) => (
                              <InventoryItemActions 
                                key={item.uniqueKey} 
                                item={item}
                                onStartMaintenance={onStartMaintenance}
                                refreshInventory={fetchInventory}
                              />
                            ))}
                        </TableBody>
                        </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentInventoryList;