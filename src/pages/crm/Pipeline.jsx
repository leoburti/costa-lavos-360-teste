
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useDataScope } from '@/hooks/useDataScope';
import { Loader2, PlusCircle, User, RefreshCw, ShieldCheck, Edit, FileSignature, Printer, Award, FileText, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import ContactQualificationDialog from '@/components/crm/ContactQualificationDialog';
import MissingFieldsDialog from '@/components/crm/MissingFieldsDialog';
import { qualificationFieldsConfig } from '@/components/crm/QualificationChecklist';
import { Progress } from '@/components/ui/progress';
import ComodatoContract from '@/components/crm/ComodatoContract';
import SupplyContract from '@/components/crm/SupplyContract';
import { useReactToPrint } from 'react-to-print';

// dnd-kit imports
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

// --- Components ---

const AddDealDialog = ({ onDealAdded, stages, contacts }) => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [value, setValue] = useState('');
    const [contactId, setContactId] = useState('');
    const [stageId, setStageId] = useState('');
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (stages.length > 0 && !stageId) {
            setStageId(stages[0].id);
        }
    }, [stages, stageId]);

    const handleAddDeal = async () => {
        if (!title || !stageId || !contactId) {
            toast({ variant: 'destructive', title: 'Campos obrigatórios', description: 'Título, contato e etapa são necessários.' });
            return;
        }
        setLoading(true);
        const { error } = await supabase.from('crm_deals').insert({
            title,
            value: value ? parseFloat(value) : null,
            contact_id: contactId,
            stage_id: stageId,
            owner_id: user.id
        }).select().single();

        if (error) {
            toast({ variant: 'destructive', title: 'Erro ao criar negócio', description: error.message });
        } else {
            toast({ title: 'Sucesso!', description: 'Novo negócio adicionado.' });
            onDealAdded();
            setOpen(false);
            setTitle(''); setValue(''); setContactId('');
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="shadow-lg shadow-primary/30">
                    <PlusCircle className="mr-2 h-4 w-4" /> Novo Negócio
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar Novo Negócio</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Contato</Label>
                        <Select onValueChange={setContactId} value={contactId}>
                            <SelectTrigger><SelectValue placeholder="Selecione um contato" /></SelectTrigger>
                            <SelectContent>
                                {contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.fantasy_name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Etapa</Label>
                        <Select onValueChange={setStageId} value={stageId}>
                            <SelectTrigger><SelectValue placeholder="Selecione uma etapa" /></SelectTrigger>
                            <SelectContent>
                                {stages.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="title">Título do Negócio</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Contrato de fornecimento..." />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="value">Valor (R$)</Label>
                        <Input id="value" type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="25000" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleAddDeal} disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Adicionar'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const DealCard = ({ deal, onQualificationClick, isQualificationStage, onCardClick, dragOverlay }) => {
    const valueColor = useMemo(() => {
        if (!deal.value) return 'text-muted-foreground';
        if (deal.value > 50000) return 'text-emerald-500';
        if (deal.value > 10000) return 'text-amber-500';
        return 'text-blue-500';
    }, [deal.value]);

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    }
    
    const requiredFields = qualificationFieldsConfig.filter(f => f.isRequired);
    const qData = deal.crm_contacts?.qualification_data || {};
    const completedFields = requiredFields.filter(field => {
        const value = qData[field.id];
        return typeof value === 'boolean' ? value === true : !!value;
    }).length;
    const completionPercentage = requiredFields.length > 0 ? (completedFields / requiredFields.length) * 100 : 100;
    const isComplete = completionPercentage === 100;

    return (
        <Card 
            className={cn(
                "p-4 bg-card/80 backdrop-blur-sm border rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 group cursor-pointer relative select-none",
                dragOverlay && "rotate-2 scale-105 shadow-xl cursor-grabbing ring-2 ring-primary"
            )}
            onClick={() => onCardClick && onCardClick(deal)}
        >
            <CardContent className="p-0 space-y-3">
                <p className="font-bold text-sm text-card-foreground pr-2 flex-1">{deal.title}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3" />
                        <span>{deal.crm_contacts?.fantasy_name || 'Contato'}</span>
                    </div>
                    {deal.value && <p className={cn("font-semibold text-sm", valueColor)}>{formatCurrency(deal.value)}</p>}
                </div>

                {isQualificationStage && (
                    <div className="space-y-2 pt-2">
                        <Progress value={completionPercentage} />
                        <div className="flex justify-between items-center">
                            <Button 
                                variant="link" 
                                size="sm" 
                                className="p-0 h-auto text-xs" 
                                onPointerDown={(e) => e.stopPropagation()} // Prevent drag start on click
                                onClick={(e) => { e.stopPropagation(); onQualificationClick(deal); }}
                            >
                                <Edit className="mr-1 h-3 w-3" />
                                Completar
                            </Button>
                            {isComplete && <Badge variant="success" className="text-xs bg-green-100 text-green-800 border-green-200">Completo</Badge>}
                        </div>
                    </div>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t border-dashed">
                    <div className="flex items-center">
                        <Avatar className="h-6 w-6 border-2 border-background">
                            <AvatarFallback>{getInitials(deal.owner?.raw_user_meta_data?.full_name)}</AvatarFallback>
                        </Avatar>
                    </div>
                    <Badge variant="secondary" className="font-normal text-[10px]">{new Date(deal.created_at).toLocaleDateString('pt-BR')}</Badge>
                </div>
            </CardContent>
        </Card>
    );
};

const SortableDealCard = ({ deal, ...props }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: deal.id, data: { type: 'Deal', deal } });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
            <DealCard deal={deal} {...props} />
        </div>
    );
};

