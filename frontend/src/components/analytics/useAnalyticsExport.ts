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
 * Sample a small grid of pixels on the captured canvas. If everything is
 * white/transparent, foreignObjectRendering produced a blank result and the
 * caller should retry with the default renderer.
 */
function isBlankCanvas(canvas: HTMLCanvasElement): boolean {
  try {
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    const samples = 64;
    const stepX = Math.max(1, Math.floor(canvas.width / samples));
    const stepY = Math.max(1, Math.floor(canvas.height / samples));
    for (let y = 0; y < canvas.height; y += stepY) {
      for (let x = 0; x < canvas.width; x += stepX) {
        const [r, g, b, a] = ctx.getImageData(x, y, 1, 1).data;
        // Found any non-white, non-transparent pixel → not blank.
        if (a > 10 && (r < 250 || g < 250 || b < 250)) return false;
      }
    }
    return true;
  } catch {
    return false;
  }
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

      // Wait for web fonts + give the browser real time (not just one rAF) to
      // resolve Tailwind v4 :root CSS variables on the off-screen node before
      // capture. Without this the rasterized PDF often had no styles at all
      // because the cloned document had unresolved `var(--color-*)` references.
      if (document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch {
          /* ignore */
        }
      }
      // Force a synchronous layout/paint pass on the off-screen node, then
      // yield twice so the compositor commits before html2canvas reads styles.
      void node.offsetHeight;
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      await new Promise((r) => setTimeout(r, 50));

      // Cap pixel ratio: scale 2 on a 4K screen produced 4000+px wide canvases
      // and bloated the PDF to ~18MB. 1.5 keeps text crisp at Letter size.
      const scale = Math.min(1.5, window.devicePixelRatio || 1.5);

      // `foreignObjectRendering: true` embeds the live DOM in an SVG
      // <foreignObject> and lets the browser render it natively. This is
      // dramatically more reliable than html2canvas-pro's JS CSS engine for
      // Tailwind v4, which uses :root CSS custom properties (--color-zinc-950
      // etc.) that the JS renderer often fails to resolve in its cloned
      // iframe — producing unstyled PDFs.
      const captureOptions = {
        scale,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: false,
        logging: false,
        imageTimeout: 0,
        removeContainer: true,
        width: node.offsetWidth,
        height: node.offsetHeight,
        windowWidth: node.offsetWidth,
        windowHeight: node.offsetHeight,
      } as const;

      let canvas: HTMLCanvasElement;
      try {
        canvas = await html2canvas(node, {
          ...captureOptions,
          foreignObjectRendering: true,
        });
        // Some browsers silently produce a blank canvas with foreignObject
        // (most often when an external stylesheet is involved). Detect it
        // and fall back to the standard renderer.
        if (isBlankCanvas(canvas)) {
          canvas = await html2canvas(node, captureOptions);
        }
      } catch {
        // foreignObjectRendering can throw in Safari/Firefox edge cases.
        // Fall back to the default renderer rather than failing the export.
        canvas = await html2canvas(node, captureOptions);
      }

      // `compress: true` enables jsPDF's deflate stream compression on
      // embedded images and metadata — drops file size noticeably.
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "letter",
        compress: true,
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      // Pixels of the source canvas that map to one PDF page.
      const pxPerPage = Math.floor((pageHeight * canvas.width) / pageWidth);
      const pageCount = Math.max(1, Math.ceil(canvas.height / pxPerPage));

      // Slice the source canvas into per-page sub-canvases and embed each
      // as its own JPEG. The previous version embedded the *entire* image
      // on every page (just shifted), which multiplied size by page count.
      const sliceCanvas = document.createElement("canvas");
      const sliceCtx = sliceCanvas.getContext("2d");
      if (!sliceCtx) throw new Error("Canvas 2D context unavailable");

      for (let i = 0; i < pageCount; i++) {
        const sy = i * pxPerPage;
        const sliceHeightPx = Math.min(pxPerPage, canvas.height - sy);
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeightPx;
        // White background guards against transparent regions becoming black
        // when the canvas is encoded as JPEG.
        sliceCtx.fillStyle = "#ffffff";
        sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        sliceCtx.drawImage(canvas, 0, sy, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);

        const sliceData = sliceCanvas.toDataURL("image/jpeg", 0.85);
        const drawWidth = pageWidth;
        const drawHeight = (sliceHeightPx * pageWidth) / canvas.width;
        if (i > 0) pdf.addPage();
        pdf.addImage(sliceData, "JPEG", 0, 0, drawWidth, drawHeight, undefined, "FAST");
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
