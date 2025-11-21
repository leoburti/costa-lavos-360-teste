import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Database, Loader2, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const sampleFamilies = [
  { nome: 'ARMARIO', descricao: 'Armários para armazenamento e transporte.' },
  { nome: 'BANDEJAS', descricao: 'Bandejas e cestos para pães e outros produtos.' },
  { nome: 'CLIMATIZADORA', descricao: 'Câmaras de climatização para fermentação.' },
  { nome: 'ESQUELETO', descricao: 'Estruturas de suporte para fornos e outros equipamentos.' },
  { nome: 'ESTUFA', descricao: 'Estufas para manutenção de temperatura de produtos.' },
  { nome: 'FORNO', descricao: 'Fornos elétricos e a gás para cocção.' },
  { nome: 'FREEZER', descricao: 'Equipamentos de congelamento.' },
  { nome: 'MINI CAMARA', descricao: 'Mini câmaras frias.' },
  { nome: 'TELAS', descricao: 'Telas para fornos e armários.' },
];

const sampleEquipment = [
  { familyName: 'ARMARIO', nome: 'ARMARIO 40X60', status: 'ativo' },
  { familyName: 'ARMARIO', nome: 'ARMARIO 40X80', status: 'ativo' },
  { familyName: 'ARMARIO', nome: 'ARMARIO 58X70', status: 'ativo' },
  { familyName: 'ARMARIO', nome: 'ARMARIO LITORAL', status: 'ativo' },
  { familyName: 'ARMARIO', nome: 'ARMARIO TRANSPORTE 58X70', status: 'ativo' },
  { familyName: 'BANDEJAS', nome: 'BANDEJA PAO DOCE GRANDE', status: 'ativo' },
  { familyName: 'BANDEJAS', nome: 'BANDEJA PAO DOCE PEQUENA', status: 'ativo' },
  { familyName: 'BANDEJAS', nome: 'CESTO', status: 'ativo' },
  { familyName: 'CLIMATIZADORA', nome: 'CLIMATIZADOR CLI 70', status: 'ativo' },
  { familyName: 'CLIMATIZADORA', nome: 'CLIMATIZADORA 20 TELAS', status: 'ativo' },
  { familyName: 'CLIMATIZADORA', nome: 'CLIMATIZADORA 40 TELAS', status: 'ativo' },
  { familyName: 'ESQUELETO', nome: 'ESQUELETO 40X80', status: 'ativo' },
  { familyName: 'ESQUELETO', nome: 'ESQUELETO 58X70', status: 'ativo' },
  { familyName: 'ESQUELETO', nome: 'ESQUELETO 60X40', status: 'ativo' },
  { familyName: 'ESTUFA', nome: 'ESTUFA 03 TELAS', status: 'ativo' },
  { familyName: 'ESTUFA', nome: 'ESTUFA 04 BANDEJAS 1 ANDAR VIDRO CURVO 220V', status: 'ativo' },
  { familyName: 'ESTUFA', nome: 'ESTUFA 06 TELAS', status: 'ativo' },
  { familyName: 'ESTUFA', nome: 'ESTUFA 08 BANDEJAS 2 ANDARES VIDRO CURVO 220V', status: 'ativo' },
  { familyName: 'ESTUFA', nome: 'ESTUFA 12 TELAS', status: 'ativo' },
  { familyName: 'FORNO', nome: 'FORNO A GÁS 8 TELAS', status: 'ativo' },
  { familyName: 'FORNO', nome: 'FORNO ELETRICO 05 TELAS', status: 'ativo' },
  { familyName: 'FORNO', nome: 'FORNO ELETRICO 05 TELAS MONO 220V', status: 'ativo' },
  { familyName: 'FORNO', nome: 'FORNO ELETRICO 05 TELAS TRIFASICO 220V', status: 'ativo' },
  { familyName: 'FORNO', nome: 'FORNO ELETRICO 05 TELAS TRIFASICO 380V', status: 'ativo' },
  { familyName: 'FORNO', nome: 'FORNO ELETRICO 08 TELAS', status: 'ativo' },
  { familyName: 'FORNO', nome: 'FORNO ELETRICO 08 TELAS MONO 220V', status: 'ativo' },
  { familyName: 'FORNO', nome: 'FORNO ELETRICO 08 TELAS TRIFASICO 220V', status: 'ativo' },
  { familyName: 'FORNO', nome: 'FORNO ELETRICO 08 TELAS TRIFASICO 380V', status: 'ativo' },
  { familyName: 'FORNO', nome: 'FORNO ELETRICO 10 TELAS', status: 'ativo' },
  { familyName: 'FORNO', nome: 'FORNO ELETRICO 10 TELAS TRIFASICO 220V', status: 'ativo' },
  { familyName: 'FORNO', nome: 'FORNO ELETRICO 10 TELAS TRIFASICO 380V', status: 'ativo' },
  { familyName: 'FORNO', nome: 'FORNO GAS 05 TELAS', status: 'ativo' },
  { familyName: 'FORNO', nome: 'FORNO GAS 08 TELAS', status: 'ativo' },
  { familyName: 'FORNO', nome: 'FORNO GAS 10 TELAS', status: 'ativo' },
  { familyName: 'FREEZER', nome: 'FREEZER 1840 LITROS 220V', status: 'ativo' },
  { familyName: 'FREEZER', nome: 'FREEZER HORIZONTAL', status: 'ativo' },
  { familyName: 'FREEZER', nome: 'FREEZER VERTICAL', status: 'ativo' },
  { familyName: 'MINI CAMARA', nome: 'MINI CAMARA', status: 'ativo' },
  { familyName: 'TELAS', nome: 'TELA 40X60', status: 'ativo' },
  { familyName: 'TELAS', nome: 'TELA 40X80', status: 'ativo' },
  { familyName: 'TELAS', nome: 'TELA 58X70', status: 'ativo' },
].map(e => ({ ...e, modelo: 'N/A', fabricante: 'N/A', serial: `N/A-${Math.random()}`, local: 'N/A' }));

