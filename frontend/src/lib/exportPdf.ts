import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

export interface ExportedPdf {
  filename: string;
  blob: Blob;
  blobUrl: string;
  sizeKb: number;
}

interface ExportNodeOptions {
  /** Final filename (without extension is fine — `.pdf` is appended if missing). */
  filename: string;
  /** JPEG quality (0–1). Lower = smaller file. Default 0.85. */
  jpegQuality?: number;
  /** Cap pixel ratio. Default 1.5 — good balance of crispness vs file size. */
  scale?: number;
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
 * Capture a DOM node and render it into a multi-page Letter-size PDF.
 * Used by both the analytics export (per-session report) and the dashboard
 * export (whole-page snapshot). Handles font readiness, foreignObject
 * rendering with a graceful fallback, per-page canvas slicing, and JPEG
 * compression so the output stays well under 2MB for typical reports.
 */
export async function exportNodeToPdf(
  node: HTMLElement,
  options: ExportNodeOptions
): Promise<ExportedPdf> {
  // Wait for web fonts + give the browser real time (not just one rAF) to
  // resolve Tailwind v4 :root CSS variables on the captured node before
  // html2canvas runs. Skipping this often produced unstyled PDFs because the
  // cloned document had unresolved `var(--color-*)` references.
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      /* ignore */
    }
  }
  // Force a synchronous layout/paint pass on the node, then yield twice so
  // the compositor commits before html2canvas reads styles.
  void node.offsetHeight;
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  await new Promise((r) => setTimeout(r, 50));

  const scale = Math.min(options.scale ?? 1.5, window.devicePixelRatio || 1.5);

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

  // foreignObjectRendering preserves CSS variables and rules natively — by
  // far the most reliable mode for Tailwind v4. If it produces a blank or
  // throws (rare Safari/Firefox edge cases), fall back to the JS renderer.
  let canvas: HTMLCanvasElement;
  try {
    canvas = await html2canvas(node, {
      ...captureOptions,
      foreignObjectRendering: true,
    });
    if (isBlankCanvas(canvas)) {
      canvas = await html2canvas(node, captureOptions);
    }
  } catch {
    canvas = await html2canvas(node, captureOptions);
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
    compress: true,
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const pxPerPage = Math.floor((pageHeight * canvas.width) / pageWidth);
  const pageCount = Math.max(1, Math.ceil(canvas.height / pxPerPage));

  // Slice the source canvas per page so each page only carries its own
  // pixels. Earlier versions embedded the full image on every page (just
  // shifted), which multiplied size by page count.
  const sliceCanvas = document.createElement("canvas");
  const sliceCtx = sliceCanvas.getContext("2d");
  if (!sliceCtx) throw new Error("Canvas 2D context unavailable");

  const quality = options.jpegQuality ?? 0.85;
  for (let i = 0; i < pageCount; i++) {
    const sy = i * pxPerPage;
    const sliceHeightPx = Math.min(pxPerPage, canvas.height - sy);
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceHeightPx;
    // White background guards against transparent regions becoming black
    // when the canvas is encoded as JPEG.
    sliceCtx.fillStyle = "#ffffff";
    sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
    sliceCtx.drawImage(
      canvas,
      0,
      sy,
      canvas.width,
      sliceHeightPx,
      0,
      0,
      canvas.width,
      sliceHeightPx
    );

    const sliceData = sliceCanvas.toDataURL("image/jpeg", quality);
    const drawHeight = (sliceHeightPx * pageWidth) / canvas.width;
    if (i > 0) pdf.addPage();
    pdf.addImage(sliceData, "JPEG", 0, 0, pageWidth, drawHeight, undefined, "FAST");
  }

  const filename = options.filename.endsWith(".pdf") ? options.filename : `${options.filename}.pdf`;
  const blob = pdf.output("blob");
  const blobUrl = URL.createObjectURL(blob);
  return {
    filename,
    blob,
    blobUrl,
    sizeKb: Math.max(1, Math.round(blob.size / 1024)),
  };
}

/** Trigger a browser download for a previously generated PDF blob. */
export function triggerPdfDownload(pdf: ExportedPdf): void {
  const a = document.createElement("a");
  a.href = pdf.blobUrl;
  a.download = pdf.filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Build a safe, dated filename like `QM-2026-06-05_my-quiz.pdf`. */
export function buildExportFilename(prefix: string, label: string): string {
  const safe = label.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "export";
  return `${prefix}-${new Date().toISOString().slice(0, 10)}_${safe}.pdf`;
}
