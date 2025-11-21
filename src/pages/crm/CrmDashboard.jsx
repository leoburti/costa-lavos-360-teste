import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/ui/use-toast';

const CrmDashboard = () => {
    const { toast } = useToast();
    toast({
        title: "Página em construção",
        description: "O Dashboard do CRM está sendo desenvolvido."
    });
    return (
        <>
            <Helmet>
                <title>Dashboard CRM - Costa Lavos 360</title>
            </Helmet>
            <div className="text-center">
                <h1 className="text-3xl font-bold">Dashboard do CRM</h1>
                <p className="text-muted-foreground mt-2">Esta página está em construção.</p>
            </div>
        </>
    )
}

export default CrmDashboard;