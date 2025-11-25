
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Play, BarChart2 } from 'lucide-react';
import ActivityLog from '@/components/crm/team/ActivityLog';
import { crmTeamService } from '@/services/crmTeamService';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

const ActivitiesPage = () => {
    const [activities, setActivities] = useState([]);
    const [description, setDescription] = useState('');
    const [type, setType] = useState('call');
    const { user } = useAuth();
    const { toast } = useToast();

    const fetchActivities = async () => {
        try {
            const data = await crmTeamService.getActivities({ user_id: user?.id });
            setActivities(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, [user]);

    const handleAddActivity = async () => {
        if (!description) return;
        try {
            await crmTeamService.createActivity({
                user_id: user.id,
                type,
                description,
                status: 'pending',
                points_value: 10 // Default points
            });
            setDescription('');
            fetchActivities();
            toast({ title: "Atividade registrada!" });
        } catch (error) {
            toast({ variant: "destructive", title: "Erro", description: error.message });
        }
    };

    const handleComplete = async (id) => {
        try {
            await crmTeamService.completeActivity(id);
            fetchActivities();
            toast({ 
                title: "Atividade Concluída! 🎉", 
                description: "Você ganhou 10 pontos!",
                variant: "success" 
            });
        } catch (error) {
            toast({ variant: "destructive", title: "Erro", description: error.message });
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Registro de Atividades</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 mb-6">
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="call">Ligação</SelectItem>
                                <SelectItem value="email">E-mail</SelectItem>
                                <SelectItem value="meeting">Reunião</SelectItem>
                                <SelectItem value="task">Tarefa</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input 
                            placeholder="Descreva a atividade..." 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddActivity()}
                        />
                        <Button onClick={handleAddActivity}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    <ActivityLog activities={activities} onComplete={handleComplete} />
                </CardContent>
            </Card>

            <div className="space-y-6">
                <Card className="bg-slate-50 border-slate-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <BarChart2 className="h-4 w-4" /> Resumo do Dia
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800">
                            {activities.filter(a => a.status === 'completed').length} / {activities.length}
                        </div>
                        <p className="text-xs text-muted-foreground">Atividades completadas</p>
                        
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <Button className="w-full gap-2" variant="outline">
                                <Play className="h-4 w-4" /> Iniciar Modo Foco
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ActivitiesPage;
