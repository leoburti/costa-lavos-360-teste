import React from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, Filter, Users, DollarSign, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const Reports = () => {
    const { toast } = useToast();

    const handleNotifyClick = (feature) => {
        toast({
            title: `🚧 ${feature} em breve!`,
            description: "Estamos trabalhando para trazer análises detalhadas para você. 🚀",
        });
    };

    return (
        <div className="flex flex-col h-full">
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold tracking-tight">Relatórios e Análises</h2>
                <p className="mt-2 text-base text-muted-foreground max-w-2xl mx-auto">
                    Tome decisões baseadas em dados com dashboards interativos sobre seu desempenho de vendas.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <Card className="hover:shadow-lg hover:-translate-y-1 transition-transform duration-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <FileText className="h-6 w-6 text-orange-500" />
                            Relatório de Cadastro
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            Visualize, imprima e exporte as fichas de cadastro de novos clientes e prospects qualificados.
                        </p>
                        <Button asChild className="w-full" variant="outline">
                            <Link to="/crm/client-registration-report">
                                Acessar Relatórios
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg hover:-translate-y-1 transition-transform duration-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Filter className="h-6 w-6 text-purple-500" />
                            Análise de Funil
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            Visualize as taxas de conversão em cada etapa do seu pipeline, identifique gargalos e otimize seu processo de vendas.
                        </p>
                        <Button variant="outline" className="w-full" onClick={() => handleNotifyClick('Análise de Funil')}>
                            Ver Funil de Vendas
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg hover:-translate-y-1 transition-transform duration-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <DollarSign className="h-6 w-6 text-green-500" />
                            Ticket Médio
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            Acompanhe o valor médio de cada venda e identifique oportunidades para aumentar o ticket médio por cliente.
                        </p>
                        <Button variant="outline" className="w-full" onClick={() => handleNotifyClick('Ticket Médio')}>
                            Analisar Ticket Médio
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg hover:-translate-y-1 transition-transform duration-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <TrendingUp className="h-6 w-6 text-blue-500" />
                            Taxas de Conversão
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            Meça a eficácia da sua equipe em converter leads em clientes e descubra quais estratégias estão gerando mais resultados.
                        </p>
                        <Button variant="outline" className="w-full" onClick={() => handleNotifyClick('Taxas de Conversão')}>
                            Ver Taxas de Conversão
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

export default Reports;