import React from 'react';
import { Button } from '@/components/ui/button';
import { Zap, Bot, Mail, ListTodo, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Automations = () => {
    const { toast } = useToast();

    const handleNotifyClick = (feature) => {
        toast({
            title: `🚧 ${feature} em breve!`,
            description: "Esta funcionalidade avançada está em desenvolvimento. 🚀",
        });
    };

    return (
        <div className="flex flex-col h-full">
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold tracking-tight">Automação de Vendas e Marketing</h2>
                <p className="mt-2 text-base text-muted-foreground max-w-2xl mx-auto">
                    Construa fluxos de trabalho poderosos para automatizar tarefas repetitivas e acelerar seu ciclo de vendas.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg hover:-translate-y-1 transition-transform duration-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <AlertTriangle className="h-6 w-6 text-yellow-500" />
                            Gatilhos Inteligentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            Inicie automações baseadas em ações específicas, como mudança de etapa no pipeline, abertura de e-mail ou preenchimento de formulário.
                        </p>
                        <Button variant="outline" className="w-full" onClick={() => handleNotifyClick('Gatilhos Inteligentes')}>
                            Configurar Gatilho
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg hover:-translate-y-1 transition-transform duration-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Mail className="h-6 w-6 text-blue-500" />
                            E-mails Automáticos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            Crie sequências de e-mails personalizadas para nutrição de leads, follow-ups de vendas e comunicação pós-venda.
                        </p>
                        <Button variant="outline" className="w-full" onClick={() => handleNotifyClick('E-mails Automáticos')}>
                            Criar Sequência de E-mails
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg hover:-translate-y-1 transition-transform duration-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <ListTodo className="h-6 w-6 text-green-500" />
                            Criação de Tarefas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            Atribua tarefas automaticamente para sua equipe de vendas quando um lead atinge uma determinada etapa, garantindo que nenhuma oportunidade seja perdida.
                        </p>
                        <Button variant="outline" className="w-full" onClick={() => handleNotifyClick('Criação de Tarefas')}>
                            Automatizar Tarefa
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

export default Automations;