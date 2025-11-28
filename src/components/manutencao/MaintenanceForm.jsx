import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  Loader2, 
  MapPin, 
  FileText, 
  CheckCircle2,
  Save,
  X,
  Wrench,
  AlertTriangle
} from 'lucide-react';
import { useClientSearch } from '@/hooks/useClientSearch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { format } from 'date-fns';
import ComodatoEquipmentSelector from './ComodatoEquipmentSelector';
import ClientOwnedEquipmentForm from './ClientOwnedEquipmentForm';
import PartsSelector from './PartsSelector';
import CheckInCheckOut from '@/components/CheckInCheckOut';
import { TooltipProvider } from "@/components/ui/tooltip";
import { supabase } from '@/lib/customSupabaseClient';

const MaintenanceForm = ({ onCancel, onSaveSuccess, equipmentToEdit }) => {
  const { toast } = useToast();
  const { user } = useSupabaseAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Geolocation State
  const [checkInData, setCheckInData] = useState(null);
  const [checkOutData, setCheckOutData] = useState(null);
  
  // Separate state for different equipment sources
  const [selectedComodato, setSelectedComodato] = useState([]);
  const [selectedClientOwned, setSelectedClientOwned] = useState([]);
  
  const [selectedParts, setSelectedParts] = useState([]);
  
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm({
    defaultValues: {
      service_date: format(new Date(), 'yyyy-MM-dd'),
      technician_name: user?.user_metadata?.full_name || user?.email || 'Técnico Atual',
      cost: 0,
      maintenance_type: 'preventiva'
    }
  });

  // Use a ref to track if we've already handled the edit prop to prevent loops
  const hasInitializedEdit = React.useRef(false);

  // Handle equipmentToEdit safely
  useEffect(() => {
    if (equipmentToEdit && !hasInitializedEdit.current) {
      hasInitializedEdit.current = true;
      console.log("Editing equipment:", equipmentToEdit);
      // Logic to populate form would go here, ensuring it runs only once
    }
  }, [equipmentToEdit]);
  
  // Combined list of all selected equipments for downstream logic
  const allSelectedEquipments = useMemo(() => {
    return [...selectedComodato, ...selectedClientOwned];
  }, [selectedComodato, selectedClientOwned]);

  // Hook for searching clients
  const { clients, isLoading: isLoadingClients } = useClientSearch(searchTerm);

  // Update total cost when parts change
  useEffect(() => {
    const partsTotal = selectedParts.reduce((acc, part) => acc + (part.quantity * (part.unitPrice || 0)), 0);
    setValue('cost', partsTotal.toFixed(2));
  }, [selectedParts, setValue]);

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = () => setIsSearching(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const selectClient = useCallback((client) => {
    setSelectedClient(client);
    setValue('client_id', client.code);
    setValue('client_store', client.store);
    setValue('client_name', client.fantasy_name || client.name);
    setSearchTerm('');
    setIsSearching(false);
    
    // Reset subsequent steps
    setSelectedComodato([]);
    setSelectedClientOwned([]);
    setSelectedParts([]);
    
    toast({
      description: `Cliente ${client.fantasy_name || client.name} selecionado.`,
    });
  }, [setValue, toast]);

  const onSubmit = useCallback(async (data) => {
    if (!user) {
        toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
        return;
    }

    // Validation: Must have Check-in
    if (!checkInData) {
        toast({
            title: "Check-in Obrigatório",
            description: "Realize o check-in antes de salvar.",
            variant: "destructive"
        });
        return;
    }

    // Validation: Must select at least one equipment
    if (allSelectedEquipments.length === 0) {
      toast({
        title: "Atenção",
        description: "Selecione pelo menos um equipamento (Comodato ou Próprio) para registrar a manutenção.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Save each maintenance record (one per equipment)
      for (const equip of allSelectedEquipments) {
          const maintenanceData = {
              equipment_id: equip.id, // Ensure equipment ID is UUID from 'equipment' table or similar
              user_id: user.id,
              tecnico: data.technician_name,
              data_inicio: checkInData.check_in_time || new Date().toISOString(),
              data_fim: checkOutData?.check_out_time || new Date().toISOString(),
              status: checkOutData ? 'concluido' : 'em_andamento',
              tipo: data.maintenance_type || 'preventiva',
              observacoes: data.description,
              
              // Check-in/out metadata
              check_in_time: checkInData.check_in_time,
              check_in_lat: checkInData.latitude,
              check_in_lng: checkInData.longitude,
              check_in_address: checkInData.address,
              
              check_out_time: checkOutData?.check_out_time,
              check_out_lat: checkOutData?.latitude,
              check_out_lng: checkOutData?.longitude,
              check_out_address: checkOutData?.address,
              
              client_id: selectedClient ? `${selectedClient.code}-${selectedClient.store}` : null
          };

          const { data: maintenanceRecord, error: insertError } = await supabase
              .from('maintenance')
              .insert(maintenanceData)
              .select()
              .single();

          if (insertError) throw insertError;

          // Save parts for this equipment
          const partsForThisEquip = selectedParts.filter(p => p.equipmentId === equip.id);
          if (partsForThisEquip.length > 0 && maintenanceRecord) {
              const partsData = partsForThisEquip.map(p => ({
                  maintenance_id: maintenanceRecord.id,
                  nome_peca: p.name,
                  quantidade: p.quantity,
                  custo_unitario: p.unitPrice
              }));
              
              const { error: partsError } = await supabase
                  .from('replaced_parts')
                  .insert(partsData);
                  
              if (partsError) console.error("Error saving parts:", partsError);
          }
      }
      
      // We manually call success handler to ensure parent state updates correctly
      if (onSaveSuccess) onSaveSuccess();
      else {
        reset();
        setSelectedClient(null);
        setSelectedComodato([]);
        setSelectedClientOwned([]);
        setSelectedParts([]);
        setCheckInData(null);
        setCheckOutData(null);
        
        toast({
            title: "Sucesso!",
            description: `Manutenção registrada para ${allSelectedEquipments.length} equipamento(s).`,
            variant: "success"
        });
      }
    } catch (error) {
      console.error("Error submitting maintenance:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o registro: " + error.message,
        variant: "destructive"
      });
    } finally {
        setIsSubmitting(false);
    }
  }, [checkInData, checkOutData, allSelectedEquipments, selectedParts, selectedClient, onSaveSuccess, reset, toast, user]);

  return (
    <TooltipProvider>
    <Card className="border-none shadow-sm bg-white">
      <CardContent className="p-0">
        {/* Header Section */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Registrar Manutenção</h2>
          </div>
          <p className="text-sm text-muted-foreground ml-11">
            Preencha os dados abaixo para registrar uma nova manutenção.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          
          {/* Top Section: Check-in */}
          <div className="px-6 pt-6">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <CheckInCheckOut
                    showCheckIn={true}
                    showCheckOut={false}
                    onCheckIn={setCheckInData}
                    record={{ check_in_time: checkInData?.check_in_time }}
                    title="1. Registro de Chegada (Check-in)"
                />
            </div>
          </div>

          <div className="p-6 space-y-8">
            
            {/* STEP 2: Selecionar Cliente */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-800">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-xs font-bold">2</div>
                <h3 className="font-medium">Selecionar Cliente</h3>
                </div>
                
                {!selectedClient ? (
                <div className="relative ml-8" onClick={(e) => e.stopPropagation()}>
                    <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input 
                        placeholder="Buscar cliente por nome ou código..." 
                        className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                        value={searchTerm}
                        onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsSearching(true);
                        }}
                        onFocus={() => setIsSearching(true)}
                    />
                    {isLoadingClients && (
                        <div className="absolute right-3 top-3">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        </div>
                    )}
                    </div>

                    {/* Search Results Dropdown */}
                    {isSearching && searchTerm.length >= 2 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-xl animate-in fade-in-0 zoom-in-95 duration-100 max-h-[300px] overflow-hidden">
                        {clients.length > 0 ? (
                        <ScrollArea className="h-[240px]">
                            <div className="p-1">
                            {clients.map((client) => (
                                <div 
                                key={`${client.code}-${client.store}`}
                                onClick={() => selectClient(client)}
                                className="flex flex-col p-3 hover:bg-blue-50/50 cursor-pointer rounded-md transition-all border-b last:border-0 border-gray-50 group"
                                >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm text-gray-900 group-hover:text-blue-700">
                                        {client.fantasy_name || client.name}
                                        </span>
                                        {client.has_equipment && (
                                            <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-700 bg-amber-50">
                                                <Wrench className="h-3 w-3 mr-1" /> Equip.
                                            </Badge>
                                        )}
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-600 group-hover:bg-white shrink-0 ml-2">
                                    {client.code}-{client.store}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                    <MapPin className="h-3 w-3" />
                                    <span className="truncate">{client.address || 'Sem endereço'}</span>
                                </div>
                                </div>
                            ))}
                            </div>
                        </ScrollArea>
                        ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            {isLoadingClients ? 'Buscando...' : 'Nenhum cliente encontrado.'}
                        </div>
                        )}
                    </div>
                    )}
                </div>
                ) : (
                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 flex justify-between items-center animate-in fade-in slide-in-from-top-2 ml-8">
                    <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-full border border-blue-100 shadow-sm text-blue-600">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{selectedClient.fantasy_name || selectedClient.name}</h4>
                            {selectedClient.has_equipment && (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
                                    <Wrench className="h-3 w-3" /> Possui Equipamentos
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-gray-500">{selectedClient.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="bg-white text-xs font-normal">
                            Cód: {selectedClient.code}-{selectedClient.store}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {selectedClient.address}
                        </span>
                        </div>
                    </div>
                    </div>
                    <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                        setSelectedClient(null);
                        setSelectedComodato([]);
                        setSelectedClientOwned([]);
                        setSelectedParts([]);
                    }}
                    className="text-muted-foreground hover:text-destructive hover:bg-red-50"
                    >
                    <X className="h-4 w-4 mr-2" /> Trocar
                    </Button>
                </div>
                )}
            </div>

            <Separator />

            {/* STEP 3: Equipamentos em Comodato */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-800">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-xs font-bold">3</div>
                <h3 className="font-medium">Selecionar Equipamentos em Comodato</h3>
                </div>
                <div className="ml-8">
                    <ComodatoEquipmentSelector 
                        clientId={selectedClient?.code} 
                        selectedEquipments={selectedComodato}
                        onSelectionChange={setSelectedComodato}
                    />
                </div>
            </div>

            <Separator />

            {/* STEP 4: Equipamentos do Cliente */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-800">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-xs font-bold">4</div>
                <h3 className="font-medium">Equipamentos Próprios do Cliente (Opcional)</h3>
                </div>
                <div className="ml-8">
                    <ClientOwnedEquipmentForm 
                        clientId={selectedClient?.code}
                        selectedEquipments={selectedClientOwned}
                        onSelectionChange={setSelectedClientOwned}
                    />
                </div>
            </div>

            <Separator />

            {/* STEP 5: Detalhes do Serviço */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-800">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-xs font-bold">5</div>
                <h3 className="font-medium">Detalhes da Manutenção</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-8">
                <div className="space-y-2">
                    <Label htmlFor="maintenance_type" className="text-xs uppercase text-muted-foreground font-semibold">Tipo de Manutenção*</Label>
                    <Select onValueChange={(val) => setValue('maintenance_type', val)} defaultValue="preventiva">
                    <SelectTrigger className="bg-gray-50/50 border-gray-200">
                        <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="preventiva">Preventiva</SelectItem>
                        <SelectItem value="corretiva">Corretiva</SelectItem>
                        <SelectItem value="instalacao">Instalação</SelectItem>
                        <SelectItem value="retirada">Retirada</SelectItem>
                    </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="service_date" className="text-xs uppercase text-muted-foreground font-semibold">Data do Serviço</Label>
                    <Input 
                    type="date" 
                    id="service_date"
                    className="bg-gray-50/50 border-gray-200"
                    {...register('service_date')}
                    />
                </div>

                <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="description" className="text-xs uppercase text-muted-foreground font-semibold">Descrição/Observações*</Label>
                    <Textarea 
                    id="description" 
                    placeholder="Descreva o problema encontrado e as ações realizadas..."
                    className="min-h-[100px] bg-gray-50/50 border-gray-200 resize-none"
                    {...register('description', { required: true })}
                    />
                    {errors.description && <span className="text-xs text-destructive">Campo obrigatório</span>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="next_maintenance" className="text-xs uppercase text-muted-foreground font-semibold">Próxima Manutenção (Opcional)</Label>
                    <Input 
                    type="date" 
                    id="next_maintenance"
                    className="bg-gray-50/50 border-gray-200"
                    {...register('next_maintenance')}
                    />
                </div>

                <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="technician" className="text-xs uppercase text-muted-foreground font-semibold">Técnico Responsável</Label>
                    <Input 
                    readOnly 
                    className="bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                    {...register('technician_name')}
                    />
                </div>
                </div>
            </div>

            <Separator />

            {/* STEP 6: Peças Substituídas */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-800">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-xs font-bold">6</div>
                <h3 className="font-medium">Peças Substituídas ({selectedParts.length})</h3>
                </div>

                <div className="ml-8 space-y-4">
                    {allSelectedEquipments.length === 0 ? (
                        <div className="p-4 bg-amber-50 text-amber-800 rounded-md border border-amber-200 text-sm flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Selecione ao menos um equipamento (Passo 3 ou 4) para adicionar peças.
                        </div>
                    ) : (
                        <PartsSelector 
                            selectedParts={selectedParts}
                            onPartsChange={setSelectedParts}
                            availableEquipments={allSelectedEquipments}
                        />
                    )}

                    <div className="flex justify-end">
                        <div className="w-full md:w-1/3 space-y-2">
                            <Label htmlFor="cost" className="text-xs uppercase text-muted-foreground font-semibold">Custo Total (Calculado)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500 text-sm">R$</span>
                                <Input 
                                    type="number" 
                                    id="cost"
                                    placeholder="0.00"
                                    readOnly
                                    className="bg-gray-100 border-gray-200 pl-9 font-bold text-gray-800"
                                    {...register('cost')}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Check-out and Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                    {/* Check-out Section placed right above footer actions */}
                    <CheckInCheckOut
                        showCheckIn={false}
                        showCheckOut={true}
                        onCheckOut={setCheckOutData}
                        disabled={!checkInData} 
                        record={{ 
                            check_in_time: checkInData?.check_in_time,
                            check_out_time: checkOutData?.check_out_time 
                        }} 
                        title="7. Registro de Saída (Check-out)"
                    />
                </div>
                
                <div className="flex justify-end gap-3 pb-1">
                    <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onCancel}
                    className="text-gray-600 border-gray-300 hover:bg-gray-50 h-10"
                    disabled={isSubmitting}
                    >
                    Cancelar
                    </Button>
                    <Button 
                    type="submit" 
                    disabled={!selectedClient || allSelectedEquipments.length === 0 || !checkInData || isSubmitting}
                    className="bg-primary hover:bg-primary/90 min-w-[140px] h-10"
                    >
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar Registro
                    </Button>
                </div>
            </div>

          </div>
        </form>
      </CardContent>
    </Card>
    </TooltipProvider>
  );
};

export default MaintenanceForm;