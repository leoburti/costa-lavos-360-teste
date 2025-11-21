import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Target, Activity, Trophy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Team = () => {
    const { toast } = useToast();

    const handleNotifyClick = (feature) => {
        toast({
            title: `🚧 ${feature} em breve!`,
            description: "Ferramentas poderosas para sua equipe estão a caminho. 🚀",
        });
    };

    return (
        <div className="flex flex-col h-full">
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold tracking-tight">Gestão de Equipe e Produtividade</h2>
                <p className="mt-2 text-base text-muted-foreground max-w-2xl mx-auto">
                    Acompanhe metas, tarefas e a performance do seu time de vendas com ferramentas que impulsionam resultados.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg hover:-translate-y-1 transition-transform duration-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Target className="h-6 w-6 text-red-500" />
                            Definição de Metas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            Estabeleça metas de receita, negócios fechados e atividades para indivíduos ou para toda a equipe, e acompanhe o progresso em tempo real.
                        </p>
                        <Button variant="outline" className="w-full" onClick={() => handleNotifyClick('Definição de Metas')}>
                            Criar Nova Meta
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg hover:-translate-y-1 transition-transform duration-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Activity className="h-6 w-6 text-cyan-500" />
                            Acompanhamento de Atividades
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            Visualize o volume de ligações, e-mails, reuniões e tarefas de cada vendedor para identificar padrões de sucesso.
                        </p>
                        <Button variant="outline" className="w-full" onClick={() => handleNotifyClick('Acompanhamento de Atividades')}>
                            Ver Relatório de Atividades
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg hover:-translate-y-1 transition-transform duration-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Trophy className="h-6 w-6 text-amber-500" />
                            Gamificação
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            Crie competições saudáveis e rankings baseados em performance para motivar e engajar sua equipe de vendas.
                        </p>
                        <Button variant="outline" className="w-full" onClick={() => handleNotifyClick('Gamificação')}>
                            Iniciar Competição
                        </Button>
                    </CardContent>
                </Card>
            </div>
             <div className="mt-12 text-center">
                 <p className="text-muted-foreground">E muito mais está por vir...</p>
            </div>
        </div>
    );
};

export default Team;