import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useDataScope } from '@/hooks/useDataScope';
import { Loader2, PlusCircle, User, RefreshCw, ShieldCheck, Edit, FileSignature, Printer, Award, FileText, Box, AlertTriangle } from 'lucide-react';
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
import DealDetailsModal from '@/components/crm/DealDetailsModal';
import MissingFieldsDialog from '@/components/crm/MissingFieldsDialog';
import { qualificationFieldsConfig } from '@/components/crm/QualificationChecklist';
import { Progress } from '@/components/ui/progress';
import ComodatoContract from '@/components/crm/ComodatoContract';
import SupplyContract from '@/components/crm/SupplyContract';
import { useReactToPrint } from 'react-to-print';
import { getContactBreadVolume } from '@/services/crmService';
import { Skeleton } from '@/components/ui/skeleton';

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
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

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

    const handleContactChange = async (id) => {
        setContactId(id);
        const selectedContact = contacts.find(c => c.id === id);
        if (selectedContact) {
            const searchName = selectedContact.fantasy_name || selectedContact.corporate_name;
            if (searchName) {
                const volume = await getContactBreadVolume(searchName);
                if (volume) {
                    toast({ 
                        title: "Dados encontrados", 
                        description: `Volume de Pão/Dia (BD-CL): ${volume}`, 
                        className: "bg-blue-50 border-blue-200" 
                    });
                }
            }
        }
    };

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
                        <Select onValueChange={handleContactChange} value={contactId}>
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

