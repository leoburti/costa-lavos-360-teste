import { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/components/ui/use-toast';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const useMaintenancePDF = () => {
    const { toast } = useToast();
    const reportRef = useRef();

    const generatePDF = async (maintenanceRecord) => {
        const elementToRender = document.createElement('div');
        elementToRender.innerHTML = document.getElementById(`accordion-content-${maintenanceRecord.id}`)?.innerHTML || '';
        
        if (!elementToRender.hasChildNodes() || !maintenanceRecord) {
            toast({
                variant: "destructive",
                title: "Erro ao gerar PDF",
                description: "Não foi possível encontrar o conteúdo para gerar o relatório.",
            });
            return;
        }

        toast({
            title: "Gerando PDF...",
            description: "Aguarde um momento, estamos preparando seu relatório.",
        });

        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const margin = 15;

            // Header
            pdf.setFontSize(18);
            pdf.setFont("helvetica", "bold");
            pdf.text("Relatório de Manutenção", pdfWidth / 2, margin, { align: 'center' });
            
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            pdf.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, pdfWidth - margin, margin, { align: 'right' });

            pdf.setLineWidth(0.5);
            pdf.line(margin, margin + 5, pdfWidth - margin, margin + 5);

            let y = margin + 15;

            // Basic Info
            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.text("Informações do Equipamento", margin, y);
            y += 7;
            pdf.setFontSize(11);
            pdf.setFont("helvetica", "normal");
            pdf.text(`Equipamento: ${maintenanceRecord.equipment?.nome || 'N/A'}`, margin, y); y += 6;
            pdf.text(`Modelo: ${maintenanceRecord.equipment?.modelo || 'N/A'}`, margin, y);
            pdf.text(`Ativo Fixo: ${maintenanceRecord.equipment?.ativo_fixo || 'N/A'}`, pdfWidth / 2, y); y += 6;
            pdf.text(`Local: ${maintenanceRecord.equipment?.local || 'N/A'}`, margin, y);
            pdf.text(`Serial: ${maintenanceRecord.equipment?.serial || 'N/A'}`, pdfWidth / 2, y); y += 10;
            
            // Maintenance Details
            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.text("Detalhes da Manutenção", margin, y); y += 7;
            pdf.setFontSize(11);
            pdf.setFont("helvetica", "normal");
            pdf.text(`Técnico: ${maintenanceRecord.tecnico || 'N/A'}`, margin, y);
            pdf.text(`Status: ${maintenanceRecord.status || 'N/A'}`, pdfWidth / 2, y); y += 6;
            const dataInicio = maintenanceRecord.data_inicio ? format(parseISO(maintenanceRecord.data_inicio), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'N/A';
            const dataFim = maintenanceRecord.data_fim ? format(parseISO(maintenanceRecord.data_fim), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'N/A';
            pdf.text(`Início: ${dataInicio}`, margin, y);
            pdf.text(`Fim: ${dataFim}`, pdfWidth / 2, y); y += 8;

            pdf.setFont("helvetica", "bold");
            pdf.text("Observações:", margin, y); y += 5;
            pdf.setFont("helvetica", "normal");
            const obsLines = pdf.splitTextToSize(maintenanceRecord.observacoes || 'Nenhuma observação.', pdfWidth - (margin * 2));
            pdf.text(obsLines, margin, y); y += (obsLines.length * 4) + 5;

            // Use html2canvas for complex parts like photos
            document.body.appendChild(elementToRender); // Add to body to be rendered
            const canvas = await html2canvas(elementToRender, { useCORS: true, scale: 2, backgroundColor: null });
            document.body.removeChild(elementToRender); // Clean up

            const imgData = canvas.toDataURL('image/png');
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * (pdfWidth - margin*2)) / imgProps.width;
            
            if (y + imgHeight > pdf.internal.pageSize.getHeight() - margin) {
                pdf.addPage();
                y = margin;
            }

            pdf.addImage(imgData, 'PNG', margin, y, pdfWidth - margin*2, imgHeight);

            const filename = `relatorio_${maintenanceRecord.equipment?.nome}_${dataInicio.split(' ')[0].replace(/\//g, '-')}.pdf`;
            pdf.save(filename);

        } catch (error) {
            console.error("Error generating PDF:", error);
            toast({
                variant: "destructive",
                title: "Erro ao gerar PDF",
                description: `Ocorreu um problema: ${error.message}`,
            });
        }
    };

    return { reportRef, generatePDF };
};