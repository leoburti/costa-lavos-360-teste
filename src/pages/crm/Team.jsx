import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GoalsPage from './team/GoalsPage';
import ActivitiesPage from './team/ActivitiesPage';
import GamificationPage from './team/GamificationPage';
import { Target, Activity, Trophy } from 'lucide-react';

const Team = () => {
    return (
        <div className="flex flex-col h-full space-y-6 p-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Gestão de Equipe e Produtividade</h2>
                    <p className="text-muted-foreground">
                        Acompanhe o desempenho, estabeleça metas e engaje seu time.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="goals" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-md mb-6">
                    <TabsTrigger value="goals" className="flex items-center gap-2">
                        <Target className="h-4 w-4" /> Metas
                    </TabsTrigger>
                    <TabsTrigger value="activities" className="flex items-center gap-2">
                        <Activity className="h-4 w-4" /> Atividades
                    </TabsTrigger>
                    <TabsTrigger value="gamification" className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" /> Gamificação
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="goals" className="space-y-4 outline-none">
                    <GoalsPage />
                </TabsContent>

                <TabsContent value="activities" className="space-y-4 outline-none">
                    <ActivitiesPage />
                </TabsContent>

                <TabsContent value="gamification" className="space-y-4 outline-none">
                    <GamificationPage />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Team;