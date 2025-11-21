import React from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Wrench } from 'lucide-react';

const FamiliasList = () => {
    const { toast } = useToast();
    React.useEffect(() => {
        toast({
            title: "Em Construção",
            description: "O componente FamiliasList será implementado em breve.",
            variant: "default"
        });
    }, [toast]);
    
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] border-2 border-dashed rounded-lg bg-muted/40 p-8 text-center">
            <Wrench className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-muted-foreground">Lista de Famílias</h2>
            <p className="text-sm text-muted-foreground mt-2">Este componente está em desenvolvimento.</p>
        </div>
    );
};
export default FamiliasList;