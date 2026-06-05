import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";

export interface ExportedFile {
  filename: string;
  sizeKb: number;
  blobUrl: string;
}

/**
 * Captures the off-screen report node with html2canvas and emits a multi-page
 * Letter-size PDF via jsPDF. Returns the success state for the modal.
 */
export function useAnalyticsExport(quizTitle: string) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState<ExportedFile | null>(null);

  const exportPdf = async () => {
    if (exporting) return;
    const node = reportRef.current;
    if (!node) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Slice the tall image across multiple PDF pages.
      let remaining = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      remaining -= pageHeight;
      while (remaining > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        remaining -= pageHeight;
      }

      const safe = quizTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "quiz";
      const filename = `QM-${new Date().toISOString().slice(0, 10)}_${safe}.pdf`;
      const blob = pdf.output("blob");
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setExported({ filename, sizeKb: Math.max(1, Math.round(blob.size / 1024)), blobUrl });
    } catch (err) {
      console.error(err);
      toast.error("Could not export report");
    } finally {
      setExporting(false);
    }
  };

  // Free the blob URL when it's replaced or the page unmounts.
  useEffect(() => {
    return () => {
      if (exported?.blobUrl) URL.revokeObjectURL(exported.blobUrl);
    };
  }, [exported?.blobUrl]);

  return {
    reportRef,
    exporting,
    exported,
    exportPdf,
    dismiss: () => setExported(null),
  };
}
