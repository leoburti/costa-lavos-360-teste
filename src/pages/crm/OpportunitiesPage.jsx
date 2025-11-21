import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/ui/use-toast';

const OpportunitiesPage = () => {
    const { toast } = useToast();
    toast({
        title: "Página em construção",
        description: "A página de Oportunidades do CRM está sendo desenvolvida."
    });
    return (
        <>
            <Helmet>
                <title>Oportunidades CRM - Costa Lavos 360</title>
            </Helmet>
            <div className="text-center">
                <h1 className="text-3xl font-bold">Oportunidades (CRM)</h1>
                <p className="text-muted-foreground mt-2">Esta página está em construção.</p>
            </div>
        </>
    )
}

export default OpportunitiesPage;