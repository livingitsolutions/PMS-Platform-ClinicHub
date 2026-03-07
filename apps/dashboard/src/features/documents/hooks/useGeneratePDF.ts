import { pdf } from '@react-pdf/renderer';

export function useGeneratePDF() {
  const generatePDF = async (pdfDocument: React.ReactElement, filename: string) => {
    try {
      const blob = await pdf(pdfDocument as any).toBlob();
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      throw error;
    }
  };

  return { generatePDF };
}
