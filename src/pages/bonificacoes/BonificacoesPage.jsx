import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, FilePlus } from 'lucide-react';
import NewRequestView from '@/components/bonificacoes/NewRequestView';
import ConsultRequestsView from '@/components/bonificacoes/ConsultRequestsView';

const BonificacoesPage = () => {
    const [view, setView] = useState('initial'); // 'initial', 'new', 'consult'

    const handleSetView = useCallback((newView) => {
        setView(newView);
    }, []);

    const renderView = () => {
        switch (view) {
            case 'new':
                return <NewRequestView setView={handleSetView} />;
            case 'consult':
                return <ConsultRequestsView setView={handleSetView} />;
            default:
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]"
                    >
                        <Card className="w-full max-w-md text-center p-8">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold">Módulo de Bonificações</CardTitle>
                                <CardDescription>O que você gostaria de fazer?</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button size="lg" onClick={() => handleSetView('new')}>
                                    <FilePlus className="mr-2 h-5 w-5" />
                                    Nova Solicitação
                                </Button>
                                <Button size="lg" variant="outline" onClick={() => handleSetView('consult')}>
                                    <FileText className="mr-2 h-5 w-5" />
                                    Consultar Solicitações
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                );
        }
    };

    return (
        <>
            <Helmet>
                <title>Módulo de Bonificações - Costa Lavos</title>
                <meta name="description" content="Crie e gerencie solicitações de bonificação." />
            </Helmet>
            <div className="p-4 sm:p-6 lg:p-8">
                {renderView()}
            </div>
        </>
    );
};

export default BonificacoesPage;