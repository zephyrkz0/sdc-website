import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { PhysicalTicketPass } from '../../types';

export const exportPassToPNG = async (elementId: string, pass: PhysicalTicketPass) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element #${elementId} not found`);
  }

  const canvas = await html2canvas(element, {
    scale: 3,
    backgroundColor: '#08080a',
    useCORS: true,
    logging: false,
  });

  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${pass.ticketId}_PASS.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportPassToPDF = async (elementId: string, pass: PhysicalTicketPass) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element #${elementId} not found`);
  }

  const canvas = await html2canvas(element, {
    scale: 3,
    backgroundColor: '#08080a',
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = 190; // mm (A4 width minus margin)
  const pageHeight = (canvas.height * imgWidth) / canvas.width;

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [imgWidth + 20, pageHeight + 20],
  });

  // Background styling in PDF
  pdf.setFillColor(8, 8, 10);
  pdf.rect(0, 0, imgWidth + 20, pageHeight + 20, 'F');

  pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, pageHeight);
  pdf.save(`${pass.ticketId}_PHYSICAL_PASS.pdf`);
};
