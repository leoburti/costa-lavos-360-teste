import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Database } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const DebugData = () => {
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkDatabase = async () => {
    setLoading(true);
    setDebugInfo(null);
    try {
      const { count: familiesCount, error: familiesError } = await supabase
        .from('equipment_families')
        .select('*', { count: 'exact', head: true });

      const { data: familiesSample, error: familiesSampleError } = await supabase
        .from('equipment_families')
        .select('*')
        .limit(5);

      if (familiesError || familiesSampleError) throw familiesError || familiesSampleError;

      const { count: equipmentCount, error: equipmentError } = await supabase
        .from('equipment')
        .select('*', { count: 'exact', head: true });

      const { data: equipmentSample, error: equipmentSampleError } = await supabase
        .from('equipment')
        .select('id, nome, family_id, status')
        .limit(5);
        
      if (equipmentError || equipmentSampleError) throw equipmentError || equipmentSampleError;

      const { count: questionsCount, error: questionsError } = await supabase
        .from('maintenance_question_templates')
        .select('*', { count: 'exact', head: true });
        
      const { data: questionsSample, error: questionsSampleError } = await supabase
        .from('maintenance_question_templates')
        .select('id, pergunta, family_id, obrigatorio')
        .limit(5);

      if (questionsError || questionsSampleError) throw questionsError || questionsSampleError;

      setDebugInfo({
        timestamp: new Date().toLocaleTimeString(),
        families: { count: familiesCount, sample: familiesSample },
        equipment: { count: equipmentCount, sample: equipmentSample },
        questions: { count: questionsCount, sample: questionsSample },
      });

    } catch (error) {
      console.error("Error checking database:", error);
      toast({
        variant: 'destructive',
        title: 'Erro ao verificar banco de dados',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-6 border-dashed border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="text-destructive" />
          Verificação do Banco de Dados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={checkDatabase} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
          Verificar Dados no Banco
        </Button>

        {debugInfo && (
          <div className="mt-4 space-y-4 text-sm">
            <p className="text-muted-foreground">Dados verificados em: {debugInfo.timestamp}</p>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  Famílias de Equipamentos ({debugInfo.families.count ?? 0} registros)
                </AccordionTrigger>
                <AccordionContent>
                  <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                    {JSON.stringify(debugInfo.families.sample, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  Equipamentos ({debugInfo.equipment.count ?? 0} registros)
                </AccordionTrigger>
                <AccordionContent>
                  <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                    {JSON.stringify(debugInfo.equipment.sample, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>
                  Perguntas de Manutenção ({debugInfo.questions.count ?? 0} registros)
                </AccordionTrigger>
                <AccordionContent>
                  <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                    {JSON.stringify(debugInfo.questions.sample, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DebugData;