const DealCard = ({ deal, onDetailsClick, isQualificationStage, dragOverlay }) => {
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
        return field.type === 'photo' ? (!!value && typeof value === 'string') : (typeof value === 'boolean' ? value === true : !!value);
    }).length;
    const completionPercentage = requiredFields.length > 0 ? (completedFields / requiredFields.length) * 100 : 100;
    const isComplete = completionPercentage === 100;
    const isApproved = qData.approved;

    return (
        <Card 
            className={cn(
                "p-4 bg-card/80 backdrop-blur-sm border rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 group cursor-pointer relative select-none",
                dragOverlay && "rotate-2 scale-105 shadow-xl cursor-grabbing ring-2 ring-primary"
            )}
            onClick={() => onDetailsClick && onDetailsClick(deal)}
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
                        <Progress value={completionPercentage} className={cn("h-1.5", isApproved ? "bg-green-100" : "")} indicatorClassName={isApproved ? "bg-green-500" : ""} />
                        <div className="flex justify-between items-center">
                            <div className="text-[10px] text-muted-foreground">
                                {completedFields}/{requiredFields.length} campos
                            </div>
                            {isApproved ? (
                                <Badge variant="success" className="text-[10px] h-5 px-1.5">Aprovado</Badge>
                            ) : isComplete ? (
                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Aguardando</Badge>
                            ) : (
                                <Button 
                                    variant="link" 
                                    size="sm" 
                                    className="p-0 h-auto text-xs text-primary" 
                                    onPointerDown={(e) => e.stopPropagation()} 
                                    onClick={(e) => { e.stopPropagation(); onDetailsClick(deal); }}
                                >
                                    <Edit className="mr-1 h-3 w-3" />
                                    Completar
                                </Button>
                            )}
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

const PipelineColumn = ({ stage, deals, onDetailsClick }) => {
    const { setNodeRef } = useDroppable({
        id: stage.id,
        data: { type: 'Stage', stage }
    });

    const totalValue = useMemo(() => deals.reduce((sum, deal) => sum + (deal.value || 0), 0), [deals]);
    const isQualificationStage = stage.name.toLowerCase().includes('qualificação');
    
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
                                onDetailsClick={onDetailsClick} 
                                isQualificationStage={isQualificationStage} 
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

const PipelineSkeleton = () => (
    <div className="flex gap-6 p-6 h-full items-start min-w-max">
        {[1, 2, 3, 4].map(i => (
            <div key={i} className="w-[320px] shrink-0 h-full flex flex-col space-y-4 p-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
                <div className="p-2 space-y-3 flex-1 bg-muted/10 rounded-xl">
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                </div>
            </div>
        ))}
    </div>
);


const Pipeline = () => {
    const [stages, setStages] = useState([]);
    const [deals, setDeals] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { toast } = useToast();
    const { user } = useAuth();
    const { applyScope } = useDataScope();
    
    // Modal States
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [missingFieldsModalOpen, setMissingFieldsModalOpen] = useState(false);
    const [contractModalOpen, setContractModalOpen] = useState(false);
    const [contractType, setContractType] = useState(null);
    const [contractChoiceOpen, setContractChoiceOpen] = useState(false);
    const [currentDeal, setCurrentDeal] = useState(null);
    const [missingFields, setMissingFields] = useState([]);
    const [savingContract, setSavingContract] = useState(false);
    const [selectedDealId, setSelectedDealId] = useState('');
    const [justWonDeal, setJustWonDeal] = useState(null);

    const [activeDragDeal, setActiveDragDeal] = useState(null);

    const contractRef = useRef();
    const handlePrint = useReactToPrint({ content: () => contractRef.current });

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const fetchData = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        setError(null);
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), 30000); // 30-second timeout

        try {
            let dealsQuery = supabase.from('crm_deals').select('*, crm_contacts!inner(*)');
            let contactsQuery = supabase.from('crm_contacts').select('id, fantasy_name, corporate_name').order('fantasy_name', { ascending: true });

            dealsQuery = applyScope(dealsQuery, 'owner_id').abortSignal(abortController.signal);
            contactsQuery = applyScope(contactsQuery, 'owner_id').abortSignal(abortController.signal);

            const [stagesRes, dealsRes, contactsRes] = await Promise.all([
                supabase.from('crm_stages').select('*').order('order', { ascending: true }).abortSignal(abortController.signal),
                dealsQuery,
                contactsQuery
            ]);

            if (stagesRes.error) throw stagesRes.error;
            setStages(stagesRes.data);

            if (dealsRes.error) throw dealsRes.error;
            const dealsData = dealsRes.data || [];
            
            if (dealsData.length > 0) {
              const ownerIds = [...new Set(dealsData.map(d => d.owner_id).filter(Boolean))];
              if (ownerIds.length > 0) {
                  const { data: ownersData, error: ownerError } = await supabase.from('users_view').select('id, raw_user_meta_data').in('id', ownerIds).abortSignal(abortController.signal);
                  if (ownerError) throw ownerError;
                  const ownersMap = new Map(ownersData?.map(o => [o.id, o]));
                  setDeals(dealsData.map(deal => ({ ...deal, owner: ownersMap.get(deal.owner_id) || null })));
              } else {
                  setDeals(dealsData);
              }
            } else {
                setDeals([]);
            }

            if (contactsRes.error) throw contactsRes.error;
            setContacts(contactsRes.data);
            
        } catch (err) {
            console.error("Error fetching pipeline data:", err);
            setError(err.message);
            toast({ variant: 'destructive', title: 'Falha ao carregar dados', description: `Não foi possível buscar os dados do pipeline. ${err.message}` });
        } finally {
            clearTimeout(timeoutId);
            if (showLoading) setLoading(false);
        }
    }, [toast, applyScope]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const dealsByStage = useMemo(() => {
        const grouped = stages.reduce((acc, stage) => {
            acc[stage.id] = [];
            return acc;
        }, {});

        deals.forEach(deal => {
            if (grouped[deal.stage_id]) grouped[deal.stage_id].push(deal);
        });
        return grouped;
    }, [deals, stages]);

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

        const overDeal = deals.find(d => d.id === overId);
        const overStage = stages.find(s => s.id === overId);

        let overStageId;
        if (overStage) overStageId = overStage.id;
        else if (overDeal) overStageId = overDeal.stage_id;
        else return;

        if (activeDeal.stage_id !== overStageId) {
            setDeals((items) => {
                const oldIndex = items.findIndex(i => i.id === activeId);
                const newItems = [...items];
                newItems[oldIndex] = { ...newItems[oldIndex], stage_id: overStageId };
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
        const overStage = stages.find(s => s.id === overId);
        const overDeal = deals.find(d => d.id === overId);

        let newStageId = activeDeal.stage_id;
        if (overStage) newStageId = overStage.id;
        else if (overDeal) newStageId = overDeal.stage_id;

        const qualStage = stages.find(s => s.name.toLowerCase().includes('qualificação'));
        const targetStageObj = stages.find(s => s.id === newStageId);

        if (qualStage && targetStageObj && targetStageObj.order > qualStage.order) {
            const qData = activeDeal.crm_contacts?.qualification_data || {};
            
            const requiredFields = qualificationFieldsConfig.filter(f => f.isRequired);
            const missing = requiredFields.filter(f => {
                const val = qData[f.id];
                return f.type === 'photo' ? !(!!val && typeof val === 'string') : (typeof val === 'boolean' ? val !== true : !val);
            }).map(f => f.label);

            if (missing.length > 0) {
                setMissingFields(missing);
                setMissingFieldsModalOpen(true);
                fetchData(false);
                return;
            }

            if (!qData.approved) {
                toast({ 
                    variant: 'destructive', 
                    title: 'Aprovação Necessária', 
                    description: 'A qualificação precisa ser aprovada por um supervisor antes de avançar.' 
                });
                fetchData(false);
                return;
            }
        }

        try {
             const { error } = await supabase.from('crm_deals').update({ stage_id: newStageId }).eq('id', activeId);
             if (error) throw error;
        } catch (error) {
             toast({ variant: 'destructive', title: 'Erro ao mover', description: error.message });
             fetchData(false);
        }
    };

    const handleMarkAsWon = async () => {
        if (!selectedDealId) {
            toast({ variant: 'destructive', title: 'Nenhum negócio selecionado' });
            return;
        }
        const posVendaStage = stages.find(s => s.name.toLowerCase().includes('ganho') || s.name.toLowerCase().includes('fechado') || s.name.toLowerCase().includes('pós'));
        if (!posVendaStage) {
             toast({ variant: 'destructive', title: 'Erro', description: 'Etapa "Ganho/Pós-venda" não encontrada.' });
             return;
        }

        const { error } = await supabase.from('crm_deals').update({ stage_id: posVendaStage.id, status: 'won' }).eq('id', selectedDealId);
        if (error) {
            toast({ variant: 'destructive', title: 'Erro', description: error.message });
        } else {
            toast({ title: 'Sucesso!', description: 'Negócio marcado como Ganho!' });
            setDeals(d => d.map(deal => deal.id === selectedDealId ? { ...deal, stage_id: posVendaStage.id, status: 'won' } : deal));
            setJustWonDeal(deals.find(d => d.id === selectedDealId));
        }
    };
    
    const handleOpenDetails = (deal) => {
        setCurrentDeal(deal);
        setDetailsModalOpen(true);
    };

    const handleDealUpdate = (updatedDeal) => {
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
                {loading ? (
                    <PipelineSkeleton />
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
                        <h2 className="text-2xl font-semibold text-destructive">Falha ao Carregar o Pipeline</h2>
                        <p className="text-muted-foreground mt-2 max-w-md">Não foi possível buscar os dados. Verifique sua conexão com a internet ou tente novamente mais tarde.</p>
                        <p className="text-xs text-muted-foreground/50 mt-4">{error}</p>
                        <Button onClick={() => fetchData(true)} className="mt-6">
                            <RefreshCw className="mr-2 h-4 w-4" /> Tentar Novamente
                        </Button>
                    </div>
                ) : (
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
                                        onDetailsClick={handleOpenDetails}
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
                )}
            </div>
        </div>

        {currentDeal && (
             <DealDetailsModal
                deal={currentDeal}
                open={detailsModalOpen}
                setOpen={setDetailsModalOpen}
                onUpdate={handleDealUpdate}
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