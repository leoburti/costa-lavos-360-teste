import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Generates a PDF from a DOM element and downloads it.
 * @param {HTMLElement} element - The DOM element to capture.
 * @param {string} filename - The name of the file to download.
 */
export const generatePDF = async (element, filename = 'document.pdf') => {
  if (!element) throw new Error('Elemento para geração do PDF não encontrado.');

  try {
    // Capture the element as a canvas
    // scale: 2 improves resolution for clearer text/images
    // useCORS: true is critical for loading external images (Supabase, etc.)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true, 
      logging: false,
      backgroundColor: '#ffffff', // Force white background
      windowWidth: element.scrollWidth, // Capture full width
      windowHeight: element.scrollHeight // Capture full height
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Initialize jsPDF (A4 size, portrait)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add the first page
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    // If content is longer than one page, add extra pages
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight; 
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
};