const sampleQuestions = [
  { familyName: 'ARMARIO', pergunta: 'Estrutura íntegra?', campo_tipo: 'boolean', obrigatorio: true, ordem: 1 },
  { familyName: 'ARMARIO', pergunta: 'Rodas/pés funcionando?', campo_tipo: 'boolean', obrigatorio: true, ordem: 2 },
  { familyName: 'ARMARIO', pergunta: 'Pintura/acabamento OK?', campo_tipo: 'boolean', obrigatorio: true, ordem: 3 },
  { familyName: 'ARMARIO', pergunta: 'Observações gerais', campo_tipo: 'text', obrigatorio: false, ordem: 4 },
  { familyName: 'BANDEJAS', pergunta: 'Bandeja íntegra?', campo_tipo: 'boolean', obrigatorio: true, ordem: 1 },
  { familyName: 'BANDEJAS', pergunta: 'Sem deformações?', campo_tipo: 'boolean', obrigatorio: true, ordem: 2 },
  { familyName: 'BANDEJAS', pergunta: 'Observações', campo_tipo: 'text', obrigatorio: false, ordem: 3 },
  { familyName: 'CLIMATIZADORA', pergunta: 'Compressor funcionando?', campo_tipo: 'boolean', obrigatorio: true, ordem: 1 },
  { familyName: 'CLIMATIZADORA', pergunta: 'Temperatura OK?', campo_tipo: 'boolean', obrigatorio: true, ordem: 2 },
  { familyName: 'CLIMATIZADORA', pergunta: 'Ventilador funcionando?', campo_tipo: 'boolean', obrigatorio: true, ordem: 3 },
  { familyName: 'CLIMATIZADORA', pergunta: 'Observações técnicas', campo_tipo: 'text', obrigatorio: false, ordem: 4 },
  { familyName: 'ESQUELETO', pergunta: 'Estrutura íntegra?', campo_tipo: 'boolean', obrigatorio: true, ordem: 1 },
  { familyName: 'ESQUELETO', pergunta: 'Rodas/pés funcionando?', campo_tipo: 'boolean', obrigatorio: true, ordem: 2 },
  { familyName: 'ESQUELETO', pergunta: 'Pintura/acabamento OK?', campo_tipo: 'boolean', obrigatorio: true, ordem: 3 },
  { familyName: 'ESQUELETO', pergunta: 'Observações gerais', campo_tipo: 'text', obrigatorio: false, ordem: 4 },
  { familyName: 'ESTUFA', pergunta: 'Resistências funcionando?', campo_tipo: 'boolean', obrigatorio: true, ordem: 1 },
  { familyName: 'ESTUFA', pergunta: 'Temperatura uniforme?', campo_tipo: 'boolean', obrigatorio: true, ordem: 2 },
  { familyName: 'ESTUFA', pergunta: 'Vidro/porta OK?', campo_tipo: 'boolean', obrigatorio: true, ordem: 3 },
  { familyName: 'ESTUFA', pergunta: 'Termostato calibrado?', campo_tipo: 'boolean', obrigatorio: true, ordem: 4 },
  { familyName: 'ESTUFA', pergunta: 'Observações', campo_tipo: 'text', obrigatorio: false, ordem: 5 },
  { familyName: 'FORNO', pergunta: 'Resistências funcionando?', campo_tipo: 'boolean', obrigatorio: true, ordem: 1 },
  { familyName: 'FORNO', pergunta: 'Temperatura uniforme?', campo_tipo: 'boolean', obrigatorio: true, ordem: 2 },
  { familyName: 'FORNO', pergunta: 'Porta/vidro OK?', campo_tipo: 'boolean', obrigatorio: true, ordem: 3 },
  { familyName: 'FORNO', pergunta: 'Termostato calibrado?', campo_tipo: 'boolean', obrigatorio: true, ordem: 4 },
  { familyName: 'FORNO', pergunta: 'Queimadores OK? (para fornos a gás)', campo_tipo: 'boolean', obrigatorio: false, ordem: 5 },
  { familyName: 'FORNO', pergunta: 'Observações técnicas', campo_tipo: 'text', obrigatorio: false, ordem: 6 },
  { familyName: 'FREEZER', pergunta: 'Compressor funcionando?', campo_tipo: 'boolean', obrigatorio: true, ordem: 1 },
  { familyName: 'FREEZER', pergunta: 'Temperatura OK?', campo_tipo: 'boolean', obrigatorio: true, ordem: 2 },
  { familyName: 'FREEZER', pergunta: 'Vedação porta OK?', campo_tipo: 'boolean', obrigatorio: true, ordem: 3 },
  { familyName: 'FREEZER', pergunta: 'Observações', campo_tipo: 'text', obrigatorio: false, ordem: 4 },
  { familyName: 'MINI CAMARA', pergunta: 'Compressor funcionando?', campo_tipo: 'boolean', obrigatorio: true, ordem: 1 },
  { familyName: 'MINI CAMARA', pergunta: 'Temperatura OK?', campo_tipo: 'boolean', obrigatorio: true, ordem: 2 },
  { familyName: 'MINI CAMARA', pergunta: 'Isolamento OK?', campo_tipo: 'boolean', obrigatorio: true, ordem: 3 },
  { familyName: 'MINI CAMARA', pergunta: 'Observações', campo_tipo: 'text', obrigatorio: false, ordem: 4 },
  { familyName: 'TELAS', pergunta: 'Tela íntegra?', campo_tipo: 'boolean', obrigatorio: true, ordem: 1 },
  { familyName: 'TELAS', pergunta: 'Sem deformações?', campo_tipo: 'boolean', obrigatorio: true, ordem: 2 },
  { familyName: 'TELAS', pergunta: 'Observações', campo_tipo: 'text', obrigatorio: false, ordem: 3 },
];

