import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

export const useRPCError = () => {
  const { toast } = useToast();

  const handleError = useCallback((error, functionName) => {
    console.error(`[RPC Error] ${functionName}:`, error);
    
    let message = "Ocorreu um erro ao buscar os dados.";
    if (error.message?.includes('timeout')) {
      message = "A requisição demorou muito. Tente novamente.";
    } else if (error.code === 'PGRST203') {
      message = "Erro de ambiguidade na função RPC. Contate o suporte.";
    }

    toast({
      title: "Erro de Dados",
      description: message,
      variant: "destructive"
    });
  }, [toast]);

  return { handleError };
};