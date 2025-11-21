import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useEquipmentInventory } from '@/hooks/useEquipmentInventory';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, RefreshCw, Layers, MapPin, CheckCircle, Wrench } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from "@/components/ui/use-toast";
import CheckInCheckOut from '@/components/CheckInCheckOut';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const InventoryItemActions = ({ item, onStartMaintenance, refreshInventory }) => {
  const { toast } = useToast();
  const [maintenanceRecord, setMaintenanceRecord] = useState(item.maintenance || {});

  const updateMaintenanceStatus = async (updateData) => {
    // Check if a maintenance record already exists for this inventory item
    let { data: existingMaint, error: findError } = await supabase
        .from('maintenance')
        .select('id')
        .eq('inventory_item_id', item.Chave_ID)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    
    if (findError && findError.code !== 'PGRST116') { // PGRST116: no rows found
        toast({ variant: 'destructive', title: 'Erro ao buscar manutenção', description: findError.message });
        return;
    }

    let result;
    if (existingMaint) {
        // Update existing record
        result = await supabase.from('maintenance').update(updateData).eq('id', existingMaint.id).select().single();
    } else {
        // Find corresponding equipment in catalog
        let { data: eq, error: eqError } = await supabase.from('equipment').select('id').eq('serial', item.AA3_CHAPA).single();

        if (eqError && eqError.code !== 'PGRST116') {
            toast({ variant: "destructive", title: "Erro ao buscar equipamento no catálogo", description: eqError.message });
            return;
        }

        let equipmentId = eq?.id;
        if (!equipmentId) {
             const { data: newEq, error: createEqError } = await supabase.from('equipment').insert({ nome: item.Equipamento, serial: item.AA3_CHAPA, status: 'ativo' }).select('id').single();
             if (createEqError) {
                toast({ variant: "destructive", title: "Erro ao criar equipamento no catálogo", description: createEqError.message });
                return;
             }
             equipmentId = newEq.id;
        }
        
        // Create new record
        result = await supabase.from('maintenance').insert({ ...updateData, inventory_item_id: item.Chave_ID, equipment_id: equipmentId }).select().single();
    }

    if (result.error) {
        toast({ variant: 'destructive', title: 'Erro ao atualizar status', description: result.error.message });
    } else {
        setMaintenanceRecord(result.data);
        refreshInventory();
    }
  };

  const handleCheckIn = async (geoData) => {
    await updateMaintenanceStatus(geoData);
  };
  
  const handleCheckOut = async (geoData) => {
    await updateMaintenanceStatus(geoData);
  };

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
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
            />
        </DialogContent>
    </Dialog>
  );
};


const EquipmentInventoryList = ({ onStartMaintenance }) => {
  const {
    groupedInventory,
    loading,
    searchTerm,
    setSearchTerm,
    groupBy,
    setGroupBy,
    refresh,
    totalItems,
  } = useEquipmentInventory('Fantasia');

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
              <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
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
                  <SelectItem value="Vendedor">Por Vendedor</SelectItem>
                  <SelectItem value="Status">Por Status</SelectItem>
                  <SelectItem value="Rede">Por Rede</SelectItem>
                </SelectContent>
              </Select>
            </div>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por Fantasia, Equipamento, Chapa, Loja, Vendedor, Rede..."
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
            <p>Nenhum equipamento encontrado no inventário.</p>
            <p className="text-sm mt-2">{searchTerm ? `Tente refinar sua busca por "${searchTerm}".` : "Verifique os filtros ou tente atualizar."}</p>
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
                        <span className="font-semibold truncate" title={groupKey}>{groupKey}</span>
                        <div className="flex items-center gap-2 text-sm">
                            <Badge variant="outline">{totalGroupCount} Total</Badge>
                            <Badge variant="success">{activeCount} Ativo(s)</Badge>
                            <Badge variant="destructive">{inactiveCount} Inativo(s)</Badge>
                        </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="rounded-md border">
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Equipamento</TableHead>
                            <TableHead>Fantasia/Local</TableHead>
                            <TableHead>Vendedor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Data Venda</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...groupData.active, ...groupData.inactive].map((item) => (
                              <InventoryItemActions 
                                key={item.Chave_ID} 
                                item={item}
                                onStartMaintenance={onStartMaintenance}
                                refreshInventory={refresh}
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