const SeedData = ({ onSeedComplete, familiesExist }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClearData = async () => {
    setLoading(true);
    toast({ title: 'Limpando dados existentes...', description: 'Por favor, aguarde.' });

    try {
      const { error: ansErr } = await supabase.from('maintenance_answers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (ansErr) throw ansErr;
      const { error: qErr } = await supabase.from('maintenance_question_templates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (qErr) throw qErr;
      const { error: eqErr } = await supabase.from('equipment').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (eqErr) throw eqErr;
      const { error: famErr } = await supabase.from('equipment_families').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (famErr) throw famErr;

      toast({ title: 'Dados limpos com sucesso!', description: 'Você já pode carregar os dados de exemplo.' });
      if (onSeedComplete) onSeedComplete();

    } catch (error) {
      console.error("Error clearing data:", error);
      toast({ variant: 'destructive', title: 'Erro ao limpar dados', description: `Falha ao limpar uma das tabelas: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    setLoading(true);
    toast({ title: 'Carregando dados de exemplo...', description: 'Por favor, aguarde.' });
    const now = new Date().toISOString();

    try {
      // Step 1: Insert Families
      const familiesToInsert = sampleFamilies.map(f => ({ ...f, created_at: now, updated_at: now }));
      const { data: insertedFamilies, error: familyError } = await supabase.from('equipment_families').insert(familiesToInsert).select();
      if (familyError) throw new Error(`Family insertion failed: ${familyError.message}`);
      
      const familyMap = new Map(insertedFamilies.map(f => [f.nome, f.id]));

      // Step 2: Insert Equipment
      const equipmentToInsert = sampleEquipment.map(e => {
        const { familyName, ...rest } = e;
        const family_id = familyMap.get(familyName);
        return { ...rest, family_id, created_at: now, updated_at: now };
      }).filter(e => e.family_id);
      const { data: insertedEquipment, error: equipmentError } = await supabase.from('equipment').insert(equipmentToInsert).select();
      if (equipmentError) throw new Error(`Equipment insertion failed: ${equipmentError.message}`);

      // Step 3: Insert Questions
      const questionsToInsert = sampleQuestions.map(q => {
        const { familyName, ...rest } = q;
        const family_id = familyMap.get(familyName);
        return { ...rest, family_id };
      }).filter(q => q.family_id);
      const { data: insertedQuestions, error: questionError } = await supabase.from('maintenance_question_templates').insert(questionsToInsert).select();
      if (questionError) throw new Error(`Question insertion failed: ${questionError.message}`);

      toast({
        title: 'Dados carregados com sucesso!',
        description: `${insertedFamilies.length} famílias, ${insertedEquipment.length} equipamentos e ${insertedQuestions.length} perguntas foram criados.`,
      });
      if (onSeedComplete) onSeedComplete();
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro ao carregar dados', description: error.message });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" disabled={loading || !familiesExist}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Limpar Dados
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar TODOS os Dados de Manutenção?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-bold text-destructive">ATENÇÃO:</span> Esta ação é irreversível e irá apagar permanentemente todas as famílias, equipamentos e perguntas de manutenção do banco de dados. Use com cuidado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearData} disabled={loading}>Sim, Limpar Tudo</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div tabIndex={0}>
              <Button onClick={handleSeedData} disabled={loading || familiesExist}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                Carregar Dados
              </Button>
            </div>
          </TooltipTrigger>
          {familiesExist && (
            <TooltipContent>
              <p>Os dados de exemplo já existem. Limpe os dados primeiro para recarregar.</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default SeedData;