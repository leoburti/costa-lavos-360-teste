import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, AlertTriangle, PackageSearch, Edit } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useEquipmentInventory } from '@/hooks/useEquipmentInventory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";

const MaintenanceForm = ({ equipmentToEdit, onSaveSuccess, onCancel }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const { rawInventory, loading: inventoryLoading, refresh: refreshInventory } = useEquipmentInventory();

    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [chapaValue, setChapaValue] = useState('');
    const [isChapaUpdating, setIsChapaUpdating] = useState(false);
    
    const initialFormState = useMemo(() => ({
        id: null,
        equipment_id: null,
        inventory_item_id: null,
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

     useEffect(() => {
        if (equipmentToEdit) {
            handleEquipmentSelect(equipmentToEdit);
        }
    }, [equipmentToEdit]);

    useEffect(() => {
        if (selectedEquipment) {
            setChapaValue(selectedEquipment.AA3_CHAPA || '');
        } else {
            setChapaValue('');
        }
    }, [selectedEquipment]);

    const handleEquipmentSelect = (equipment) => {
        setSelectedEquipment(equipment);
        setForm(prev => ({
            ...prev,
            equipment_id: equipment.Codigo,
            inventory_item_id: equipment.Chave_ID,
        }));
        setPopoverOpen(false);
    };

    const handleInputChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleUpdateChapa = async () => {
        if (!selectedEquipment || !selectedEquipment.Chave_ID) {
            toast({ variant: 'destructive', title: 'Nenhum equipamento selecionado.' });
            return;
        }
        setIsChapaUpdating(true);
        const { error } = await supabase
            .from('bd_cl_inv')
            .update({ AA3_CHAPA: chapaValue })
            .eq('Chave_ID', selectedEquipment.Chave_ID);

        if (error) {
            toast({ variant: 'destructive', title: 'Erro ao atualizar Chapa', description: error.message });
        } else {
            toast({ title: 'Sucesso', description: 'Campo Chapa atualizado no inventário.' });
            setSelectedEquipment(prev => ({...prev, AA3_CHAPA: chapaValue}));
            refreshInventory();
        }
        setIsChapaUpdating(false);
    };


    const validateForm = () => {
        const requiredFields = { tipo: "Tipo de Manutenção", observacoes: "Observações/Descrição" };
        if (!selectedEquipment) {
            const errorMsg = `Selecione um equipamento.`;
            setFormError(errorMsg);
            toast({ variant: 'destructive', title: 'Formulário Incompleto', description: errorMsg });
            return false;
        }
        for (const [field, label] of Object.entries(requiredFields)) {
            if (!form[field]) {
                const errorMsg = `Campo obrigatório: ${label}`;
                setFormError(errorMsg);
                toast({ variant: 'destructive', title: 'Formulário Incompleto', description: errorMsg });
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
        
        const maintenancePayload = {
            ...form,
            data_fim: new Date().toISOString(),
            status: 'Concluído',
            custo: parseFloat(form.custo) || 0,
        };

        let { data: eq, error: findError } = await supabase
            .from('equipment')
            .select('id')
            .eq('serial', selectedEquipment.AA3_CHAPA) 
            .single();

        if (findError && findError.code !== 'PGRST116') {
            toast({ variant: "destructive", title: "Erro ao buscar equipamento correspondente", description: findError.message });
            setIsSubmitting(false);
            return;
        }

        let equipmentId = eq?.id;

        if (!equipmentId) {
            const { data: newEq, error: createError } = await supabase
                .from('equipment')
                .insert({
                    nome: selectedEquipment.Equipamento,
                    serial: selectedEquipment.AA3_CHAPA,
                    ativo_fixo: selectedEquipment.Codigo,
                    status: 'ativo', 
                    local: selectedEquipment.Loja_texto,
                })
                .select('id')
                .single();

            if (createError) {
                toast({ variant: "destructive", title: "Erro ao criar registro de equipamento", description: createError.message });
                setIsSubmitting(false);
                return;
            }
            equipmentId = newEq.id;
        }

        const { error: maintError } = await supabase.from('maintenance').insert({
            ...maintenancePayload,
            equipment_id: equipmentId
        });

        if (maintError) {
            toast({ variant: "destructive", title: "Erro ao salvar manutenção", description: maintError.message });
            setIsSubmitting(false);
            return;
        }
        
        toast({ title: "Manutenção registrada com sucesso!" });
        setSelectedEquipment(null);
        setForm(initialFormState);
        if (onSaveSuccess) onSaveSuccess();
        setIsSubmitting(false);
    };

    const activeEquipmentForSelection = useMemo(() => {
        return rawInventory.filter(item => item.derivedStatus === 'Ativo');
    }, [rawInventory]);
    
    const chapaIsDirty = selectedEquipment && chapaValue !== (selectedEquipment.AA3_CHAPA || '');

    return (
        <Card>
            <CardHeader>
                <CardTitle>Registrar Manutenção</CardTitle>
                <CardDescription>Selecione um equipamento do inventário e preencha os detalhes da manutenção.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {!equipmentToEdit && (
                    <div className="space-y-2">
                        <Label>Equipamento do Inventário*</Label>
                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={popoverOpen}
                                    className="w-full justify-between"
                                >
                                    {selectedEquipment
                                        ? `${selectedEquipment.Equipamento} (${selectedEquipment.Fantasia})`
                                        : "Selecione um equipamento..."}
                                    <PackageSearch className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0">
                                <Command>
                                    <CommandInput placeholder="Buscar equipamento por nome, código, fantasia..." />
                                    <CommandEmpty>
                                        {inventoryLoading ? "Carregando..." : "Nenhum equipamento ativo encontrado."}
                                    </CommandEmpty>
                                    <ScrollArea className="h-72">
                                    <CommandGroup>
                                        {activeEquipmentForSelection.map((item) => (
                                            <CommandItem
                                                key={item.Chave_ID}
                                                value={`${item.Equipamento} ${item.Fantasia} ${item.Codigo}`}
                                                onSelect={() => handleEquipmentSelect(item)}
                                            >
                                                {item.Equipamento} ({item.Fantasia})
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                    </ScrollArea>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                )}

                {selectedEquipment && (
                    <Card className="bg-muted/50">
                        <CardHeader><CardTitle className="text-lg">Informações do Equipamento</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                            <div><span className="font-semibold">Código:</span> {selectedEquipment.Codigo}</div>
                            <div><span className="font-semibold">Equipamento:</span> {selectedEquipment.Equipamento}</div>
                            <div><span className="font-semibold">Fantasia:</span> {selectedEquipment.Fantasia}</div>
                            <div><span className="font-semibold">Loja:</span> {selectedEquipment.derivedLocation}</div>
                            <div className="md:col-span-2"><span className="font-semibold">Vendedor:</span> {selectedEquipment.Nome_Vendedor || 'N/A'}</div>
                            <div><span className="font-semibold">Status:</span> {selectedEquipment.derivedStatus}</div>
                            <div className="flex flex-col md:flex-row md:items-center md:gap-2 md:col-span-2">
                                <Label htmlFor="chapa" className="font-semibold whitespace-nowrap">Chapa:</Label>
                                <div className="flex items-center gap-2">
                                    <Input 
                                        id="chapa" 
                                        value={chapaValue} 
                                        onChange={(e) => setChapaValue(e.target.value)} 
                                        placeholder="Inserir chapa"
                                        className="h-8"
                                    />
                                    {chapaIsDirty && (
                                        <Button size="sm" onClick={handleUpdateChapa} disabled={isChapaUpdating}>
                                            {isChapaUpdating ? <Loader2 className="h-4 w-4 animate-spin"/> : <Edit className="h-4 w-4"/>}
                                            <span className="ml-2 hidden sm:inline">Atualizar Chapa</span>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <fieldset disabled={!selectedEquipment} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="tipo">Tipo de Manutenção*</Label>
                            <Select value={form.tipo} onValueChange={(val) => handleInputChange('tipo', val)}>
                                <SelectTrigger id="tipo"><SelectValue placeholder="Selecione o tipo..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Corretiva">Corretiva</SelectItem>
                                    <SelectItem value="Preventiva">Preventiva</SelectItem>
                                    <SelectItem value="Preditiva">Preditiva</SelectItem>
                                    <SelectItem value="Inspeção">Inspeção</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="data_manutencao">Data da Manutenção</Label>
                            <Input id="data_manutencao" type="date" value={form.data_inicio.split('T')[0]} onChange={(e) => handleInputChange('data_inicio', new Date(e.target.value).toISOString())} />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="observacoes">Descrição/Observações*</Label>
                        <Textarea id="observacoes" value={form.observacoes} onChange={(e) => handleInputChange('observacoes', e.target.value)} placeholder="Descreva o problema e as ações realizadas." />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="proxima_manutencao">Próxima Manutenção</Label>
                            <Input id="proxima_manutencao" type="date" value={form.proxima_manutencao} onChange={(e) => handleInputChange('proxima_manutencao', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="custo">Custo (Opcional)</Label>
                            <Input id="custo" type="number" value={form.custo} onChange={(e) => handleInputChange('custo', e.target.value)} placeholder="R$ 0,00" />
                        </div>
                    </div>
                     <div>
                        <Label htmlFor="responsavel">Responsável</Label>
                        <Input id="responsavel" value={form.tecnico} disabled />
                    </div>
                </fieldset>

                {formError && <p className="text-sm text-destructive text-center flex items-center justify-center gap-2"><AlertTriangle className="h-4 w-4"/> {formError}</p>}

                <div className="flex justify-end gap-4 border-t pt-6">
                    {onCancel && <Button variant="outline" onClick={onCancel}>Cancelar</Button>}
                    <Button onClick={saveMaintenance} disabled={isSubmitting || !selectedEquipment}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Salvar Manutenção
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default MaintenanceForm;