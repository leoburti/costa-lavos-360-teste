import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import GoalCard from '@/components/crm/team/GoalCard';
import GoalForm from '@/components/crm/team/GoalForm';
import { crmTeamService } from '@/services/crmTeamService';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const GoalsPage = () => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

    const fetchGoals = async () => {
        setLoading(true);
        try {
            // In a real scenario, fetch all for supervisor, or only own for seller
            const data = await crmTeamService.getGoals(user?.id);
            setGoals(data);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro ao carregar metas",
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, [user]);

    const handleCreateGoal = async (data) => {
        try {
            await crmTeamService.createGoal({
                ...data,
                user_id: user.id,
                status: 'active'
            });
            toast({
                title: "Meta criada com sucesso!",
                description: `A meta "${data.title}" foi definida.`,
                variant: "success"
            });
            setOpen(false);
            fetchGoals();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro ao criar meta",
                description: error.message
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-800">Minhas Metas Ativas</h3>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={fetchGoals} disabled={loading}>
                        <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-2">
                                <Plus className="h-4 w-4" /> Nova Meta
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Definir Nova Meta</DialogTitle>
                            </DialogHeader>
                            <GoalForm onSubmit={handleCreateGoal} onCancel={() => setOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {goals.map(goal => (
                    <GoalCard key={goal.id} goal={goal} />
                ))}
                
                {!loading && goals.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-muted-foreground mb-2">Nenhuma meta definida para o período.</p>
                        <Button variant="outline" onClick={() => setOpen(true)}>Criar Primeira Meta</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GoalsPage;