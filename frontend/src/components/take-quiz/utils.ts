import type { ParsedQuestion } from "./types";

/* ─── Labels & display helpers ─── */
export const typeLabel: Record<string, string> = {
  mcq: "MCQ",
  true_false: "True / False",
  short_answer: "Short answer",
};

export const avatarColors = ["bg-[#2b7fff]", "bg-[#f54900]", "bg-[#009689]", "bg-purple-600"];

export const initials = (name: string) =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export const fmt = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
};

/* ─── Fullscreen helpers ─── */
export function requestFullscreen() {
  const el = document.documentElement;
  if (el.requestFullscreen) return el.requestFullscreen();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyEl = el as any;
  if (anyEl.webkitRequestFullscreen) return anyEl.webkitRequestFullscreen();
  if (anyEl.msRequestFullscreen) return anyEl.msRequestFullscreen();
  return Promise.reject(new Error("Fullscreen not supported"));
}

export function exitFullscreen() {
  if (document.exitFullscreen) return document.exitFullscreen();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyDoc = document as any;
  if (anyDoc.webkitExitFullscreen) return anyDoc.webkitExitFullscreen();
  if (anyDoc.msExitFullscreen) return anyDoc.msExitFullscreen();
}

export function isFullscreen() {
  return !!(
    document.fullscreenElement ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (document as any).webkitFullscreenElement ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (document as any).msFullscreenElement
  );
}

/* ─── Clean LaTeX formula into readable unicode ─── */
export function cleanFormula(latex: string): string {
  return latex
    .replace(/\\frac\{1\}\{2\}/g, "½")
    .replace(/\\frac\{1\}\{3\}/g, "⅓")
    .replace(/\\frac\{1\}\{4\}/g, "¼")
    .replace(/\\frac\{3\}\{4\}/g, "¾")
    .replace(/\\frac\{1\}\{8\}/g, "⅛")
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2")
    .replace(/\\sqrt\{([^}]*)\}/g, "√$1")
    .replace(/\\sqrt/g, "√")
    .replace(/\\alpha/g, "α").replace(/\\beta/g, "β").replace(/\\gamma/g, "γ")
    .replace(/\\delta/g, "δ").replace(/\\Delta/g, "Δ").replace(/\\theta/g, "θ")
    .replace(/\\lambda/g, "λ").replace(/\\mu/g, "μ").replace(/\\pi/g, "π")
    .replace(/\\sigma/g, "σ").replace(/\\omega/g, "ω").replace(/\\phi/g, "φ")
    .replace(/\\epsilon/g, "ε").replace(/\\nu/g, "ν").replace(/\\rho/g, "ρ")
    .replace(/\\tau/g, "τ")
    .replace(/\\times/g, "×").replace(/\\cdot/g, "·").replace(/\\div/g, "÷")
    .replace(/\\pm/g, "±").replace(/\\mp/g, "∓")
    .replace(/\\leq/g, "≤").replace(/\\geq/g, "≥").replace(/\\neq/g, "≠")
    .replace(/\\approx/g, "≈").replace(/\\infty/g, "∞").replace(/\\propto/g, "∝")
    .replace(/\\rightarrow/g, "→").replace(/\\leftarrow/g, "←").replace(/\\to/g, "→")
    .replace(/\\Rightarrow/g, "⇒").replace(/\\Leftarrow/g, "⇐")
    .replace(/\\int_\{([^}]*)\}\^\{([^}]*)\}/g, "∫[$1→$2]")
    .replace(/\\int/g, "∫")
    .replace(/\\sum_\{([^}]*)\}\^\{([^}]*)\}/g, "Σ[$1→$2]")
    .replace(/\\sum/g, "Σ")
    .replace(/\\prod/g, "∏")
    .replace(/\\lim_\{([^}]*)\}/g, "lim($1)")
    .replace(/\\lim/g, "lim")
    .replace(/\^\{2\}/g, "²").replace(/\^\{3\}/g, "³").replace(/\^\{n\}/g, "ⁿ")
    .replace(/\^\{-1\}/g, "⁻¹").replace(/\^\{-2\}/g, "⁻²")
    .replace(/\^\{0\}/g, "⁰").replace(/\^\{1\}/g, "¹").replace(/\^\{4\}/g, "⁴")
    .replace(/\^\{5\}/g, "⁵").replace(/\^\{6\}/g, "⁶").replace(/\^\{7\}/g, "⁷")
    .replace(/\^\{8\}/g, "⁸").replace(/\^\{9\}/g, "⁹")
    .replace(/\^\{([^}]*)\}/g, "^$1")
    .replace(/\^0/g, "⁰").replace(/\^1/g, "¹").replace(/\^2/g, "²")
    .replace(/\^3/g, "³").replace(/\^4/g, "⁴").replace(/\^5/g, "⁵")
    .replace(/\^6/g, "⁶").replace(/\^7/g, "⁷").replace(/\^8/g, "⁸")
    .replace(/\^9/g, "⁹").replace(/\^n/g, "ⁿ")
    .replace(/_\{0\}/g, "₀").replace(/_\{1\}/g, "₁").replace(/_\{2\}/g, "₂")
    .replace(/_\{3\}/g, "₃").replace(/_\{4\}/g, "₄").replace(/_\{5\}/g, "₅")
    .replace(/_\{([^}]*)\}/g, "₍$1₎")
    .replace(/_0/g, "₀").replace(/_1/g, "₁").replace(/_2/g, "₂")
    .replace(/_3/g, "₃").replace(/_4/g, "₄").replace(/_5/g, "₅")
    .replace(/\\text\{([^}]*)\}/g, "$1")
    .replace(/\\mathrm\{([^}]*)\}/g, "$1")
    .replace(/\\left/g, "").replace(/\\right/g, "")
    .replace(/\\\\/g, "")
    .replace(/\\,/g, " ").replace(/\\;/g, " ").replace(/\\quad/g, "  ")
    .replace(/->/g, "→").replace(/<->/g, "⇌")
    .trim();
}

/* ─── Parse questionText into structured parts ─── */
export function parseQuestion(raw: string): ParsedQuestion {
  let text = raw;
  let formula = "";
  let code = "";
  let codeLang = "";
  let diagram = "";

  // Extract $$formula$$
  const formulaMatch = text.match(/\$\$([\s\S]*?)\$\$/);
  if (formulaMatch) {
    formula = formulaMatch[1].trim();
    if (formula.includes("\\")) formula = cleanFormula(formula);
    text = text.replace(formulaMatch[0], "").trim();
  }

  // Extract code/diagram blocks ```lang\n...\n```
  const blockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  let m: RegExpExecArray | null;
  while ((m = blockRegex.exec(raw)) !== null) {
    if (m[1] === "diagram") {
      diagram = m[2].trim();
    } else {
      code = m[2].trim();
      codeLang = m[1] || "";
    }
    text = text.replace(m[0], "").trim();
  }

  if (text.includes("\\")) text = cleanFormula(text);

  return { text, formula, code, codeLang, diagram };
}

export const difficultyBadge = (difficulty?: string) =>
  difficulty === "easy"
    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
    : difficulty === "medium"
    ? "bg-orange-50 border-orange-200 text-orange-700"
    : "bg-rose-50 border-rose-200 text-rose-700";