const PipelineColumn = ({ stage, deals, onQualificationClick, onCardClick }) => {
    const { setNodeRef } = useDroppable({
        id: stage.id,
        data: { type: 'Stage', stage }
    });

    const totalValue = useMemo(() => deals.reduce((sum, deal) => sum + (deal.value || 0), 0), [deals]);
    const isQualificationStage = stage.name.toLowerCase() === 'qualificação';
    
    return (
        <div className="w-[320px] shrink-0 h-full flex flex-col">
            <div className="p-4 mb-2">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                        {isQualificationStage && <ShieldCheck className="h-5 w-5 text-amber-500" />}
                        {stage.name}
                    </h3>
                    <Badge variant="secondary" className="text-sm">{deals.length}</Badge>
                </div>
                <p className="text-sm font-medium text-primary mt-1">{formatCurrency(totalValue)}</p>
            </div>
            <ScrollArea className="flex-1 bg-muted/10 rounded-xl mx-2">
                <div ref={setNodeRef} className="p-2 space-y-3 h-full min-h-[150px]">
                    <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
                        {deals.map(deal => (
                            <SortableDealCard 
                                key={deal.id} 
                                deal={deal} 
                                onQualificationClick={onQualificationClick} 
                                isQualificationStage={isQualificationStage} 
                                onCardClick={onCardClick}
                            />
                        ))}
                    </SortableContext>
                    {deals.length === 0 && (
                        <div className="h-full flex items-center justify-center opacity-40 py-10">
                            <p className="text-sm text-muted-foreground italic border-2 border-dashed border-muted-foreground/20 rounded-lg p-4">
                                Arraste negócios para cá
                            </p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

const Pipeline = () => {
    const [stages, setStages] = useState([]);
    const [deals, setDeals] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { user } = useAuth();
    const { applyScope } = useDataScope();
    
    // Modal States
    const [qualificationModalOpen, setQualificationModalOpen] = useState(false);
    const [missingFieldsModalOpen, setMissingFieldsModalOpen] = useState(false);
    const [contractModalOpen, setContractModalOpen] = useState(false);
    const [contractType, setContractType] = useState(null);
    const [contractChoiceOpen, setContractChoiceOpen] = useState(false);
    const [currentDeal, setCurrentDeal] = useState(null);
    const [missingFields, setMissingFields] = useState([]);
    const [savingContract, setSavingContract] = useState(false);
    const [selectedDealId, setSelectedDealId] = useState('');
    const [justWonDeal, setJustWonDeal] = useState(null);

    // Drag and Drop State
    const [activeDragDeal, setActiveDragDeal] = useState(null);

    const contractRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => contractRef.current,
    });

    // Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const fetchData = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        
        let dealsQuery = supabase.from('crm_deals').select('*, crm_contacts!inner(*)');
        let contactsQuery = supabase.from('crm_contacts').select('id, fantasy_name').order('fantasy_name', { ascending: true });

        dealsQuery = applyScope(dealsQuery, 'owner_id');
        contactsQuery = applyScope(contactsQuery, 'owner_id');

        const [stagesRes, dealsRes, contactsRes] = await Promise.all([
            supabase.from('crm_stages').select('*').order('order', { ascending: true }),
            dealsQuery,
            contactsQuery
        ]);

        if (stagesRes.error) toast({ variant: 'destructive', title: 'Erro', description: stagesRes.error.message });
        else setStages(stagesRes.data);

        if (dealsRes.error) toast({ variant: 'destructive', title: 'Erro', description: dealsRes.error.message });
        else {
            const dealsData = dealsRes.data || [];
            const ownerIds = [...new Set(dealsData.map(d => d.owner_id).filter(Boolean))];
            if (ownerIds.length > 0) {
                const { data: ownersData } = await supabase.from('users_view').select('id, raw_user_meta_data').in('id', ownerIds);
                const ownersMap = new Map(ownersData?.map(o => [o.id, o]));
                setDeals(dealsData.map(deal => ({ ...deal, owner: ownersMap.get(deal.owner_id) || null })));
            } else {
                setDeals(dealsData);
            }
        }
        
        if (contactsRes.error) toast({ variant: 'destructive', title: 'Erro', description: contactsRes.error.message });
        else setContacts(contactsRes.data);
        
        if (showLoading) setLoading(false);
    }, [toast, applyScope]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Group Deals by Stage derived from state
    const dealsByStage = useMemo(() => {
        const grouped = stages.reduce((acc, stage) => {
            acc[stage.id] = [];
            return acc;
        }, {});

        deals.forEach(deal => {
            if (grouped[deal.stage_id]) {
                grouped[deal.stage_id].push(deal);
            }
        });
        return grouped;
    }, [deals, stages]);

    // Dnd Handlers
    const handleDragStart = (event) => {
        const { active } = event;
        const deal = deals.find(d => d.id === active.id);
        setActiveDragDeal(deal);
    };

    const handleDragOver = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeDeal = deals.find(d => d.id === activeId);
        if (!activeDeal) return;

        const isActiveInDeals = activeDeal;
        const overDeal = deals.find(d => d.id === overId);
        const overStage = stages.find(s => s.id === overId);

        const activeStageId = activeDeal.stage_id;
        let overStageId;

        if (overStage) {
            overStageId = overStage.id;
        } else if (overDeal) {
            overStageId = overDeal.stage_id;
        } else {
            return;
        }

        // Only trigger state update if changing columns to keep UI responsive
        if (activeStageId !== overStageId) {
            setDeals((items) => {
                const oldIndex = items.findIndex(i => i.id === activeId);
                const newItems = [...items];
                // Optimistically update stage
                newItems[oldIndex] = { ...newItems[oldIndex], stage_id: overStageId };
                
                // Reordering logic would go here if we had an 'order' field
                // For now, we rely on the default array order produced by filtering
                return newItems;
            });
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveDragDeal(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeDeal = deals.find(d => d.id === activeId);
        const overStage = stages.find(s => s.id === overId); // If dropped directly on a column
        const overDeal = deals.find(d => d.id === overId); // If dropped on a card

        let newStageId = activeDeal.stage_id;

        if (overStage) {
            newStageId = overStage.id;
        } else if (overDeal) {
            newStageId = overDeal.stage_id;
        }

        // Persist change if stage is different
        // Note: activeDeal.stage_id might already be updated optimistically in handleDragOver
        // But we need to ensure it's persisted to Supabase.
        // Since handleDragOver updates local state, 'activeDeal' retrieved from state here has the NEW stage_id
        // wait, handleDragEnd uses state closure? No, setDeals updates it.
        // Let's assume we need to persist whatever the current stage_id is for this deal in state, 
        // or check if it needs update.
        
        // More reliable: Use the calculated newStageId from 'over' target
        // If we dragged over a stage or a deal in a stage, that's the target.
        
        if (newStageId) {
             // Optimistic UI is already handled in DragOver for stage changes. 
             // We just need to ensure backend sync.
             try {
                 const { error } = await supabase
                    .from('crm_deals')
                    .update({ stage_id: newStageId })
                    .eq('id', activeId);
                 
                 if (error) throw error;
                 // toast({ title: "Atualizado", duration: 1000 });
             } catch (error) {
                 toast({ variant: 'destructive', title: 'Erro ao mover', description: error.message });
                 fetchData(false); // Revert on error
             }
        }
    };

    // Helper actions
    const handleMarkAsWon = async () => {
        if (!selectedDealId) {
            toast({ variant: 'destructive', title: 'Nenhum negócio selecionado' });
            return;
        }
        const posVendaStage = stages.find(s => s.name.toLowerCase() === 'pós-venda');
        if (!posVendaStage) {
             toast({ variant: 'destructive', title: 'Erro', description: 'Etapa "Pós-venda" não encontrada.' });
             return;
        }

        const { error } = await supabase.from('crm_deals').update({ stage_id: posVendaStage.id }).eq('id', selectedDealId);
        if (error) {
            toast({ variant: 'destructive', title: 'Erro', description: error.message });
        } else {
            toast({ title: 'Sucesso!', description: 'Negócio marcado como Ganho!' });
            setDeals(d => d.map(deal => deal.id === selectedDealId ? { ...deal, stage_id: posVendaStage.id } : deal));
            setJustWonDeal(deals.find(d => d.id === selectedDealId));
        }
    };
    
    const handleOpenQualification = (deal) => {
        setCurrentDeal(deal);
        setQualificationModalOpen(true);
    };

    const handleQualificationSave = (updatedDeal) => {
        setDeals(prevDeals => prevDeals.map(d => d.id === updatedDeal.id ? updatedDeal : d));
    };

    const handleGenerateContract = (deal) => {
        setCurrentDeal(deal);
        setContractChoiceOpen(true);
    };

    const handleSaveContract = async () => {
        if (!currentDeal) return;
        setSavingContract(true);
        const { error } = await supabase.from('crm_comodato_contracts').insert({
            deal_id: currentDeal.id,
            contact_id: currentDeal.contact_id,
            contract_data: {
                client: currentDeal.crm_contacts,
                deal: { title: currentDeal.title, value: currentDeal.value },
                type: contractType
            },
            generated_by_user_id: user.id
        });
        setSavingContract(false);
        if (error) {
            toast({ variant: 'destructive', title: 'Erro ao salvar contrato', description: error.message });
        } else {
            toast({ title: 'Sucesso!', description: 'Contrato salvo.' });
            setContractModalOpen(false);
            setJustWonDeal(null);
            setSelectedDealId('');
            setContractType(null);
        }
    };

    if (loading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <>
        <Helmet>
            <title>Pipeline de Vendas - CRM</title>
        </Helmet>
        <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/30 -m-6">
            <header className="flex justify-between items-center p-6 z-10 border-b bg-background/50 backdrop-blur-sm">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pipeline de Vendas</h1>
                    <p className="text-muted-foreground">Gerencie suas oportunidades.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => fetchData()} className="backdrop-blur-sm bg-white/30 dark:bg-black/30 rounded-full">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <AddDealDialog onDealAdded={() => fetchData(false)} stages={stages} contacts={contacts} />
                </div>
            </header>

             <div className="p-4 px-6 border-b bg-background/50 backdrop-blur-sm flex items-center gap-4">
                <div className="flex-grow max-w-sm">
                    <Select onValueChange={(value) => { setSelectedDealId(value); setJustWonDeal(null); }} value={selectedDealId}>
                        <SelectTrigger><SelectValue placeholder="Selecione um negócio..." /></SelectTrigger>
                        <SelectContent>
                            {deals.map(deal => (
                                <SelectItem key={deal.id} value={deal.id}>{deal.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleMarkAsWon} disabled={!selectedDealId} variant="success">
                    <Award className="mr-2 h-4 w-4" /> Marcar como Ganho
                </Button>
                {justWonDeal && (
                     <Button onClick={() => handleGenerateContract(justWonDeal)} variant="default">
                        <FileSignature className="mr-2 h-4 w-4" /> Gerar Contrato
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-hidden">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <ScrollArea className="w-full h-full">
                        <div className="flex gap-6 p-6 h-full items-start min-w-max">
                        {stages.map(stage => (
                            <div key={stage.id} className="h-full rounded-2xl bg-white/50 dark:bg-black/20 backdrop-blur-lg border border-white/70 dark:border-white/10 shadow-sm">
                                <PipelineColumn 
                                    stage={stage} 
                                    deals={dealsByStage[stage.id] || []}
                                    onQualificationClick={handleOpenQualification}
                                    onCardClick={(deal) => handleOpenQualification(deal)}
                                />
                            </div>
                        ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                    <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
                        {activeDragDeal ? (
                            <div className="w-[280px]">
                                <DealCard deal={activeDragDeal} isQualificationStage={false} dragOverlay />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>

        {currentDeal && (
             <ContactQualificationDialog
                deal={currentDeal}
                open={qualificationModalOpen}
                setOpen={setQualificationModalOpen}
                onSaveSuccess={handleQualificationSave}
            />
        )}

        <MissingFieldsDialog 
            isOpen={missingFieldsModalOpen}
            onOpenChange={setMissingFieldsModalOpen}
            missingFields={missingFields}
        />

        <Dialog open={contractChoiceOpen} onOpenChange={setContractChoiceOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Escolha o tipo de contrato</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                     <Button variant="outline" className="h-24 text-lg" onClick={() => { setContractType('supply'); setContractChoiceOpen(false); setContractModalOpen(true); }}>
                        <FileText className="mr-4 h-8 w-8" />
                        Fornecimento
                    </Button>
                    {justWonDeal?.crm_contacts?.uses_equipment && (
                         <Button variant="outline" className="h-24 text-lg" onClick={() => { setContractType('comodato'); setContractChoiceOpen(false); setContractModalOpen(true); }}>
                            <Box className="mr-4 h-8 w-8" />
                            Comodato
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>

        <Dialog open={contractModalOpen} onOpenChange={(isOpen) => { setContractModalOpen(isOpen); if (!isOpen) setContractType(null); }}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle>{contractType === 'comodato' ? 'Contrato de Comodato' : 'Contrato de Fornecimento'}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto p-6">
                    {contractType === 'comodato' && <ComodatoContract deal={currentDeal} ref={contractRef} />}
                    {contractType === 'supply' && <SupplyContract deal={currentDeal} ref={contractRef} />}
                </div>
                <DialogFooter className="p-4 border-t bg-muted/40">
                    <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Imprimir</Button>
                    <Button onClick={handleSaveContract} disabled={savingContract}>
                        {savingContract ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSignature className="mr-2 h-4 w-4" />}
                        Salvar Contrato
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
};

export default Pipeline;
