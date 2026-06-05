import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";
import axios from "axios";
import { api, apiError } from "@/lib/api";

export interface ExportedFile {
  filename: string;
  sizeKb: number;
  blobUrl: string;
}

export interface ExportQuota {
  used: number;
  limit: number;
  remaining: number;
  resetAt: string;
  tier: "free" | "pro" | "premium";
}

interface Options {
  sessionId: string;
  quizTitle: string;
}

/**
 * Captures the off-screen report node with html2canvas-pro and emits a
 * multi-page Letter-size PDF via jsPDF. Enforces the per-day tier quota by
 * consuming a slot on the server before generating the file.
 */
export function useAnalyticsExport({ sessionId, quizTitle }: Options) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState<ExportedFile | null>(null);
  const [quota, setQuota] = useState<ExportQuota | null>(null);

  // Read the user's current daily usage so the UI can show "X left today".
  useEffect(() => {
    api
      .get<ExportQuota>("/users/me/exports/quota")
      .then((r) => setQuota(r.data))
      .catch(() => {
        /* silent — UI falls back to letting the consume call enforce */
      });
  }, []);

  const exportPdf = async () => {
    if (exporting) return;
    const node = reportRef.current;
    if (!node) return;

    setExporting(true);
    try {
      // Reserve a slot up front so we never render a PDF the server would deny.
      let next: ExportQuota;
      try {
        const res = await api.post<ExportQuota>(`/sessions/${sessionId}/analytics/export`);
        next = res.data;
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 429) {
          const details = err.response.data?.details as ExportQuota | undefined;
          if (details) setQuota(details);
          toast.error(
            err.response.data?.error ?? "Daily export limit reached. Upgrade your plan for more.",
            { duration: 6000 }
          );
          return;
        }
        toast.error(apiError(err, "Could not start export"));
        return;
      }

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

      setQuota(next);
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
    quota,
    exportPdf,
    dismiss: () => setExported(null),
  };
}
