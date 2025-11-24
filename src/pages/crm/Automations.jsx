
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
    Plus, 
    Trash2, 
    Edit, 
    Play, 
    Zap, 
    Activity,
    CheckCircle2,
    XCircle,
    Clock
} from 'lucide-react';
import PageSkeleton from '@/components/PageSkeleton';

const Automations = () => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [automations, setAutomations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAutomation, setEditingAutomation] = useState(null);
    const [viewLogsModalOpen, setViewLogsModalOpen] = useState(false);
    const [currentLogs, setCurrentLogs] = useState([]);
    const [deleteId, setDeleteId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        trigger_type: 'contact_created',
        trigger_config: {},
        actions: []
    });

    // Action Form State (Temporary for adding new actions)
    const [newAction, setNewAction] = useState({
        type: 'create_task',
        config: {}
    });

    useEffect(() => {
        fetchAutomations();
    }, []);

    const fetchAutomations = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('automations')
                .select(`
                    *,
                    automation_actions (
                        *
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            // Sort actions by order within each automation
            const sortedData = data.map(auto => ({
                ...auto,
                automation_actions: auto.automation_actions.sort((a, b) => a.order - b.order)
            }));

            setAutomations(sortedData);
        } catch (error) {
            console.error('Error fetching automations:', error);
            toast({
                title: 'Erro ao carregar automações',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async (automationId) => {
        try {
            const { data, error } = await supabase
                .from('automation_logs')
                .select('*')
                .eq('automation_id', automationId)
                .order('executed_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            setCurrentLogs(data);
            setViewLogsModalOpen(true);
        } catch (error) {
            toast({
                title: 'Erro ao carregar logs',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const handleSaveAutomation = async () => {
        try {
            if (!formData.name) {
                toast({
                    title: 'Nome obrigatório',
                    description: 'Por favor, dê um nome para a automação.',
                    variant: 'destructive'
                });
                return;
            }

            const automationPayload = {
                name: formData.name,
                description: formData.description,
                trigger_type: formData.trigger_type,
                trigger_config: formData.trigger_config,
                user_id: user.id,
                updated_at: new Date()
            };

            let automationId;

            if (editingAutomation) {
                const { error } = await supabase
                    .from('automations')
                    .update(automationPayload)
                    .eq('id', editingAutomation.id);
                if (error) throw error;
                automationId = editingAutomation.id;

                // Delete existing actions to replace them (simpler logic for MVP)
                await supabase.from('automation_actions').delete().eq('automation_id', automationId);
            } else {
                const { data, error } = await supabase
                    .from('automations')
                    .insert([{ ...automationPayload, is_active: true }]) // Default active
                    .select()
                    .single();
                if (error) throw error;
                automationId = data.id;
            }

            // Insert Actions
            if (formData.actions.length > 0) {
                const actionsToInsert = formData.actions.map((action, index) => ({
                    automation_id: automationId,
                    type: action.type,
                    config: action.config,
                    order: index + 1
                }));

                const { error: actionsError } = await supabase
                    .from('automation_actions')
                    .insert(actionsToInsert);
                
                if (actionsError) throw actionsError;
            }

            toast({
                title: 'Sucesso',
                description: `Automação ${editingAutomation ? 'atualizada' : 'criada'} com sucesso.`,
                variant: 'success'
            });

            setIsModalOpen(false);
            setEditingAutomation(null);
            resetForm();
            fetchAutomations();

        } catch (error) {
            console.error('Error saving automation:', error);
            toast({
                title: 'Erro ao salvar',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        try {
            const { error } = await supabase.from('automations').delete().eq('id', deleteId);
            if (error) throw error;
            
            setAutomations(prev => prev.filter(a => a.id !== deleteId));
            toast({ title: 'Automação excluída' });
        } catch (error) {
            toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
        } finally {
            setDeleteId(null);
        }
    };

    const toggleActiveStatus = async (automation) => {
        try {
            const newStatus = !automation.is_active;
            const { error } = await supabase
                .from('automations')
                .update({ is_active: newStatus })
                .eq('id', automation.id);

            if (error) throw error;

            setAutomations(prev => prev.map(a => 
                a.id === automation.id ? { ...a, is_active: newStatus } : a
            ));

            toast({
                title: newStatus ? 'Automação ativada' : 'Automação pausada',
                description: `O fluxo "${automation.name}" foi ${newStatus ? 'ativado' : 'pausado'}.`
            });
        } catch (error) {
            toast({ title: 'Erro ao atualizar status', description: error.message, variant: 'destructive' });
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            trigger_type: 'contact_created',
            trigger_config: {},
            actions: []
        });
        setNewAction({ type: 'create_task', config: {} });
    };

    const openEditModal = (automation) => {
        setEditingAutomation(automation);
        setFormData({
            name: automation.name,
            description: automation.description,
            trigger_type: automation.trigger_type,
            trigger_config: automation.trigger_config || {},
            actions: automation.automation_actions.map(a => ({ type: a.type, config: a.config }))
        });
        setIsModalOpen(true);
    };

    const addActionToForm = () => {
        setFormData(prev => ({
            ...prev,
            actions: [...prev.actions, { ...newAction }]
        }));
        // Reset new action slightly but keep last used type for convenience
        setNewAction(prev => ({ type: prev.type, config: {} }));
    };

    const removeActionFromForm = (index) => {
        setFormData(prev => ({
            ...prev,
            actions: prev.actions.filter((_, i) => i !== index)
        }));
    };

    const triggerTypes = [
        { value: 'contact_created', label: 'Novo Contato Criado' },
        { value: 'deal_created', label: 'Nova Oportunidade Criada' },
        { value: 'deal_stage_changed', label: 'Oportunidade Mudou de Fase' },
        { value: 'task_completed', label: 'Tarefa Concluída' },
    ];

    const actionTypes = [
        { value: 'create_task', label: 'Criar Tarefa' },
        { value: 'send_email', label: 'Enviar E-mail (Simulado)' },
        { value: 'notify_user', label: 'Notificar Usuário' },
    ];

    const getTriggerLabel = (value) => triggerTypes.find(t => t.value === value)?.label || value;
    const getActionLabel = (value) => actionTypes.find(t => t.value === value)?.label || value;

    if (loading) {
        return <PageSkeleton />;
    }

    return (
        <div className="p-6 space-y-6 h-full flex flex-col bg-slate-50/50">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Automações de CRM</h1>
                    <p className="text-slate-500 mt-1">Gerencie fluxos de trabalho automáticos para aumentar a produtividade da equipe.</p>
                </div>
                <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Nova Automação
                </Button>
            </div>

            {automations.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 bg-transparent">
                    <div className="rounded-full bg-slate-100 p-4 mb-4">
                        <Zap className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900">Nenhuma automação criada</h3>
                    <p className="text-slate-500 max-w-sm mt-2 mb-6">
                        Crie sua primeira automação para eliminar tarefas manuais e padronizar seus processos de vendas.
                    </p>
                    <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
                        Começar Agora
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {automations.map((automation) => (
                        <Card key={automation.id} className={`flex flex-col transition-all hover:shadow-md ${!automation.is_active ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded-lg ${automation.is_active ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'}`}>
                                            <Zap className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{automation.name}</CardTitle>
                                            <CardDescription className="line-clamp-1 mt-1">
                                                {automation.description || 'Sem descrição'}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Switch 
                                        checked={automation.is_active} 
                                        onCheckedChange={() => toggleActiveStatus(automation)}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 pb-4">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm bg-slate-50 p-3 rounded-md border">
                                        <span className="font-medium text-slate-700 min-w-[60px]">Gatilho:</span>
                                        <Badge variant="outline" className="bg-white">
                                            {getTriggerLabel(automation.trigger_type)}
                                        </Badge>
                                    </div>
                                    
                                    <div className="relative pl-4 border-l-2 border-slate-200 space-y-3">
                                        {automation.automation_actions.slice(0, 3).map((action, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                                                <div className="w-2 h-2 rounded-full bg-slate-300 absolute -left-[5px]" />
                                                <span className="text-xs text-slate-400 uppercase tracking-wider">ENTÃO</span>
                                                <span className="font-medium">{getActionLabel(action.type)}</span>
                                            </div>
                                        ))}
                                        {automation.automation_actions.length > 3 && (
                                            <div className="text-xs text-slate-400 pl-2 pt-1">
                                                + {automation.automation_actions.length - 3} ações...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0 gap-2 border-t bg-slate-50/50 p-4 rounded-b-xl">
                                <Button variant="ghost" size="sm" className="flex-1" onClick={() => openEditModal(automation)}>
                                    <Edit className="h-4 w-4 mr-2" /> Editar
                                </Button>
                                <Button variant="ghost" size="sm" className="flex-1" onClick={() => fetchLogs(automation.id)}>
                                    <Activity className="h-4 w-4 mr-2" /> Logs
                                </Button>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteClick(automation.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingAutomation ? 'Editar Automação' : 'Nova Automação'}</DialogTitle>
                        <DialogDescription>Configure os gatilhos e ações do seu fluxo de trabalho.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome da Automação</Label>
                                <Input 
                                    id="name" 
                                    placeholder="Ex: Boas-vindas a novos leads"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Descrição</Label>
                                <Textarea 
                                    id="description" 
                                    placeholder="Descreva o objetivo desta automação..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <Zap className="h-4 w-4 text-yellow-500" /> Gatilho (Quando isso acontecer...)
                            </h4>
                            <Select 
                                value={formData.trigger_type} 
                                onValueChange={(val) => setFormData({...formData, trigger_type: val})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um gatilho" />
                                </SelectTrigger>
                                <SelectContent>
                                    {triggerTypes.map(t => (
                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            
                            {/* Dynamic Trigger Config Fields based on selection could go here */}
                            {formData.trigger_type === 'deal_stage_changed' && (
                                <div className="mt-2 p-3 bg-slate-50 rounded border text-sm">
                                    <Label className="mb-1 block">Nome da Fase de Destino (Ex: Negociação)</Label>
                                    <Input 
                                        placeholder="Digite o nome exato da fase" 
                                        value={formData.trigger_config.target_stage || ''}
                                        onChange={(e) => setFormData({
                                            ...formData, 
                                            trigger_config: { ...formData.trigger_config, target_stage: e.target.value }
                                        })}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <Play className="h-4 w-4 text-green-500" /> Ações (Faça isso...)
                            </h4>
                            
                            {/* List of added actions */}
                            {formData.actions.length > 0 ? (
                                <div className="space-y-2 mb-4">
                                    {formData.actions.map((action, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border rounded-md">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-slate-200 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                                                    {idx + 1}
                                                </span>
                                                <span className="font-medium text-sm">{getActionLabel(action.type)}</span>
                                                {action.type === 'create_task' && (
                                                    <span className="text-xs text-slate-500">- "{action.config.title || 'Nova Tarefa'}"</span>
                                                )}
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-destructive" onClick={() => removeActionFromForm(idx)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-4 border border-dashed rounded-md text-slate-400 text-sm mb-4">
                                    Nenhuma ação adicionada ainda.
                                </div>
                            )}

                            {/* Add New Action Form */}
                            <div className="bg-slate-50 p-4 rounded-lg border space-y-3">
                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold uppercase text-slate-500">Tipo de Ação</Label>
                                    <Select 
                                        value={newAction.type} 
                                        onValueChange={(val) => setNewAction({ type: val, config: {} })}
                                    >
                                        <SelectTrigger className="bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {actionTypes.map(t => (
                                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Dynamic Action Config Inputs */}
                                {newAction.type === 'create_task' && (
                                    <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                                        <Input 
                                            placeholder="Título da Tarefa" 
                                            className="bg-white"
                                            value={newAction.config.title || ''}
                                            onChange={(e) => setNewAction({
                                                ...newAction,
                                                config: { ...newAction.config, title: e.target.value }
                                            })}
                                        />
                                        <Textarea 
                                            placeholder="Descrição da Tarefa" 
                                            className="bg-white h-20"
                                            value={newAction.config.description || ''}
                                            onChange={(e) => setNewAction({
                                                ...newAction,
                                                config: { ...newAction.config, description: e.target.value }
                                            })}
                                        />
                                    </div>
                                )}

                                {newAction.type === 'send_email' && (
                                    <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                                        <Input 
                                            placeholder="Assunto do E-mail" 
                                            className="bg-white"
                                            value={newAction.config.subject || ''}
                                            onChange={(e) => setNewAction({
                                                ...newAction,
                                                config: { ...newAction.config, subject: e.target.value }
                                            })}
                                        />
                                        <Textarea 
                                            placeholder="Corpo do E-mail (Use {{nome}} para variáveis)" 
                                            className="bg-white h-24"
                                            value={newAction.config.body || ''}
                                            onChange={(e) => setNewAction({
                                                ...newAction,
                                                config: { ...newAction.config, body: e.target.value }
                                            })}
                                        />
                                    </div>
                                )}

                                <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    className="w-full mt-2"
                                    onClick={addActionToForm}
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Adicionar Ação
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveAutomation}>Salvar Automação</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Logs Modal */}
            <Dialog open={viewLogsModalOpen} onOpenChange={setViewLogsModalOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Histórico de Execuções</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Data/Hora</TableHead>
                                    <TableHead>Detalhes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                            Nenhum registro de execução encontrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentLogs.map(log => (
                                        <TableRow key={log.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {log.status === 'success' ? (
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    ) : log.status === 'failed' ? (
                                                        <XCircle className="h-4 w-4 text-red-500" />
                                                    ) : (
                                                        <Clock className="h-4 w-4 text-yellow-500" />
                                                    )}
                                                    <span className="capitalize">{log.status}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {new Date(log.executed_at).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-xs font-mono text-slate-600">
                                                {JSON.stringify(log.details)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente a automação e seus logs associados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Automations;
