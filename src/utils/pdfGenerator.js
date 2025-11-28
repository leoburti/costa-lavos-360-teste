import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

export const generatePDF = async (element, filename = `document_${format(new Date(), 'dd-MM-yyyy')}.pdf`) => {
  if (!element) {
    throw new Error('Elemento para conversão em PDF não fornecido.');
  }
  
  try {
    // Hide all elements except the one we want to print
    const allElements = document.body.children;
    for (let i = 0; i < allElements.length; i++) {
        if (allElements[i] !== element && allElements[i].style) {
            allElements[i].style.visibility = 'hidden';
        }
    }
    
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false, // Turn off verbose logging
      backgroundColor: '#ffffff'
    });
    
    // Restore visibility of all elements
    for (let i = 0; i < allElements.length; i++) {
        if (allElements[i].style) {
            allElements[i].style.visibility = 'visible';
        }
    }

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / pdfWidth;
    const imgHeight = canvasHeight / ratio;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Restore visibility in case of error
    const allElements = document.body.children;
    for (let i = 0; i < allElements.length; i++) {
        if (allElements[i].style) {
            allElements[i].style.visibility = 'visible';
        }
    }
    throw new Error('Falha na geração do PDF. Verifique o console para mais detalhes.');
  }
};