import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(fieldName => {
      let value = row[fieldName];
      if (typeof value === 'string') {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportToPDF = (data, title = 'Relatório', filename = 'report.pdf') => {
  if (!data || !data.length) return;

  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, 14, 30);

  const headers = Object.keys(data[0]);
  const rows = data.map(obj => Object.values(obj));

  doc.autoTable({
    head: [headers],
    body: rows,
    startY: 40,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [131, 42, 42] }, // Primary color
  });

  doc.save(filename);
};