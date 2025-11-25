
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, AlertTriangle, UserCheck as UserSearch, PackageSearch, Check, Edit, X } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const MaintenanceForm = ({ equipmentToEdit, onSaveSuccess, onCancel }) => {
    const { user } = useAuth();
    const { toast } = useToast();

    // State for Client Search
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [isClientPopoverOpen, setIsClientPopoverOpen] = useState(false);
    const [loadingClients, setLoadingClients] = useState(false);

    // State for Equipment Selection
    const [availableEquipment, setAvailableEquipment] = useState([]);
    const [selectedEquipments, setSelectedEquipments] = useState([]); // Array of objects
    const [loadingEquipment, setLoadingEquipment] = useState(false);
    const [isEquipmentPopoverOpen, setIsEquipmentPopoverOpen] = useState(false);

    // Chapa Update State
    const [chapaValue, setChapaValue] = useState('');
    const [isChapaUpdating, setIsChapaUpdating] = useState(false);
    const [editingChapaForId, setEditingChapaForId] = useState(null);

    const initialFormState = useMemo(() => ({
        id: null,
        user_id: user?.id,
        tecnico: user?.user_metadata?.full_name || '',
        data_inicio: new Date().toISOString(),
        data_fim: null,
        status: 'Pendente',
        tipo: '',
        observacoes: '',
        proxima_manutencao: '',
        custo: 0,
    }), [user]);

    const [form, setForm] = useState(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);

    // Initialize if editing existing record
    useEffect(() => {
        if (equipmentToEdit) {
            // Mock client object from equipment data
            const clientMock = {
                Codigo: equipmentToEdit.Codigo,
                Fantasia: equipmentToEdit.Fantasia,
                Loja: equipmentToEdit.Loja
            };
            setSelectedClient(clientMock);
            setSelectedEquipments([equipmentToEdit]);
            setAvailableEquipment([equipmentToEdit]); // Ensure it shows up
        }
    }, [equipmentToEdit]);

    // Fetch Clients on search
    const handleSearchClients = async (search) => {
        if (!search || search.length < 2) return;
        setLoadingClients(true);
        
        console.log("🔍 [DEBUG] Iniciando busca de clientes em bd_cl_inv. Termo:", search);

        try {
            // Using distinct approximation by fetching and filtering in JS
            // Ideally an RPC or distinct query on DB side is better for large datasets
            const { data, error } = await supabase
                .from('bd_cl_inv')
                .select('Codigo, Fantasia, Loja, Equipamento')
                .or(`Fantasia.ilike.%${search}%,Codigo.ilike.%${search}%`)
                .limit(50);

            if (error) {
                console.error("❌ [DEBUG] Erro na query bd_cl_inv:", error);
                throw error;
            }

            console.log(`✅ [DEBUG] Registros brutos retornados de bd_cl_inv: ${data?.length || 0}`);

            if (data && data.length > 0) {
                // Client-side distinct by Codigo+Loja
                // Also counting equipment for debug purposes
                const clientMap = new Map();
                
                data.forEach(item => {
                    const key = `${item.Codigo}-${item.Loja}`;
                    if (!clientMap.has(key)) {
                        clientMap.set(key, {
                            Codigo: item.Codigo,
                            Fantasia: item.Fantasia,
                            Loja: item.Loja,
                            equipmentCount: 0
                        });
                    }
                    clientMap.get(key).equipmentCount++;
                });

                const uniqueClients = Array.from(clientMap.values());
                
                console.log(`📊 [DEBUG] Clientes únicos encontrados: ${uniqueClients.length}`);
                uniqueClients.forEach(c => {
                    console.log(`   - Cliente: ${c.Fantasia} (Cod: ${c.Codigo}, Loja: ${c.Loja}) - Equipamentos no batch: ${c.equipmentCount}`);
                });

                setClients(uniqueClients);
            } else {
                console.warn("⚠️ [DEBUG] Nenhum registro encontrado na busca.");
                setClients([]);
            }
        } catch (error) {
            console.error("Error searching clients:", error);
            toast({ variant: 'destructive', title: 'Erro na busca', description: 'Falha ao buscar clientes.' });
        } finally {
            setLoadingClients(false);
        }
    };

    // Fetch Equipment when client is selected
    useEffect(() => {
        const fetchEquipment = async () => {
            if (!selectedClient) {
                setAvailableEquipment([]);
                return;
            }
            
            console.log(`🔍 [DEBUG] Buscando equipamentos para cliente: ${selectedClient.Fantasia} (Cod: ${selectedClient.Codigo}, Loja: ${selectedClient.Loja})`);

            // If we are in "Edit Mode", we don't want to refetch and wipe selection unless intentional
            if (equipmentToEdit && selectedClient.Codigo === equipmentToEdit.Codigo) {
                return;
            }

            setLoadingEquipment(true);
            try {
                const { data, error } = await supabase
                    .from('bd_cl_inv')
                    .select('*')
                    .eq('Codigo', selectedClient.Codigo)
                    .eq('Loja', selectedClient.Loja);

                if (error) {
                    console.error("❌ [DEBUG] Erro ao buscar equipamentos:", error);
                    throw error;
                }
                
                console.log(`✅ [DEBUG] Equipamentos encontrados: ${data?.length || 0}`);
                if (data?.length > 0) {
                    console.log("   - Exemplo:", data[0]);
                }

                setAvailableEquipment(data || []);
            } catch (error) {
                console.error("Error fetching equipment:", error);
                toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao carregar equipamentos do cliente.' });
            } finally {
                setLoadingEquipment(false);
            }
        };

        fetchEquipment();
    }, [selectedClient, equipmentToEdit]);

    const handleClientSelect = (client) => {
        console.log("👉 [DEBUG] Cliente selecionado:", client);
        setSelectedClient(client);
        setSelectedEquipments([]); // Clear equipment when client changes
        setIsClientPopoverOpen(false);
    };

    const toggleEquipmentSelection = (equipment) => {
        setSelectedEquipments(prev => {
            const exists = prev.find(item => item.Chave_ID === equipment.Chave_ID);
            if (exists) {
                return prev.filter(item => item.Chave_ID !== equipment.Chave_ID);
            } else {
                return [...prev, equipment];
            }
        });
    };

    const handleInputChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleUpdateChapa = async (equipmentId) => {
        if (!chapaValue) return;
        setIsChapaUpdating(true);
        try {
            const { error } = await supabase
                .from('bd_cl_inv')
                .update({ AA3_CHAPA: chapaValue })
                .eq('Chave_ID', equipmentId);

            if (error) throw error;

            toast({ title: 'Sucesso', description: 'Chapa atualizada.' });
            
            // Update local state
            setAvailableEquipment(prev => prev.map(item => 
                item.Chave_ID === equipmentId ? { ...item, AA3_CHAPA: chapaValue } : item
            ));
            setSelectedEquipments(prev => prev.map(item => 
                item.Chave_ID === equipmentId ? { ...item, AA3_CHAPA: chapaValue } : item
            ));
            setEditingChapaForId(null);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: error.message });
        } finally {
            setIsChapaUpdating(false);
        }
    };

    const validateForm = () => {
        const requiredFields = { tipo: "Tipo de Manutenção", observacoes: "Descrição/Observações" };
        
        if (!selectedClient) {
            setFormError("Selecione um cliente.");
            return false;
        }
        if (selectedEquipments.length === 0) {
            setFormError("Selecione pelo menos um equipamento.");
            return false;
        }

        for (const [field, label] of Object.entries(requiredFields)) {
            if (!form[field]) {
                setFormError(`Campo obrigatório: ${label}`);
                return false;
            }
        }
        setFormError(null);
        return true;
    };

    const saveMaintenance = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        setFormError(null);

        try {
            console.log("💾 [DEBUG] Iniciando salvamento de manutenção...");
            const promises = selectedEquipments.map(async (equipment) => {
                // 1. Ensure Equipment exists in 'equipment' table (mirroring 'bd_cl_inv')
                let equipmentId;
                
                // Try to find by serial (AA3_CHAPA) or create new
                let { data: eq, error: findError } = await supabase
                    .from('equipment')
                    .select('id')
                    .eq('serial', equipment.AA3_CHAPA || equipment.Chave_ID) // Fallback to Chave_ID if no serial
                    .maybeSingle();

                if (findError) throw findError;

                if (eq) {
                    equipmentId = eq.id;
                } else {
                    // Create new
                    console.log("   [DEBUG] Equipamento não encontrado na tabela 'equipment', criando novo...");
                    const { data: newEq, error: createError } = await supabase
                        .from('equipment')
                        .insert({
                            nome: equipment.Equipamento,
                            serial: equipment.AA3_CHAPA || equipment.Chave_ID,
                            ativo_fixo: equipment.Codigo,
                            status: 'ativo', 
                            local: equipment.Loja_texto || equipment.Loja,
                        })
                        .select('id')
                        .single();
                    
                    if (createError) throw createError;
                    equipmentId = newEq.id;
                }

                // 2. Insert Maintenance Record
                const maintenancePayload = {
                    ...form,
                    equipment_id: equipmentId,
                    inventory_item_id: equipment.Chave_ID,
                    client_id: selectedClient.Codigo, // Save client code as requested
                    data_fim: new Date().toISOString(), // Auto-close for now, or leave null if tracking duration
                    status: 'Concluído', // Or form.status
                    custo: parseFloat(form.custo) || 0,
                };

                // Remove id from payload if null to let DB handle auto-increment/uuid
                const { id, ...payload } = maintenancePayload;

                const { error: maintError } = await supabase
                    .from('maintenance')
                    .insert(payload);

                if (maintError) throw maintError;
            });

            await Promise.all(promises);

            toast({ title: "Sucesso!", description: `${selectedEquipments.length} registro(s) de manutenção salvos.` });
            
            setForm(initialFormState);
            setSelectedEquipments([]);
            setSelectedClient(null);
            
            if (onSaveSuccess) onSaveSuccess();

        } catch (error) {
            console.error("❌ [DEBUG] Erro ao salvar manutenção:", error);
            toast({ variant: "destructive", title: "Erro ao salvar", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full max-w-4xl mx-auto shadow-md">
            <CardHeader className="bg-gray-50/50 border-b pb-4">
                <CardTitle className="flex items-center gap-2">
                    <Save className="h-5 w-5 text-blue-600" />
                    Registrar Manutenção
                </CardTitle>
                <CardDescription>
                    Preencha os dados abaixo para registrar uma nova manutenção.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
                
                {/* --- SELEÇÃO DE CLIENTE --- */}
                <div className="space-y-3">
                    <Label className="text-base font-semibold flex items-center gap-2">
                        <UserSearch className="h-4 w-4" /> 1. Selecionar Cliente
                    </Label>
                    
                    <Popover open={isClientPopoverOpen} onOpenChange={setIsClientPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={isClientPopoverOpen}
                                className="w-full justify-between h-12 text-left font-normal"
                                disabled={!!equipmentToEdit} // Lock if editing
                            >
                                {selectedClient ? (
                                    <span className="flex flex-col items-start">
                                        <span className="font-medium">{selectedClient.Fantasia}</span>
                                        <span className="text-xs text-muted-foreground">Loja: {selectedClient.Loja} | Cód: {selectedClient.Codigo}</span>
                                    </span>
                                ) : "Buscar cliente por nome ou código..."}
                                <UserSearch className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                            <Command shouldFilter={false}>
                                <CommandInput 
                                    placeholder="Digite o nome ou código do cliente..." 
                                    onValueChange={(val) => handleSearchClients(val)}
                                />
                                <CommandList>
                                    {loadingClients && <CommandItem disabled>Carregando...</CommandItem>}
                                    <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                                    <CommandGroup>
                                        {clients.map((client) => (
                                            <CommandItem
                                                key={client.Codigo + client.Loja}
                                                value={client.Fantasia}
                                                onSelect={() => handleClientSelect(client)}
                                                className="flex flex-col items-start py-2"
                                            >
                                                <span className="font-medium">{client.Fantasia}</span>
                                                <span className="text-xs text-muted-foreground">Loja: {client.Loja} | Cód: {client.Codigo}</span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* --- SELEÇÃO DE EQUIPAMENTOS --- */}
                <div className={cn("space-y-3 transition-opacity duration-300", !selectedClient && "opacity-50 pointer-events-none")}>
                    <Label className="text-base font-semibold flex items-center gap-2">
                        <PackageSearch className="h-4 w-4" /> 2. Selecionar Equipamentos ({selectedEquipments.length})
                    </Label>

                    {!selectedClient ? (
                        <div className="border rounded-md p-8 text-center text-muted-foreground bg-gray-50 border-dashed">
                            Selecione um cliente primeiro para ver os equipamentos.
                        </div>
                    ) : (
                        <div className="border rounded-md overflow-hidden">
                            <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-500 uppercase">Equipamentos disponíveis</span>
                                {loadingEquipment && <Loader2 className="h-3 w-3 animate-spin text-gray-500" />}
                            </div>
                            <ScrollArea className="h-60">
                                {availableEquipment.length === 0 && !loadingEquipment ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        Nenhum equipamento encontrado para este cliente.
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {availableEquipment.map((item) => {
                                            const isSelected = selectedEquipments.some(s => s.Chave_ID === item.Chave_ID);
                                            const isEditingChapa = editingChapaForId === item.Chave_ID;

                                            return (
                                                <div key={item.Chave_ID} className={cn("flex items-center p-3 hover:bg-gray-50 transition-colors", isSelected && "bg-blue-50/50")}>
                                                    <Checkbox 
                                                        id={`eq-${item.Chave_ID}`}
                                                        checked={isSelected}
                                                        onCheckedChange={() => toggleEquipmentSelection(item)}
                                                        className="mr-4"
                                                    />
                                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                                                        <div className="font-medium text-sm">
                                                            <label htmlFor={`eq-${item.Chave_ID}`} className="cursor-pointer">{item.Equipamento}</label>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Status: <Badge variant="outline" className="text-[10px] h-5">{item.AA3_STATUS || 'N/A'}</Badge>
                                                        </div>
                                                        
                                                        {/* Chapa Editor Inline */}
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <span className="text-muted-foreground text-xs w-12">Chapa:</span>
                                                            {isEditingChapa ? (
                                                                <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                                                                    <Input 
                                                                        className="h-7 w-24 text-xs" 
                                                                        value={chapaValue}
                                                                        onChange={(e) => setChapaValue(e.target.value)}
                                                                        autoFocus
                                                                    />
                                                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => handleUpdateChapa(item.Chave_ID)} disabled={isChapaUpdating}>
                                                                        {isChapaUpdating ? <Loader2 className="h-3 w-3 animate-spin"/> : <Check className="h-3 w-3"/>}
                                                                    </Button>
                                                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => setEditingChapaForId(null)}>
                                                                        <X className="h-3 w-3"/>
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-2 group">
                                                                    <span className="font-mono bg-gray-100 px-1.5 rounded text-xs">{item.AA3_CHAPA || 'S/C'}</span>
                                                                    <Button 
                                                                        size="icon" variant="ghost" 
                                                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation(); // Prevent row click
                                                                            setEditingChapaForId(item.Chave_ID);
                                                                            setChapaValue(item.AA3_CHAPA || '');
                                                                        }}
                                                                    >
                                                                        <Edit className="h-3 w-3 text-gray-500"/>
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    )}
                </div>

                {/* --- DETALHES DA MANUTENÇÃO --- */}
                <div className={cn("space-y-4 transition-opacity duration-300", selectedEquipments.length === 0 && "opacity-50 pointer-events-none")}>
                    <Label className="text-base font-semibold flex items-center gap-2">
                        <Edit className="h-4 w-4" /> 3. Detalhes do Serviço
                    </Label>
                    
                    <Card className="bg-gray-50 border-none shadow-none">
                        <CardContent className="p-4 space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="tipo">Tipo de Manutenção*</Label>
                                    <Select value={form.tipo} onValueChange={(val) => handleInputChange('tipo', val)}>
                                        <SelectTrigger id="tipo" className="bg-white"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Corretiva">Corretiva</SelectItem>
                                            <SelectItem value="Preventiva">Preventiva</SelectItem>
                                            <SelectItem value="Preditiva">Preditiva</SelectItem>
                                            <SelectItem value="Inspeção">Inspeção</SelectItem>
                                            <SelectItem value="Instalação">Instalação</SelectItem>
                                            <SelectItem value="Recolhimento">Recolhimento</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="data_manutencao">Data do Serviço</Label>
                                    <Input 
                                        id="data_manutencao" 
                                        type="date" 
                                        className="bg-white"
                                        value={form.data_inicio.split('T')[0]} 
                                        onChange={(e) => handleInputChange('data_inicio', new Date(e.target.value).toISOString())} 
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <Label htmlFor="observacoes">Descrição/Observações*</Label>
                                <Textarea 
                                    id="observacoes" 
                                    className="bg-white min-h-[100px]"
                                    value={form.observacoes} 
                                    onChange={(e) => handleInputChange('observacoes', e.target.value)} 
                                    placeholder="Descreva o problema encontrado e as ações realizadas..." 
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="proxima_manutencao">Próxima Manutenção (Opcional)</Label>
                                    <Input 
                                        id="proxima_manutencao" 
                                        type="date" 
                                        className="bg-white"
                                        value={form.proxima_manutencao} 
                                        onChange={(e) => handleInputChange('proxima_manutencao', e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="custo">Custo Total R$ (Opcional)</Label>
                                    <Input 
                                        id="custo" 
                                        type="number" 
                                        className="bg-white"
                                        value={form.custo} 
                                        onChange={(e) => handleInputChange('custo', e.target.value)} 
                                        placeholder="0,00" 
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="responsavel">Técnico Responsável</Label>
                                <Input id="responsavel" value={form.tecnico} disabled className="bg-gray-100" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {formError && (
                    <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center justify-center gap-2 text-sm font-medium">
                        <AlertTriangle className="h-4 w-4"/> {formError}
                    </div>
                )}

                <div className="flex justify-end gap-4 pt-2">
                    {onCancel && <Button variant="ghost" onClick={onCancel} className="text-muted-foreground">Cancelar</Button>}
                    <Button 
                        onClick={saveMaintenance} 
                        disabled={isSubmitting || !selectedClient || selectedEquipments.length === 0}
                        className="min-w-[150px]"
                    >
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Salvar Registro
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default MaintenanceForm;
