import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function downloadPDF(title: string, columns: string[], rows: (string | number)[][]) {
  const doc = new jsPDF();

  // header
  doc.setFontSize(18);
  doc.setTextColor(26, 26, 46);
  doc.text('Faculty Information System', 14, 18);

  doc.setFontSize(13);
  doc.setTextColor(200, 73, 26);
  doc.text(title, 14, 28);

  doc.setFontSize(9);
  doc.setTextColor(107, 107, 138);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 36);

  // table
  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 42,
    headStyles: {
      fillColor: [26, 26, 46],
      textColor: [247, 244, 239],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 8.5 },
    alternateRowStyles: { fillColor: [247, 244, 239] },
    margin: { left: 14, right: 14 },
  });

  doc.save(`${title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
}