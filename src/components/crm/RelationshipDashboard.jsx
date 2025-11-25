
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { 
    Loader2, Phone, Mail, Users, Hand, MessageSquare, 
    Edit, Trash2, Save, X, Calendar as CalendarIcon, 
    DollarSign, ShoppingCart, ArrowRight, Building, 
    Briefcase, Package, Wrench, MoreVertical, MapPin, ExternalLink,
    PanelLeft, ChevronLeft, TrendingUp, Clock, Target, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { QuantitySelector } from './QuantitySelector';
import ContactDetailsTab from './ContactDetailsTab';

// Helper Component for Metric Cards
const StatCard = ({ title, value, icon: Icon, colorClass, subtext }) => (
    <Card className="border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden relative bg-white">
        <div className={cn("absolute -right-6 -top-6 p-8 rounded-full opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-150 duration-500", colorClass.bg)}></div>
        <CardContent className="p-5 flex items-center justify-between relative z-10">
            <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
                {subtext && <p className="text-xs text-slate-500 font-medium">{subtext}</p>}
            </div>
            <div className={cn("p-3 rounded-xl bg-opacity-20 group-hover:scale-110 transition-transform duration-300 shadow-sm", colorClass.bg, colorClass.text)}>
                <Icon className="w-5 h-5" />
            </div>
        </CardContent>
    </Card>
);

const formatCurrency = (value) => value != null ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00';

const interactionIcons = {
    call: <Phone className="h-4 w-4" />,
    email: <Mail className="h-4 w-4" />,
    meeting: <Users className="h-4 w-4" />,
    proposal: <Hand className="h-4 w-4" />,
    message: <MessageSquare className="h-4 w-4" />,
};

const interactionColors = {
    call: "bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-200",
    email: "bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-200",
    meeting: "bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-200",
    proposal: "bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-200",
    message: "bg-slate-50 text-slate-600 border-slate-100 hover:border-slate-200",
};

const RelationshipDashboard = ({ contactId, onDeleteContact, compact = false, onToggleSidebar, isSidebarOpen }) => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [details, setDetails] = useState(null);
    const [interactions, setInteractions] = useState([]);
    const [deals, setDeals] = useState([]);
    const [metrics, setMetrics] = useState({ revenue: 0, lastActivity: null, openDeals: 0, valueAtPlay: 0 });
    const [loading, setLoading] = useState(true);
    
    // Interaction Form State
    const [newInteraction, setNewInteraction] = useState({ type: 'call', notes: '' });
    const [isSubmittingInteraction, setIsSubmittingInteraction] = useState(false);
    
    // Products & Equipment with Quantity
    const [productsWithQty, setProductsWithQty] = useState([]);
    const [equipmentsWithQty, setEquipmentsWithQty] = useState([]);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [availableEquipments, setAvailableEquipments] = useState([]);
    const [usesEquipment, setUsesEquipment] = useState(false);
    const [isSavingPreferences, setIsSavingPreferences] = useState(false);

    const fetchData = useCallback(async () => {
        if (!contactId) return;
        setLoading(true);

        try {
            // 1. Fetch Contact Details
            const { data: contactData, error: contactError } = await supabase
                .from('crm_contacts')
                .select('*')
                .eq('id', contactId)
                .single();

            if (contactError) throw contactError;
            setDetails(contactData);
            
            // Load custom fields
            const customFields = contactData.custom_fields || {};
            
            // Products
            if (customFields.products_with_quantity) {
                setProductsWithQty(customFields.products_with_quantity.map(p => ({
                    ...p,
                    period: p.period || 'dia',
                    unit: p.unit || 'kg'
                })));
            } else if (contactData.products_of_interest) {
                setProductsWithQty(contactData.products_of_interest.map(p => ({ name: p, quantity: 1, period: 'dia', unit: 'kg' })));
            } else {
                setProductsWithQty([]);
            }

            // Equipments
            if (customFields.equipments_with_quantity) {
                setEquipmentsWithQty(customFields.equipments_with_quantity.map(e => ({
                    ...e,
                    period: null, 
                    unit: 'un' 
                })));
            } else if (contactData.equipments_of_interest) {
                setEquipmentsWithQty(contactData.equipments_of_interest.map(e => ({ name: e, quantity: 1, period: null, unit: 'un' })));
            } else {
                setEquipmentsWithQty([]);
            }

            setUsesEquipment(contactData.uses_equipment || false);

            // 2. Fetch Interactions
            const { data: interactionsData, error: interactionsError } = await supabase
                .from('crm_contact_interactions')
                .select(`*, user:users_view(raw_user_meta_data)`)
                .eq('contact_id', contactId)
                .order('interaction_date', { ascending: false });

            if (interactionsError) console.error("Interactions error:", interactionsError);
            setInteractions(interactionsData || []);

            // 3. Fetch Deals
            const { data: dealsData, error: dealsError } = await supabase
                .from('crm_deals')
                .select('*, stage:crm_stages(name)')
                .eq('contact_id', contactId)
                .order('created_at', { ascending: false });

            if (dealsError) console.error("Deals error:", dealsError);
            setDeals(dealsData || []);

            // 4. Fetch Sales Metrics (BD-CL)
            let totalRevenue = 0;
            if (contactData.fantasy_name || contactData.corporate_name) {
                const nameToSearch = contactData.fantasy_name || contactData.corporate_name;
                const { data: salesData } = await supabase
                    .from('bd-cl')
                    .select('Total')
                    .or(`"N Fantasia".ilike.%${nameToSearch}%,"Nome".ilike.%${nameToSearch}%`)
                    .limit(1000);

                if (salesData) {
                    totalRevenue = salesData.reduce((acc, curr) => acc + (curr.Total || 0), 0);
                }
            }

            // 5. Calculate KPI Metrics
            const openDealsCount = dealsData?.filter(d => d.status !== 'won' && d.status !== 'lost').length || 0;
            const valueAtPlay = dealsData?.filter(d => d.status !== 'won' && d.status !== 'lost')
                                          .reduce((acc, curr) => acc + (curr.value || 0), 0) || 0;
            const lastActivity = interactionsData?.[0]?.interaction_date || null;

            setMetrics({
                revenue: totalRevenue,
                lastActivity,
                openDeals: openDealsCount,
                valueAtPlay
            });

            // 6. Fetch Available Options (Async)
            fetchDropdownOptions();

        } catch (error) {
            console.error("Error fetching relationship data:", error);
            toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao carregar dados do relacionamento.' });
        } finally {
            setLoading(false);
        }
    }, [contactId, toast]);

    const fetchDropdownOptions = async () => {
        try {
            const { data: filterData } = await supabase.rpc('get_all_filter_options');
            if (filterData && filterData.products) {
                setAvailableProducts(filterData.products);
            }

            const { data: equipData } = await supabase
                .from('bd_cl_inv')
                .select('Equipamento')
                .limit(2000);
            
            if (equipData) {
                const uniqueEquips = [...new Set(equipData.map(e => e.Equipamento).filter(Boolean))];
                setAvailableEquipments(uniqueEquips.sort());
            }
        } catch (e) {
            console.error("Error fetching options:", e);
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveInteraction = async () => {
        if (!newInteraction.notes) return toast({ variant: 'destructive', title: 'Erro', description: 'Adicione uma nota.' });
        setIsSubmittingInteraction(true);
        
        try {
            const { error } = await supabase.from('crm_contact_interactions').insert({
                contact_id: contactId,
                user_id: user.id,
                type: newInteraction.type,
                notes: newInteraction.notes,
                interaction_date: new Date().toISOString()
            });
            if (error) throw error;
            
            toast({ title: 'Sucesso', description: 'Interação registrada.' });
            setNewInteraction({ type: 'call', notes: '' });
            fetchData(); 
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: error.message });
        } finally {
            setIsSubmittingInteraction(false);
        }
    };

    const handleDeleteInteraction = async (id) => {
        if (!window.confirm("Tem certeza que deseja excluir esta interação?")) return;
        try {
            const { error } = await supabase.from('crm_contact_interactions').delete().eq('id', id);
            if (error) throw error;
            toast({ title: 'Interação removida' });
            fetchData();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: error.message });
        }
    };

    const handleUpdateDetailedPreferences = async (type, items) => {
        setIsSavingPreferences(true);
        try {
            if (type === 'products') setProductsWithQty(items);
            if (type === 'equipments') setEquipmentsWithQty(items);

            const currentCustomFields = details?.custom_fields || {};
            let updates = {};

            if (type === 'products') {
                updates = {
                    products_of_interest: items.map(i => i.name),
                    custom_fields: {
                        ...currentCustomFields,
                        products_with_quantity: items
                    }
                };
            } else if (type === 'equipments') {
                updates = {
                    equipments_of_interest: items.map(i => i.name),
                    custom_fields: {
                        ...currentCustomFields,
                        equipments_with_quantity: items
                    }
                };
            } else if (type === 'uses_equipment') {
                setUsesEquipment(items);
                updates = { uses_equipment: items };
            }

            const { error } = await supabase
                .from('crm_contacts')
                .update(updates)
                .eq('id', contactId);

            if (error) throw error;
            
            setDetails(prev => ({
                ...prev,
                ...updates,
                custom_fields: { ...prev.custom_fields, ...updates.custom_fields }
            }));
        } catch (error) {
            console.error("Error saving:", error);
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar.' });
        } finally {
            setIsSavingPreferences(false);
        }
    };

    const handleContactUpdate = () => {
        fetchData();
    };

    const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : '??';

    if (loading) return <div className="flex flex-col items-center justify-center h-full py-20 bg-slate-50/50"><Loader2 className="h-10 w-10 animate-spin text-indigo-500" /><p className="text-slate-500 mt-4 text-sm font-medium">Carregando informações do relacionamento...</p></div>;
    if (!details) return <div className="flex items-center justify-center h-full text-slate-400 bg-slate-50">Contato não encontrado.</div>;

    return (
        <div className={cn("flex flex-col h-full bg-slate-50/30 dark:bg-slate-900/20 overflow-hidden relative", compact ? "" : "rounded-tl-xl")}>
            
            {/* --- HEADER --- */}
            <div className="flex-none bg-white border-b border-slate-200 px-6 py-5 shadow-sm z-20 relative">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-5 w-full md:w-auto">
                        {onToggleSidebar && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={onToggleSidebar}
                                className={cn(
                                    "mr-1 shrink-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors", 
                                    !isSidebarOpen && "text-indigo-600 bg-indigo-50"
                                )}
                                title={isSidebarOpen ? "Ocultar lista" : "Mostrar lista"}
                            >
                                <span className="md:hidden flex items-center"><ChevronLeft className="h-6 w-6" /></span>
                                <span className="hidden md:inline-flex"><PanelLeft className={cn("h-5 w-5 transition-transform duration-300", !isSidebarOpen && "rotate-180")} /></span>
                            </Button>
                        )}

                        <div className="relative">
                            <Avatar className="h-14 w-14 border-2 border-slate-100 shadow-sm">
                                <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white text-lg font-bold">
                                    {getInitials(details.fantasy_name)}
                                </AvatarFallback>
                            </Avatar>
                            <span className={cn("absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white", details.status === 'ativo' ? 'bg-emerald-500' : 'bg-slate-300')}></span>
                        </div>
                        
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl md:text-2xl font-bold text-slate-900 truncate leading-tight">{details.fantasy_name}</h1>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 mt-1">
                                <div className="flex items-center gap-1.5">
                                    <Briefcase className="h-3.5 w-3.5" />
                                    <span className="truncate max-w-[150px] md:max-w-xs">{details.corporate_name || 'Sem Razão Social'}</span>
                                </div>
                                {details.email && (
                                    <>
                                        <span className="hidden md:inline text-slate-300">•</span>
                                        <div className="flex items-center gap-1.5">
                                            <Mail className="h-3.5 w-3.5" />
                                            <span className="truncate max-w-[180px]">{details.email}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        {!compact && onDeleteContact && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 border-slate-200 transition-colors" 
                                onClick={() => onDeleteContact(contactId)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" /> Excluir
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="flex-1 overflow-hidden flex flex-col relative">
                <Tabs defaultValue="interactions" className="flex-1 flex flex-col h-full">
                    
                    {/* Sticky Tabs Header */}
                    <div className="px-6 border-b bg-white z-10 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <TabsList className="w-full justify-start h-14 bg-transparent p-0 space-x-8">
                            <TabsTrigger 
                                value="interactions" 
                                className="h-full rounded-none border-b-2 border-transparent px-1 pb-0 pt-0 font-semibold text-slate-500 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 hover:text-slate-800 transition-colors text-sm"
                            >
                                Interações
                            </TabsTrigger>
                            <TabsTrigger 
                                value="details" 
                                className="h-full rounded-none border-b-2 border-transparent px-1 pb-0 pt-0 font-semibold text-slate-500 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 hover:text-slate-800 transition-colors text-sm"
                            >
                                Detalhes
                            </TabsTrigger>
                            <TabsTrigger 
                                value="deals" 
                                className="h-full rounded-none border-b-2 border-transparent px-1 pb-0 pt-0 font-semibold text-slate-500 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 hover:text-slate-800 transition-colors text-sm"
                            >
                                Negócios
                            </TabsTrigger>
                            <TabsTrigger 
                                value="products" 
                                className="h-full rounded-none border-b-2 border-transparent px-1 pb-0 pt-0 font-semibold text-slate-500 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 hover:text-slate-800 transition-colors text-sm"
                            >
                                Produtos
                            </TabsTrigger>
                            <TabsTrigger 
                                value="equipments" 
                                className="h-full rounded-none border-b-2 border-transparent px-1 pb-0 pt-0 font-semibold text-slate-500 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 hover:text-slate-800 transition-colors text-sm"
                            >
                                Equipamentos
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Scrollable Tab Content */}
                    <ScrollArea className="flex-1 bg-slate-50/50">
                        <div className="p-6 max-w-[1600px] mx-auto space-y-8 pb-20">
                            
                            {/* METRICS ROW - Visible on top of all tabs for quick context */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                                <StatCard 
                                    title="Receita Total" 
                                    value={formatCurrency(metrics.revenue)} 
                                    icon={DollarSign} 
                                    colorClass={{ bg: 'bg-emerald-100', text: 'text-emerald-600' }}
                                    subtext="Acumulado histórico"
                                />
                                <StatCard 
                                    title="Última Atividade" 
                                    value={metrics.lastActivity ? formatDistanceToNow(new Date(metrics.lastActivity), { addSuffix: true, locale: ptBR }) : 'N/A'} 
                                    icon={CalendarIcon} 
                                    colorClass={{ bg: 'bg-blue-100', text: 'text-blue-600' }}
                                    subtext="Interação registrada"
                                />
                                <StatCard 
                                    title="Negócios Abertos" 
                                    value={metrics.openDeals} 
                                    icon={Briefcase} 
                                    colorClass={{ bg: 'bg-purple-100', text: 'text-purple-600' }}
                                    subtext="Oportunidades ativas"
                                />
                                <StatCard 
                                    title="Valor em Jogo" 
                                    value={formatCurrency(metrics.valueAtPlay)} 
                                    icon={Target} 
                                    colorClass={{ bg: 'bg-orange-100', text: 'text-orange-600' }}
                                    subtext="Pipeline atual"
                                />
                            </div>

                            {/* TAB: INTERACTIONS */}
                            <TabsContent value="interactions" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <Card className="border-none shadow-md overflow-hidden">
                                    <CardHeader className="bg-white border-b px-6 py-4">
                                        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                            <MessageSquare className="h-5 w-5 text-indigo-500" />
                                            Histórico de Relacionamento
                                        </CardTitle>
                                    </CardHeader>
                                    
                                    {/* Interaction Composer */}
                                    <div className="p-6 bg-slate-50/50 border-b border-slate-100">
                                        <div className="flex gap-4 items-start">
                                            <div className="hidden sm:flex h-10 w-10 rounded-full bg-white border border-slate-200 items-center justify-center shadow-sm shrink-0">
                                                <Edit className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <Input 
                                                    placeholder="Registre uma nova interação (ligação, reunião, email...)" 
                                                    value={newInteraction.notes} 
                                                    onChange={e => setNewInteraction(p => ({ ...p, notes: e.target.value }))}
                                                    className="bg-white border-slate-200 focus:border-indigo-500 shadow-sm h-12 text-base"
                                                    onKeyDown={e => e.key === 'Enter' && handleSaveInteraction()}
                                                />
                                                <div className="flex justify-between items-center">
                                                    <Select value={newInteraction.type} onValueChange={v => setNewInteraction(p => ({ ...p, type: v }))}>
                                                        <SelectTrigger className="w-[180px] h-9 text-xs bg-white border-slate-200">
                                                            <div className="flex items-center gap-2">
                                                                {interactionIcons[newInteraction.type]}
                                                                <SelectValue />
                                                            </div>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="call">Ligação</SelectItem>
                                                            <SelectItem value="email">E-mail</SelectItem>
                                                            <SelectItem value="meeting">Reunião</SelectItem>
                                                            <SelectItem value="proposal">Proposta</SelectItem>
                                                            <SelectItem value="message">Mensagem</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Button 
                                                        onClick={handleSaveInteraction} 
                                                        disabled={isSubmittingInteraction} 
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-4 text-xs font-medium shadow-sm"
                                                    >
                                                        {isSubmittingInteraction ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Save className="h-3.5 w-3.5 mr-2" />}
                                                        Registrar
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline List */}
                                    <div className="p-0 bg-white">
                                        <div className="relative pl-10 pr-6 py-8 space-y-10 before:absolute before:left-[35px] before:top-8 before:bottom-8 before:w-[2px] before:bg-slate-100">
                                            {interactions.map((item) => (
                                                <div key={item.id} className="relative group">
                                                    {/* Icon Node */}
                                                    <div className={cn("absolute -left-[46px] top-0 h-10 w-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 transition-transform group-hover:scale-110", interactionColors[item.type])}>
                                                        {interactionIcons[item.type]}
                                                    </div>
                                                    
                                                    {/* Card Body */}
                                                    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-200">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="secondary" className="capitalize bg-slate-100 text-slate-600 hover:bg-slate-200 px-2 py-0.5 text-[10px] font-bold tracking-wide">
                                                                    {item.type}
                                                                </Badge>
                                                                <span className="text-xs text-slate-400 font-medium">por</span>
                                                                <span className="text-xs font-semibold text-slate-700">{item.user?.raw_user_meta_data?.full_name || 'Usuário'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-medium text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                                                                    <Clock className="h-3 w-3" />
                                                                    {format(new Date(item.interaction_date), "dd MMM yyyy, HH:mm", { locale: ptBR })}
                                                                </span>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-full">
                                                                            <MoreVertical className="h-3.5 w-3.5" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem onClick={() => handleDeleteInteraction(item.id)} className="text-red-600 focus:text-red-700 focus:bg-red-50">
                                                                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Excluir
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-normal">{item.notes}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {interactions.length === 0 && (
                                                <div className="text-center py-12 px-4 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50 ml-4">
                                                    <div className="bg-slate-100 p-3 rounded-full w-fit mx-auto mb-3">
                                                        <MessageSquare className="h-6 w-6 text-slate-400" />
                                                    </div>
                                                    <h3 className="text-sm font-semibold text-slate-900">Nenhuma interação registrada</h3>
                                                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Inicie o relacionamento registrando a primeira ligação, email ou reunião acima.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>

                            {/* TAB: DETAILS */}
                            <TabsContent value="details" className="mt-0">
                                <ContactDetailsTab 
                                    details={details} 
                                    onUpdateContact={handleContactUpdate}
                                />
                            </TabsContent>

                            {/* TAB: DEALS */}
                            <TabsContent value="deals" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <Card className="border-none shadow-md">
                                    <CardHeader className="bg-white border-b px-6 py-4 flex flex-row items-center justify-between">
                                        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                            <Briefcase className="h-5 w-5 text-purple-500" />
                                            Oportunidades e Negócios
                                        </CardTitle>
                                        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                                            {deals.length} Total
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="p-0 bg-white min-h-[300px]">
                                        {deals.length > 0 ? (
                                            <div className="grid grid-cols-1 divide-y divide-slate-100">
                                                {deals.map((deal) => (
                                                    <div key={deal.id} className="p-5 hover:bg-slate-50 transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-bold text-slate-800 text-base group-hover:text-indigo-700 transition-colors">{deal.title}</p>
                                                                {deal.status === 'won' && <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none">Ganho</Badge>}
                                                                {deal.status === 'lost' && <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none">Perdido</Badge>}
                                                                {deal.status === 'open' && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">Em Aberto</Badge>}
                                                            </div>
                                                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                                                <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                                                                    <Activity className="h-3 w-3" />
                                                                    {deal.stage?.name || 'Etapa desconhecida'}
                                                                </span>
                                                                <span>•</span>
                                                                <span>Criado em {format(new Date(deal.created_at), 'dd/MM/yyyy')}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                                                            <div className="text-right">
                                                                <p className="text-xs font-medium text-slate-400 uppercase">Valor Estimado</p>
                                                                <p className="text-lg font-bold text-slate-900">{formatCurrency(deal.value)}</p>
                                                            </div>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-indigo-600">
                                                                <ArrowRight className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                                <div className="bg-slate-50 p-4 rounded-full mb-4">
                                                    <Briefcase className="h-8 w-8 text-slate-300" />
                                                </div>
                                                <p className="font-medium text-slate-600">Nenhum negócio registrado</p>
                                                <p className="text-sm mt-1">Crie uma oportunidade para começar a acompanhar.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* TAB: PRODUCTS */}
                            <TabsContent value="products" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <Card className="border-none shadow-md">
                                    <CardHeader className="bg-white border-b px-6 py-4">
                                        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                            <Package className="h-5 w-5 text-amber-500" />
                                            Mix de Produtos
                                        </CardTitle>
                                        <CardDescription>Gerencie o potencial de consumo e produtos de interesse.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 bg-white min-h-[400px]">
                                        <div className="max-w-4xl mx-auto">
                                            <QuantitySelector
                                                mode="weight"
                                                options={availableProducts}
                                                selectedItems={productsWithQty}
                                                onChange={(items) => handleUpdateDetailedPreferences('products', items)}
                                                title="Produtos"
                                                placeholder="Buscar produtos no catálogo..."
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* TAB: EQUIPMENTS */}
                            <TabsContent value="equipments" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <Card className="border-none shadow-md">
                                    <CardHeader className="bg-white border-b px-6 py-4">
                                        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                            <Wrench className="h-5 w-5 text-slate-600" />
                                            Parque de Equipamentos
                                        </CardTitle>
                                        <CardDescription>Controle de comodato e equipamentos do cliente.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 bg-white min-h-[400px]">
                                        <div className="max-w-4xl mx-auto space-y-8">
                                            <div className="flex items-center justify-between p-5 border border-slate-200 rounded-xl bg-slate-50 hover:border-indigo-200 transition-colors">
                                                <div className="space-y-1">
                                                    <Label className="text-base font-semibold text-slate-900">Usa Equipamento?</Label>
                                                    <p className="text-sm text-slate-500">
                                                        Ative se o cliente possui ou necessita de equipamentos em comodato.
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={usesEquipment}
                                                    onCheckedChange={(checked) => handleUpdateDetailedPreferences('uses_equipment', checked)}
                                                    className="data-[state=checked]:bg-indigo-600"
                                                />
                                            </div>

                                            {usesEquipment && (
                                                <div className="animate-in fade-in slide-in-from-top-2 duration-300 pt-4 border-t border-slate-100">
                                                    <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Equipamentos Instalados / Solicitados</h4>
                                                    <QuantitySelector
                                                        mode="unit"
                                                        options={availableEquipments}
                                                        selectedItems={equipmentsWithQty}
                                                        onChange={(items) => handleUpdateDetailedPreferences('equipments', items)}
                                                        title="Equipamentos"
                                                        placeholder="Buscar equipamentos (bd_cl_inv)..."
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                        </div>
                    </ScrollArea>
                </Tabs>
            </div>
        </div>
    );
};

export default RelationshipDashboard;
