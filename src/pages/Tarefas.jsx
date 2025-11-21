import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Briefcase, Gift, CheckSquare, HardHat, ShoppingCart, Warehouse, Loader2, ListTodo, CheckCircle, XCircle, Clock } from 'lucide-react';
import NewRequestView from '@/components/bonificacoes/NewRequestView';
import { format } from 'date-fns';

const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const BonificationStatusBadge = ({ status }) => {
    const variants = {
        'Pendente': 'bg-yellow-500',
        'Aguardando Aprovação': 'bg-yellow-500',
        'Aprovado': 'bg-green-500',
        'Rejeitado': 'bg-red-500',
    };
    const icons = {
        'Pendente': <Clock className="h-3 w-3" />,
        'Aguardando Aprovação': <Clock className="h-3 w-3" />,
        'Aprovado': <CheckCircle className="h-3 w-3" />,
        'Rejeitado': <XCircle className="h-3 w-3" />,
    }
    return <Badge className={cn('text-white flex items-center gap-1', variants[status] || 'bg-gray-400')}>{icons[status]}{status}</Badge>;
};

const TaskCategoryItem = ({ icon, label, count, active, onClick }) => (
    <Button
        variant="ghost"
        onClick={onClick}
        className={cn(
            "w-full justify-start text-base px-4 py-6 transition-all duration-200 ease-in-out",
            active ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
    >
        {React.createElement(icon, { className: "mr-3 h-5 w-5" })}
        <span className="flex-grow text-left">{label}</span>
        {count > 0 && <Badge variant={active ? "default" : "secondary"}>{count}</Badge>}
    </Button>
);

const PlaceholderContent = ({ title }) => (
    <Card className="h-full">
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>Esta seção de tarefas ainda não foi implementada.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-full text-center p-8">
            <HardHat className="w-16 h-16 text-yellow-500 mb-4" />
            <p className="text-lg font-semibold">Em Construção</p>
            <p className="text-muted-foreground mt-2">
                🚧 Este recurso não está implementado ainda—mas não se preocupe! Você pode solicitá-lo em seu próximo prompt! 🚀
            </p>
        </CardContent>
    </Card>
);

const CrmTasks = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCrmTasks = async () => {
            if (!user) return;
            setLoading(true);
            const { data, error } = await supabase
                .from('crm_tasks')
                .select(`id, title, status, due_date, contact:contact_id ( id, fantasy_name )`)
                .eq('user_id', user.id)
                .neq('status', 'completed');
            
            if (error) {
                toast({ variant: 'destructive', title: 'Erro ao buscar tarefas do CRM.', description: error.message });
            } else {
                setTasks(data);
            }
            setLoading(false);
        };
        fetchCrmTasks();
    }, [user, toast]);

    if (loading) return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tarefas de CRM</CardTitle>
                <CardDescription>Suas tarefas e atividades pendentes do módulo de CRM.</CardDescription>
            </CardHeader>
            <CardContent>
                {tasks.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        <CheckSquare className="mx-auto h-12 w-12 text-green-500" />
                        <p className="mt-4">Nenhuma tarefa pendente no CRM.</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {tasks.map(task => (
                            <li key={task.id} className="flex items-center gap-3 p-3 rounded-md bg-card hover:bg-muted/50 border">
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{task.title}</p>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                        {task.due_date && <p>Vence em: {new Date(task.due_date).toLocaleDateString('pt-BR')}</p>}
                                        {task.contact?.fantasy_name && <p>Cliente: {task.contact.fantasy_name}</p>}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
};

const BonificationApproval = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('bonification_requests')
            .select('*')
            .in('status', ['Pendente', 'Aguardando Aprovação']);
        
        if (error) {
            toast({ variant: 'destructive', title: 'Erro ao buscar solicitações.', description: error.message });
        } else {
            setRequests(data);
        }
        setLoading(false);
    }, [user, toast]);

    useEffect(() => {
        fetchRequests();
        
        const channel = supabase.channel('public:bonification_requests:approval')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'bonification_requests' }, (payload) => {
            console.log('Realtime update on bonification_requests for approval:', payload);
            fetchRequests();
          })
          .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchRequests]);

    if (loading) return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Aprovação de Bonificação</CardTitle>
                <CardDescription>Solicitações de bonificação pendentes de aprovação.</CardDescription>
            </CardHeader>
            <CardContent>
                {requests.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        <CheckSquare className="mx-auto h-12 w-12 text-green-500" />
                        <p className="mt-4">Nenhuma solicitação pendente.</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {requests.map(req => (
                            <li key={req.id} className="flex items-center gap-3 p-3 rounded-md bg-card hover:bg-muted/50 border">
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-medium">{req.client_name}</p>
                                        <BonificationStatusBadge status={req.status} />
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                        <p>Valor: {formatCurrency(req.total_amount)}</p>
                                        <p>Data: {format(new Date(req.request_date), 'dd/MM/yyyy')}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
};


const Tarefas = () => {
    const { user, userContext } = useAuth();
    const { toast } = useToast();
    const [activeCategory, setActiveCategory] = useState('bonification_approval');
    const [counts, setCounts] = useState({});
    const [loadingCounts, setLoadingCounts] = useState(true);

    const { approvalRoles } = userContext || {};

    const allCategories = [
        { id: 'crm_tasks', label: 'Tarefas de CRM', icon: Briefcase, component: <CrmTasks />, type: 'request' },
        { id: 'bonification_requests', label: 'Solicitações de Bonificação', icon: Gift, component: <NewRequestView />, type: 'request' },
        { id: 'bonification_approval', label: 'Aprovação de Bonificação', icon: CheckSquare, component: <BonificationApproval />, type: 'approval', role: 'bonification_approver' },
        { id: 'equipment_requests', label: 'Solicitação de Equipamentos', icon: HardHat, component: <PlaceholderContent title="Solicitação de Equipamentos" />, type: 'request' },
        { id: 'equipment_approval', label: 'Aprovação de Equipamentos', icon: CheckSquare, component: <PlaceholderContent title="Aprovação de Equipamentos" />, type: 'approval', role: 'equipment_approver' },
        { id: 'purchase_requests', label: 'Solicitação de Compras', icon: ShoppingCart, component: <PlaceholderContent title="Solicitação de Compras" />, type: 'request' },
        { id: 'purchase_requests_approval', label: 'Aprovação de Solicitação de Compras', icon: CheckSquare, component: <PlaceholderContent title="Aprovação de Solicitação de Compras" />, type: 'approval', role: 'purchase_request_approver' },
        { id: 'purchase_order_approval', label: 'Aprovação Pedido de Compra', icon: CheckSquare, component: <PlaceholderContent title="Aprovação Pedido de Compra" />, type: 'approval', role: 'purchase_order_approver' },
        { id: 'general_stock_requests', label: 'Solicitação de Estoque Geral', icon: Warehouse, component: <PlaceholderContent title="Solicitação de Estoque Geral" />, type: 'request' },
        { id: 'general_stock_approval', label: 'Aprovação de Estoque Geral', icon: CheckSquare, component: <PlaceholderContent title="Aprovação de Estoque Geral" />, type: 'approval', role: 'stock_approver' },
    ];

    const visibleCategories = allCategories.filter(cat => {
        if (cat.type === 'approval') {
            return approvalRoles && approvalRoles[cat.role];
        }
        return true; // request types are always visible
    });

    useEffect(() => {
        // Set a default active category from the visible ones
        if (visibleCategories.length > 0 && !visibleCategories.find(c => c.id === activeCategory)) {
            setActiveCategory(visibleCategories[0].id);
        }
    }, [activeCategory, visibleCategories]);

    const fetchCounts = useCallback(async () => {
        if (!user) return;
        setLoadingCounts(true);
        try {
            const [crmTasks, bonificationApprovals] = await Promise.all([
                supabase.from('crm_tasks').select('id', { count: 'exact', head: true }).eq('user_id', user.id).neq('status', 'completed'),
                approvalRoles?.bonification_approver ? supabase.from('bonification_requests').select('id', { count: 'exact', head: true }).in('status', ['Pendente', 'Aguardando Aprovação']) : Promise.resolve({ count: 0, error: null }),
            ]);

            if (crmTasks.error) throw crmTasks.error;
            if (bonificationApprovals.error) throw bonificationApprovals.error;

            setCounts({
                crm_tasks: crmTasks.count,
                bonification_approval: bonificationApprovals.count,
            });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro ao buscar contagem de tarefas', description: error.message });
        } finally {
            setLoadingCounts(false);
        }
    }, [user, toast, approvalRoles]);

    useEffect(() => {
        fetchCounts();
        
        const channel = supabase.channel('public:bonification_requests:tasks')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'bonification_requests' }, (payload) => {
            fetchCounts();
          })
          .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchCounts]);

    const activeComponent = visibleCategories.find(c => c.id === activeCategory)?.component;

    return (
        <>
            <Helmet>
                <title>Tarefas - Costa Lavos</title>
                <meta name="description" content="Central de tarefas e solicitações." />
            </Helmet>
            <div className="container mx-auto p-4 md:p-6 lg:p-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Central de Tarefas</h1>
                    <p className="text-muted-foreground mt-2">Gerencie suas solicitações e aprovações em um só lugar.</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
                    <aside className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ListTodo />
                                    Categorias
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-2">
                                <ScrollArea className="h-[65vh]">
                                    <div className="space-y-1 pr-2">
                                        {visibleCategories.map(cat => (
                                            <TaskCategoryItem
                                                key={cat.id}
                                                icon={cat.icon}
                                                label={cat.label}
                                                count={counts[cat.id] || 0}
                                                active={activeCategory === cat.id}
                                                onClick={() => setActiveCategory(cat.id)}
                                            />
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </aside>
                    <main className="lg:col-span-3">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeCategory}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {activeComponent}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </>
    );
};

export default Tarefas;