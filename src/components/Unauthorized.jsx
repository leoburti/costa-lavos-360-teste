import React from 'react';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 bg-background animate-in fade-in zoom-in duration-300">
            <div className="bg-card p-8 rounded-xl shadow-lg border border-border max-w-md w-full text-center">
                <div className="bg-destructive/10 p-4 rounded-full w-fit mx-auto mb-6">
                    <ShieldAlert className="h-12 w-12 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Acesso Negado</h1>
                <p className="text-muted-foreground mb-8">
                    Você não tem as permissões necessárias para acessar este recurso.
                    Entre em contato com seu administrador se acredita que isso é um erro.
                </p>
                <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Voltar
                    </Button>
                    <Button onClick={() => navigate('/dashboard')} className="bg-primary text-primary-foreground">
                        Ir para Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;