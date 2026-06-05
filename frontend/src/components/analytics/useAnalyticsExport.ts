import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { api, apiError } from "@/lib/api";
import {
  buildExportFilename,
  exportNodeToPdf,
  triggerPdfDownload,
} from "@/lib/exportPdf";

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
 * Captures the off-screen analytics report and emits a multi-page Letter-size
 * PDF. Enforces the per-day tier quota by consuming a slot on the server
 * before the PDF is generated.
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

      const pdf = await exportNodeToPdf(node, {
        filename: buildExportFilename("QM", quizTitle || "quiz"),
      });
      triggerPdfDownload(pdf);

      setQuota(next);
      setExported({ filename: pdf.filename, sizeKb: pdf.sizeKb, blobUrl: pdf.blobUrl });
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
