import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

/**
 * [DESABILITADO] Este hook foi neutralizado para remover completamente as chamadas à Edge Function `generate-ai-insight`.
 * Ele retorna imediatamente um estado vazio para evitar quebras na aplicação.
 */
export const useAIInsight = (analysisType, dataContext) => {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const generateInsights = useCallback(async () => {
    // Feature desabilitada temporariamente. Retorna imediatamente.
    return;

    /*
    // Código original para reativar no futuro:
    if (!dataContext) {
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-ai-insight', {
        body: { analysisType, dataContext },
      });

      if (functionError) {
        throw functionError;
      }

      setInsight(data.insight);
      
    } catch (err) {
      console.error("Error generating AI insight:", err);
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Erro ao gerar insight de IA",
        description: "Não foi possível obter a análise da inteligência artificial. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
    */
  }, [analysisType, dataContext, toast]);

  const retry = useCallback(() => {
    generateInsights();
  }, [generateInsights]);

  return { insight, loading, error, generateInsights, retry };
};