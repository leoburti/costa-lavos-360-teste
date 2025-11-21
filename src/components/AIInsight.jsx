import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * [DESABILITADO] Este componente foi desativado e não renderiza nada.
 * A funcionalidade de insight de IA foi removida para garantir a estabilidade da aplicação.
 */
const AIInsight = ({ insight, loading, onRegenerate, error }) => {
    return null; // Componente desabilitado.

    /*
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <motion.div 
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-primary/5 border-2 border-primary/20 rounded-xl p-6"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <BrainCircuit className="w-6 h-6 text-primary" />
                    </div>
                </div>

                <div className="flex-grow">
                    <h3 className="text-lg font-bold text-foreground mb-2">Análise com IA</h3>
                    {loading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ) : error ? (
                        <p className="text-destructive text-sm">Erro ao carregar análise: {error}</p>
                    ) : (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{insight || 'Nenhuma análise disponível.'}</p>
                    )}
                </div>

                <div className="flex-shrink-0">
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={onRegenerate} 
                        disabled={loading}
                        className="rounded-full"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        <span className="sr-only">Gerar nova análise</span>
                    </Button>
                </div>
            </div>
            <div className="flex justify-end mt-4">
                <Badge variant="outline" className="text-xs font-mono border-primary/30 text-primary/80">
                    Powered by Gemini
                </Badge>
            </div>
        </motion.div>
    );
    */
};

export default AIInsight;