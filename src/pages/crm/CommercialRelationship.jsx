import React, { useState, useEffect, useCallback, useMemo } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { Loader2, Users, Phone, Mail, Hand, MessageSquare, Building, Search, CheckCircle, ArrowRight, Package, HardHat } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Textarea } from '@/components/ui/textarea';
    import { MultiSelect } from '@/components/ui/multi-select';
    import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
    import { Calendar } from '@/components/ui/calendar';
    import { format, formatDistanceToNow } from 'date-fns';
    import { ptBR } from 'date-fns/locale';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { motion, AnimatePresence } from 'framer-motion';
    import { cn } from '@/lib/utils';
    import { ScrollArea } from "@/components/ui/scroll-area";
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
    import { Badge } from '@/components/ui/badge';
    import { Switch } from '@/components/ui/switch';

    const formatCurrency = (value) => value != null ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00';

    const ContactSelector = ({ contacts, onSelect, currentSelection, loading }) => {
        const [searchTerm, setSearchTerm] = useState('');

        const filteredContacts = useMemo(() => {
            if (!searchTerm) return contacts;
            return contacts.filter(c => c.fantasy_name.toLowerCase().includes(searchTerm.toLowerCase()));
        }, [contacts, searchTerm]);

        return (
            <div className="bg-card/50 h-full flex flex-col border-r border-border">
                <div className="p-4 space-y-4 border-b border-border">
                    <h2 className="text-xl font-bold tracking-tight">Contatos</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Buscar contato..."
                            className="h-10 pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <ScrollArea className="flex-grow">
                    <div className="p-2">
                        {loading ? (
                            <div className="flex justify-center items-center h-full p-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : filteredContacts.length > 0 ? (
                            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.02 } } }} className="space-y-1">
                                {filteredContacts.map(contact => {
                                    const isSelected = currentSelection === contact.id;
                                    return (
                                        <motion.button
                                            key={contact.id}
                                            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                                            layout
                                            onClick={() => onSelect(contact.id)}
                                            className={cn(
                                                "w-full text-left p-2.5 rounded-md border-l-4 transition-colors duration-200",
                                                isSelected ? 'bg-primary/10 border-primary' : 'bg-transparent border-transparent hover:bg-accent'
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn("p-1.5 rounded-md", isSelected ? "bg-primary/20" : "bg-muted")}>
                                                    <Building className={cn("h-4 w-4", isSelected ? "text-primary" : "text-muted-foreground")} />
                                                </div>
                                                <span className={cn("font-medium text-sm flex-1 truncate", isSelected ? "text-primary" : "text-foreground")}>{contact.fantasy_name}</span>
                                                <AnimatePresence>
                                                    {isSelected && (
                                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
                                                            <CheckCircle className="h-5 w-5 text-primary" />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </motion.div>
                        ) : (
                            <div className="text-center text-sm text-muted-foreground p-8">Nenhum contato encontrado.</div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        );
    };

    const RelationshipDashboard = ({ contactId }) => {
        const { toast } = useToast();
        const { user } = useAuth();
        const [details, setDetails] = useState(null);
        const [products, setProducts] = useState([]);
        const [equipments, setEquipments] = useState([]);
        const [interactions, setInteractions] = useState([]);
        const [deals, setDeals] = useState([]);
        const [newInteraction, setNewInteraction] = useState({ type: 'call', notes: '' });
        const [loading, setLoading] = useState(true);

        const fetchData = useCallback(async () => {
            if (!contactId) return;
            setLoading(true);

            const [contactRes, productsRes, interactionsRes, dealsRes, equipmentsRes] = await Promise.all([
                supabase.from('crm_contacts').select('*').eq('id', contactId).single(),
                supabase.from('bd-cl').select('Descricao').not('Descricao', 'is', null),
                supabase.from('crm_contact_interactions').select('*').eq('contact_id', contactId).order('interaction_date', { ascending: false }),
                supabase.from('crm_deals').select('*, stage:crm_stages(name)').eq('contact_id', contactId),
                supabase.from('bd-cl').select('Descricao').in('Cfo', [5908, 6551, 6908, 5551]).not('Descricao', 'is', null)
            ]);

            if (contactRes.error) toast({ variant: 'destructive', title: 'Erro ao buscar detalhes do contato.' });
            else setDetails(contactRes.data);

            if (productsRes.error) toast({ variant: 'destructive', title: 'Erro ao buscar produtos.' });
            else setProducts([...new Set(productsRes.data.map(p => p.Descricao))].map(p => ({ value: p, label: p })));
            
            if (equipmentsRes.error) {
                toast({ variant: 'destructive', title: 'Erro ao buscar equipamentos.', description: equipmentsRes.error.message });
            } else {
                setEquipments([...new Set(equipmentsRes.data.map(p => p.Descricao))].map(p => ({ value: p, label: p })));
            }

            if (interactionsRes.error) {
                toast({ variant: 'destructive', title: 'Erro ao buscar interações.', description: interactionsRes.error.message });
            } else {
                const interactionData = interactionsRes.data || [];
                if (interactionData.length > 0) {
                    const userIds = [...new Set(interactionData.map(i => i.user_id).filter(Boolean))];
                    if (userIds.length > 0) {
                        const { data: usersData, error: usersError } = await supabase
                            .from('users_view')
                            .select('id, raw_user_meta_data')
                            .in('id', userIds);

                        if (usersError) {
                            toast({ variant: 'destructive', title: 'Erro ao buscar usuários das interações.', description: usersError.message });
                            setInteractions(interactionData);
                        } else {
                            const usersMap = new Map(usersData.map(u => [u.id, u]));
                            const mergedInteractions = interactionData.map(interaction => ({
                                ...interaction,
                                user: usersMap.get(interaction.user_id) || null
                            }));
                            setInteractions(mergedInteractions);
                        }
                    } else {
                        setInteractions(interactionData);
                    }
                } else {
                    setInteractions([]);
                }
            }

            if (dealsRes.error) toast({ variant: 'destructive', title: 'Erro ao buscar negócios.', description: dealsRes.error.message });
            else setDeals(dealsRes.data);

            setLoading(false);
        }, [contactId, toast]);


        useEffect(() => {
            fetchData();
        }, [fetchData]);

        const handleFieldUpdate = async (field, value) => {
            const { error } = await supabase.from('crm_contacts').update({ [field]: value }).eq('id', contactId);
            if (error) {
                toast({ variant: 'destructive', title: 'Erro ao atualizar campo.', description: error.message });
            } else {
                toast({ title: 'Sucesso!', description: 'Campo atualizado.' });
                setDetails(prev => ({ ...prev, [field]: value }));
            }
        };

        const handleAddInteraction = async () => {
            if (!newInteraction.notes) {
                toast({ variant: 'destructive', title: 'Nota vazia', description: 'Por favor, adicione uma nota à interação.' });
                return;
            }
            const { error } = await supabase.from('crm_contact_interactions').insert({ contact_id: contactId, user_id: user.id, type: newInteraction.type, notes: newInteraction.notes, interaction_date: new Date().toISOString() });
            if (error) {
                toast({ variant: 'destructive', title: 'Erro ao adicionar interação.', description: error.message });
            } else {
                toast({ title: 'Sucesso!', description: 'Interação adicionada.' });
                setNewInteraction({ type: 'call', notes: '' });
                fetchData();
            }
        };

        const interactionIcons = {
            call: <Phone className="h-4 w-4 text-blue-500" />,
            email: <Mail className="h-4 w-4 text-red-500" />,
            meeting: <Users className="h-4 w-4 text-green-500" />,
            proposal: <Hand className="h-4 w-4 text-purple-500" />,
            message: <MessageSquare className="h-4 w-4 text-sky-500" />,
        };

        if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
        if (!details) return <div className="flex items-center justify-center h-full text-muted-foreground">Falha ao carregar dados do contato.</div>;

        const totalDealsValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
        const openDeals = deals.filter(d => d.status === 'open');

        return (
            <ScrollArea className="h-full">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
                    <header>
                        <h1 className="text-3xl font-bold tracking-tight">{details.fantasy_name}</h1>
                        <p className="text-muted-foreground">{details.corporate_name}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                            <a href={`mailto:${details.representative_email}`} className="flex items-center gap-2 hover:text-primary"><Mail size={14} /> {details.representative_email}</a>
                            <a href={`tel:${details.representative_phone}`} className="flex items-center gap-2 hover:text-primary"><Phone size={14} /> {details.representative_phone}</a>
                        </div>
                    </header>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Receita Total</CardTitle></CardHeader>
                            <CardContent><p className="text-2xl font-bold">{formatCurrency(details.estimated_revenue)}</p></CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Última Atividade</CardTitle></CardHeader>
                            <CardContent><p className="text-2xl font-bold">{details.last_activity_date ? format(new Date(details.last_activity_date), 'dd/MM/yy') : 'N/A'}</p></CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Negócios Abertos</CardTitle></CardHeader>
                            <CardContent><p className="text-2xl font-bold">{openDeals.length}</p></CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Valor em Jogo</CardTitle></CardHeader>
                            <CardContent><p className="text-2xl font-bold">{formatCurrency(totalDealsValue)}</p></CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="interactions" className="w-full">
                        <TabsList>
                            <TabsTrigger value="interactions">Interações</TabsTrigger>
                            <TabsTrigger value="details">Detalhes</TabsTrigger>
                            <TabsTrigger value="deals">Negócios</TabsTrigger>
                            <TabsTrigger value="products">Produtos</TabsTrigger>
                            <TabsTrigger value="equipments">Equipamentos</TabsTrigger>
                        </TabsList>
                        <TabsContent value="interactions" className="mt-4">
                            <Card>
                                <CardHeader><CardTitle>Histórico de Interações</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                        <Select value={newInteraction.type} onValueChange={v => setNewInteraction(p => ({ ...p, type: v }))}>
                                            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="call">Ligação</SelectItem>
                                                <SelectItem value="email">E-mail</SelectItem>
                                                <SelectItem value="meeting">Reunião</SelectItem>
                                                <SelectItem value="proposal">Proposta</SelectItem>
                                                <SelectItem value="message">Mensagem</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Textarea placeholder="Adicione uma nota sobre a interação..." value={newInteraction.notes} onChange={e => setNewInteraction(p => ({ ...p, notes: e.target.value }))} />
                                        <Button onClick={handleAddInteraction} size="icon"><MessageSquare className="h-4 w-4" /></Button>
                                    </div>
                                    <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                                        {interactions.map(item => (
                                            <div key={item.id} className="flex items-start gap-4">
                                                <div className="mt-1 p-2 bg-muted rounded-full">{interactionIcons[item.type]}</div>
                                                <div>
                                                    <p className="font-medium text-sm">{item.notes}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(item.user && item.user.raw_user_meta_data?.full_name) || 'Usuário'} • {formatDistanceToNow(new Date(item.interaction_date), { addSuffix: true, locale: ptBR })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="details" className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader><CardTitle>Informações Gerais</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2"><Label>Origem do Lead</Label><Input value={details.lead_source || ''} onBlur={e => handleFieldUpdate('lead_source', e.target.value)} onChange={e => setDetails(d => ({...d, lead_source: e.target.value}))} /></div>
                                    <div className="space-y-2"><Label>Status</Label><Input value={details.status || ''} onBlur={e => handleFieldUpdate('status', e.target.value)} onChange={e => setDetails(d => ({...d, status: e.target.value}))} /></div>
                                    <div className="space-y-2"><Label>Próxima Ação</Label>
                                        <Popover>
                                            <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start text-left font-normal"><Calendar className="mr-2 h-4 w-4" />{details.next_action_date ? format(new Date(details.next_action_date), 'PPP', { locale: ptBR }) : <span>Escolha uma data</span>}</Button></PopoverTrigger>
                                            <PopoverContent className="w-auto p-0"><Calendar locale={ptBR} mode="single" selected={details.next_action_date ? new Date(details.next_action_date) : null} onSelect={date => handleFieldUpdate('next_action_date', date)} initialFocus /></PopoverContent>
                                        </Popover>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Representante</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2"><Label>Nome</Label><Input value={details.representative_name || ''} onBlur={e => handleFieldUpdate('representative_name', e.target.value)} onChange={e => setDetails(d => ({...d, representative_name: e.target.value}))} /></div>
                                    <div className="space-y-2"><Label>Cargo</Label><Input value={details.representative_role || ''} onBlur={e => handleFieldUpdate('representative_role', e.target.value)} onChange={e => setDetails(d => ({...d, representative_role: e.target.value}))} /></div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="deals" className="mt-4">
                            <Card>
                                <CardHeader><CardTitle>Negócios</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    {deals.length > 0 ? deals.map(deal => (
                                        <div key={deal.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                            <div>
                                                <p className="font-semibold">{deal.title}</p>
                                                <p className="text-sm text-muted-foreground">{deal.stage?.name || 'Sem estágio'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-primary">{formatCurrency(deal.value)}</p>
                                                <Badge variant={deal.status === 'won' ? 'default' : deal.status === 'lost' ? 'destructive' : 'secondary'}>{deal.status}</Badge>
                                            </div>
                                        </div>
                                    )) : <p className="text-center text-muted-foreground p-4">Nenhum negócio encontrado.</p>}
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="products" className="mt-4">
                            <Card>
                                <CardHeader><CardTitle>Produtos de Interesse</CardTitle></CardHeader>
                                <CardContent>
                                    <MultiSelect
                                        options={products}
                                        selected={details.products_of_interest ?? []}
                                        onChange={(value) => handleFieldUpdate('products_of_interest', value)}
                                        placeholder="Selecione os produtos..."
                                        className="w-full"
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="equipments" className="mt-4">
                            <Card>
                                <CardHeader><CardTitle>Equipamentos</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="uses-equipment"
                                            checked={details.uses_equipment}
                                            onCheckedChange={(checked) => handleFieldUpdate('uses_equipment', checked)}
                                        />
                                        <Label htmlFor="uses-equipment">Usa Equipamento?</Label>
                                    </div>
                                    <AnimatePresence>
                                    {details.uses_equipment && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <MultiSelect
                                                options={equipments}
                                                selected={details.equipments_of_interest ?? []}
                                                onChange={(value) => handleFieldUpdate('equipments_of_interest', value)}
                                                placeholder="Selecione os equipamentos..."
                                                className="w-full"
                                            />
                                        </motion.div>
                                    )}
                                    </AnimatePresence>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </ScrollArea>
        );
    };

    const PlaceholderMessage = ({ icon: Icon, title, description }) => (
        <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
    );

    const CommercialRelationship = () => {
        const { toast } = useToast();
        const [contacts, setContacts] = useState([]);
        const [selectedContact, setSelectedContact] = useState(null);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            const fetchInitialContacts = async () => {
                setLoading(true);
                const { data, error } = await supabase.from('crm_contacts').select('id, fantasy_name').order('fantasy_name');
                if (error) toast({ variant: 'destructive', title: 'Erro ao buscar contatos.' });
                else setContacts(data);
                setLoading(false);
            };
            fetchInitialContacts();
        }, [toast]);

        return (
            <>
                <Helmet>
                    <title>Relacionamento Comercial - CRM</title>
                    <meta name="description" content="Visualize e gerencie o relacionamento com seus clientes." />
                </Helmet>
                <div className="flex h-[calc(100vh-var(--header-height)-2rem)]">
                    <div className="w-[350px] flex-shrink-0 h-full">
                        <ContactSelector contacts={contacts} onSelect={setSelectedContact} currentSelection={selectedContact} loading={loading} />
                    </div>
                    <main className="flex-1 overflow-y-auto bg-background">
                        {selectedContact ? (
                            <RelationshipDashboard key={selectedContact} contactId={selectedContact} />
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <PlaceholderMessage
                                    icon={ArrowRight}
                                    title="Selecione um Contato"
                                    description="Escolha um contato na lista à esquerda para ver a visão 360° do relacionamento."
                                />
                            </div>
                        )}
                    </main>
                </div>
            </>
        );
    };

    export default CommercialRelationship;