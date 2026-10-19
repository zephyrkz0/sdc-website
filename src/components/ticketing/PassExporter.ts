import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { PhysicalTicketPass } from '../../types';

const captureFlatNode = async (elementId: string): Promise<HTMLCanvasElement> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element #${elementId} not found`);
  }

  // Clone element into a flat, offscreen container without 3D rotation or perspective
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.transform = 'none';
  clone.style.transition = 'none';
  clone.style.position = 'fixed';
  clone.style.left = '-9999px';
  clone.style.top = '0';
  clone.style.width = `${element.offsetWidth || 580}px`;
  clone.style.zIndex = '-9999';
  document.body.appendChild(clone);

  try {
    const canvas = await html2canvas(clone, {
      scale: 3,
      backgroundColor: '#08080a',
      useCORS: true,
      allowTaint: false,
      logging: false,
    });
    return canvas;
  } finally {
    document.body.removeChild(clone);
  }
};

export const exportPassToPNG = async (elementId: string, pass: PhysicalTicketPass) => {
  const canvas = await captureFlatNode(elementId);
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${pass.ticketId}_PASS.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportPassToPDF = async (elementId: string, pass: PhysicalTicketPass) => {
  const canvas = await captureFlatNode(elementId);

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
