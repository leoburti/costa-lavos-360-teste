import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, PlusCircle, User, RefreshCw, ShieldCheck, Edit, FileSignature, Printer, CheckCircle2, Award, FileText, Box } from 'lucide-react';
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

    const handleAddDeal = async () => {
        if (!title || !stageId || !contactId) {
            toast({ variant: 'destructive', title: 'Campos obrigatórios', description: 'Título, contato e etapa são necessários.' });
            return;
        }
        setLoading(true);
        const { data, error } = await supabase.from('crm_deals').insert({
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

const DealCard = ({ deal, onQualificationClick, isQualificationStage, onCardClick }) => {
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
            className="p-4 bg-card/80 backdrop-blur-sm border rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 group cursor-pointer"
            onClick={() => onCardClick(deal)}
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
                            <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={(e) => { e.stopPropagation(); onQualificationClick(deal); }}>
                                <Edit className="mr-1 h-3 w-3" />
                                Completar Qualificação
                            </Button>
                            {isComplete && <Badge variant="success" className="text-xs">Completo</Badge>}
                        </div>
                    </div>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t border-dashed">
                    <div className="flex items-center">
                        <Avatar className="h-6 w-6 border-2 border-background">
                            <AvatarFallback>{getInitials(deal.owner?.raw_user_meta_data?.full_name)}</AvatarFallback>
                        </Avatar>
                    </div>
                    <Badge variant="secondary" className="font-normal">{new Date(deal.created_at).toLocaleDateString('pt-BR')}</Badge>
                </div>
            </CardContent>
        </Card>
    );
};

const PipelineColumn = ({ stage, deals, onQualificationClick, onCardClick }) => {
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
            <ScrollArea className="flex-1">
                <div className="p-4 pt-0 space-y-3 h-full">
                    {deals.map(deal => (
                        <DealCard 
                            key={deal.id} 
                            deal={deal} 
                            onQualificationClick={onQualificationClick} 
                            isQualificationStage={isQualificationStage} 
                            onCardClick={onCardClick}
                        />
                    ))}
                    {deals.length === 0 && (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-sm text-muted-foreground italic">Nenhum negócio aqui</p>
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
    
    const [qualificationModalOpen, setQualificationModalOpen] = useState(false);
    const [missingFieldsModalOpen, setMissingFieldsModalOpen] = useState(false);
    const [contractModalOpen, setContractModalOpen] = useState(false);
    const [contractType, setContractType] = useState(null); // 'comodato' or 'supply'
    const [contractChoiceOpen, setContractChoiceOpen] = useState(false);
    const [currentDeal, setCurrentDeal] = useState(null);
    const [missingFields, setMissingFields] = useState([]);
    const [savingContract, setSavingContract] = useState(false);
    const [selectedDealId, setSelectedDealId] = useState('');
    const [justWonDeal, setJustWonDeal] = useState(null);

    const contractRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => contractRef.current,
    });

    const fetchData = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        const [stagesRes, dealsRes, contactsRes] = await Promise.all([
            supabase.from('crm_stages').select('*').order('order', { ascending: true }),
            supabase.from('crm_deals').select('*, crm_contacts!inner(*)'),
            supabase.from('crm_contacts').select('id, fantasy_name').order('fantasy_name', { ascending: true })
        ]);

        if (stagesRes.error) {
            toast({ variant: 'destructive', title: 'Erro ao buscar etapas', description: stagesRes.error.message });
        } else {
            setStages(stagesRes.data);
        }

        if (dealsRes.error) {
            toast({ variant: 'destructive', title: 'Erro ao buscar negócios', description: dealsRes.error.message });
        } else {
            const dealsData = dealsRes.data || [];
            if (dealsData.length > 0) {
                const ownerIds = [...new Set(dealsData.map(d => d.owner_id).filter(Boolean))];
                if (ownerIds.length > 0) {
                    const { data: ownersData, error: ownersError } = await supabase
                        .from('users_view')
                        .select('id, raw_user_meta_data')
                        .in('id', ownerIds);
                    
                    if (ownersError) {
                        console.warn("Could not fetch some deal owners, but continuing.", ownersError);
                        setDeals(dealsData);
                    } else {
                        const ownersMap = new Map(ownersData.map(o => [o.id, o]));
                        const mergedDeals = dealsData.map(deal => ({
                            ...deal,
                            owner: ownersMap.get(deal.owner_id) || null
                        }));
                        setDeals(mergedDeals);
                    }
                } else {
                    setDeals(dealsData);
                }
            } else {
                setDeals([]);
            }
        }
        
        if (contactsRes.error) {
            toast({ variant: 'destructive', title: 'Erro ao buscar contatos', description: contactsRes.error.message });
        } else {
            setContacts(contactsRes.data);
        }
        
        if (showLoading) setLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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

    const handleMoveDeal = async (dealId, newStageId) => {
        const dealToMove = deals.find(d => d.id === dealId);
        if (!dealToMove) return;

        const oldStageId = dealToMove.stage_id;
        
        const { data: updatedDeal, error } = await supabase.from('crm_deals').update({ stage_id: newStageId }).eq('id', dealId).select('*, crm_contacts!inner(*)').single();
        
        if (error) {
            toast({ variant: 'destructive', title: 'Erro ao mover negócio', description: error.message });
            setDeals(prevDeals => prevDeals.map(d => d.id === dealId ? { ...d, stage_id: oldStageId } : d));
            return null;
        } else {
            setDeals(prevDeals => prevDeals.map(d => d.id === dealId ? updatedDeal : d));
            return updatedDeal;
        }
    };

    const handleMarkAsWon = async () => {
        if (!selectedDealId) {
            toast({ variant: 'destructive', title: 'Nenhum negócio selecionado' });
            return;
        }
        const deal = deals.find(d => d.id === selectedDealId);
        const posVendaStage = stages.find(s => s.name.toLowerCase() === 'pós-venda');

        if (deal && posVendaStage) {
            const updatedDeal = await handleMoveDeal(deal.id, posVendaStage.id);
            if (updatedDeal) {
                toast({ title: 'Sucesso!', description: 'Negócio marcado como Ganho com sucesso!' });
                setJustWonDeal(updatedDeal);
            }
        } else {
             toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível encontrar o negócio ou a etapa "Pós-venda".' });
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

    const handleSelectContractType = (type) => {
        setContractType(type);
        setContractChoiceOpen(false);
        setContractModalOpen(true);
    };

    const handleSaveContract = async () => {
        if (!currentDeal) return;
        setSavingContract(true);
        // This is a placeholder. A real implementation would save different contract types.
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
            toast({ title: 'Sucesso!', description: `Contrato de ${contractType === 'comodato' ? 'Comodato' : 'Fornecimento'} salvo com sucesso.` });
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
            <meta name="description" content="Visualize e gerencie suas oportunidades de vendas em um quadro interativo." />
        </Helmet>
        <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/30 -m-6">
            <header className="flex justify-between items-center p-6 z-10 border-b bg-background/50 backdrop-blur-sm">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pipeline de Vendas</h1>
                    <p className="text-muted-foreground">Gerencie suas oportunidades de forma simples e direta.</p>
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
                <Button onClick={handleMarkAsWon} disabled={!selectedDealId || !!justWonDeal} variant="success">
                    <Award className="mr-2 h-4 w-4" /> Marcar como Ganho
                </Button>
                {justWonDeal && (
                     <Button onClick={() => handleGenerateContract(justWonDeal)} variant="default">
                        <FileSignature className="mr-2 h-4 w-4" /> Gerar Contrato
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-hidden">
                <ScrollArea className="w-full h-full">
                    <div className="flex gap-6 p-6 h-full items-start">
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
                     <Button variant="outline" className="h-24 text-lg" onClick={() => handleSelectContractType('supply')}>
                        <FileText className="mr-4 h-8 w-8" />
                        Fornecimento
                    </Button>
                    {justWonDeal?.crm_contacts?.uses_equipment && (
                         <Button variant="outline" className="h-24 text-lg" onClick={() => handleSelectContractType('comodato')}>
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