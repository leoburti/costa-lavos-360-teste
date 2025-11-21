import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, Loader2, Printer } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/customSupabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const OneOnOneReport = ({ open, onOpenChange, supervisorName, filters }) => {
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [reportData, setReportData] = useState(null);
  const { toast } = useToast();

  const generateReport = useCallback(async (data) => {
    setLoadingAI(true);
    setReport('');
    try {
        toast({
          title: "Funcionalidade de IA desativada",
          description: "A geração de relatório por IA foi temporariamente desativada.",
        });
        setReport("A geração de relatório por IA foi temporariamente desativada.");

    } catch (error) {
      console.error('Error fetching AI report:', error);
      toast({
        variant: "destructive",
        title: "Erro na Geração do Relatório de IA",
        description: `Não foi possível gerar o relatório: ${error.message}. Tente novamente mais tarde.`,
      });
      setReport("Falha ao gerar o relatório. Verifique a conexão e tente novamente.");
    } finally {
      setLoadingAI(false);
    }
  }, [toast]);

  const fetchDataAndGenerateReport = useCallback(async () => {
    if (!supervisorName) return;

    setLoading(true);
    setLoadingAI(false);
    setReportData(null);
    setReport('');

    try {
      const { data, error } = await supabase.rpc('get_supervisor_one_on_one_data', {
        p_start_date: filters.startDate,
        p_end_date: filters.endDate,
        p_supervisor_name: supervisorName,
        p_exclude_employees: filters.excludeEmployees
      });

      if (error) {
        throw new Error(error.message);
      }
      
      setReportData(data);
      await generateReport(data);

    } catch (error) {
      console.error('Error fetching one-on-one data:', error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar dados para o relatório",
        description: error.message,
      });
    } finally {
        setLoading(false);
    }
  }, [supervisorName, filters, toast, generateReport]);

  useEffect(() => {
    if (open && supervisorName) {
      fetchDataAndGenerateReport();
    }
  }, [open, supervisorName, fetchDataAndGenerateReport]);

  const handleRegenerate = () => {
    if (reportData) {
      generateReport(reportData);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Relatório One-on-One: ${supervisorName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; }
            h1, h2, h3 { color: #111; }
            h1 { font-size: 24px; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
            h2 { font-size: 20px; margin-top: 30px; }
            p, li { white-space: pre-wrap; }
            table { width: 100%; border-collapse: collapse; margin-top: 1em; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .report-container { max-width: 800px; margin: auto; padding: 20px; }
            .no-print { display: none; }
          </style>
        </head>
        <body>
          <div class="report-container">
            ${report
              .replace(/## (.*)/g, '<h2>$1</h2>')
              .replace(/### (.*)/g, '<h3>$1</h3>')
              .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
              .replace(/\* (.*)/g, '<li>$1</li>')
              .replace(/(\r\n|\n|\r)/gm, '<br>')
            }
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const isLoading = loading || loadingAI;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 border-b flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-2xl font-bold text-primary">Relatório One-on-One com o Senhor Lavos</DialogTitle>
            <DialogDescription>Análise estratégica para a reunião com {supervisorName}.</DialogDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleRegenerate} disabled={isLoading || !reportData}>
              <RefreshCw size={14} className={cn("mr-2", isLoading && "animate-spin")} />
              Gerar novamente
            </Button>
            <Button variant="ghost" size="sm" onClick={handlePrint} disabled={isLoading || !report}>
              <Printer size={14} className="mr-2" />
              Imprimir
            </Button>
          </div>
        </DialogHeader>
        <ScrollArea className="flex-1">
          <div className="p-6">
            {loading ? (
                <div className="flex items-center justify-center h-full flex-col gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="font-semibold text-muted-foreground">Buscando dados de performance do supervisor...</p>
                </div>
            ) : loadingAI ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={24} className="text-primary animate-pulse" />
                  <p className="font-semibold text-muted-foreground">A IA está analisando os dados e preparando o relatório estratégico. Isso pode levar alguns segundos...</p>
                </div>
                {[...Array(15)].map((_, i) => (
                  <div key={i} style={{width: `${Math.random() * (20 - 5) + 80}%`}} className="h-4 bg-muted/50 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-sans"
                dangerouslySetInnerHTML={{ __html: report.replace(/(\r\n|\n|\r)/gm, '<br>') }}
              />
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default OneOnOneReport;