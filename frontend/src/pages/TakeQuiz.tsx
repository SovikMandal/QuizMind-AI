import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Radio,
  Clock,
  Timer,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  Users,
  Maximize,
  AlertTriangle,
  Shield,
  Lock,
  Eye,
} from "lucide-react";
import { api, apiError } from "@/lib/api";
import toast from "react-hot-toast";
import { connectQuizSocket } from "@/lib/socket";
import { Button, Card, Badge, cn } from "@/components/ui";
import { TakeQuizSkeleton } from "@/components/TakeQuizSkeleton";

/* ─── Types ─── */
interface Opt { id: string; text: string }
interface Q { id: string; questionText: string; questionType: string; options?: Opt[]; difficulty?: string; imageUrl?: string | null }
interface TakeState {
  participantId: string;
  questions: Q[];
  quizTitle: string;
  subject?: string | null;
  difficulty?: string | null;
  scheduledAt?: string | null;
  durationMins?: number;
  participants?: number;
  completed?: boolean;
  savedAnswers?: Record<string, string>;
}

const typeLabel: Record<string, string> = {
  mcq: "MCQ",
  true_false: "True / False",
  short_answer: "Short answer",
};

interface Presence { userId: string; name: string; avatarUrl: string | null }
const avatarColors = ["bg-[#2b7fff]", "bg-[#f54900]", "bg-[#009689]", "bg-purple-600"];
const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

const fmt = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
};

/* ─── Fullscreen helpers ─── */
function requestFullscreen() {
  const el = document.documentElement;
  if (el.requestFullscreen) return el.requestFullscreen();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyEl = el as any;
  if (anyEl.webkitRequestFullscreen) return anyEl.webkitRequestFullscreen();
  if (anyEl.msRequestFullscreen) return anyEl.msRequestFullscreen();
  return Promise.reject(new Error("Fullscreen not supported"));
}

function exitFullscreen() {
  if (document.exitFullscreen) return document.exitFullscreen();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyDoc = document as any;
  if (anyDoc.webkitExitFullscreen) return anyDoc.webkitExitFullscreen();
  if (anyDoc.msExitFullscreen) return anyDoc.msExitFullscreen();
}

function isFullscreen() {
  return !!(
    document.fullscreenElement ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (document as any).webkitFullscreenElement ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (document as any).msFullscreenElement
  );
}

/* ─── Render question text with code, math, chemistry formatting ─── */
function renderQuestionText(text: string, imageUrl?: string | null) {
  const elements: React.ReactNode[] = [];

  // Split by triple backtick code blocks: ```lang\ncode\n```
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  let remaining = text;
  let blockMatch: RegExpExecArray | null;
  let lastIdx = 0;
  const segments: { type: "text" | "code"; content: string; lang?: string; start: number }[] = [];

  while ((blockMatch = codeBlockRegex.exec(text)) !== null) {
    if (blockMatch.index > lastIdx) {
      segments.push({ type: "text", content: text.slice(lastIdx, blockMatch.index), start: lastIdx });
    }
    segments.push({ type: "code", content: blockMatch[2].trim(), lang: blockMatch[1], start: blockMatch.index });
    lastIdx = blockMatch.index + blockMatch[0].length;
  }
  if (lastIdx < text.length) {
    segments.push({ type: "text", content: text.slice(lastIdx), start: lastIdx });
  }
  if (segments.length === 0) {
    segments.push({ type: "text", content: text, start: 0 });
  }

  segments.forEach((seg, i) => {
    if (seg.type === "code") {
      // Diagram blocks: render with strict whitespace preservation
      if (seg.lang === "diagram") {
        elements.push(
          <div key={`diagram-${i}`} className="my-3 rounded-lg bg-blue-50 border border-blue-100 p-4">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-blue-400">Diagram</div>
            <pre className="text-sm font-mono leading-relaxed text-blue-900 whitespace-pre overflow-hidden">
              {seg.content}
            </pre>
          </div>
        );
      } else {
        // Code blocks: format single-line code for readability
        let code = seg.content;
        if (!code.includes("\n") && code.length > 60) {
          code = code
            .replace(/;\s*/g, ";\n")
            .replace(/\{\s*/g, "{\n  ")
            .replace(/\}\s*/g, "\n}\n")
            .replace(/\n\s*\n/g, "\n")
            .trim();
        }
        elements.push(
          <div key={`code-${i}`} className="my-3 rounded-lg bg-zinc-50 border border-zinc-200 p-4">
            {seg.lang && <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{seg.lang}</div>}
            <pre className="text-sm font-mono leading-relaxed text-zinc-800 whitespace-pre-wrap break-words">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
    } else {
      elements.push(
        <span key={`text-${i}`}>{renderRichText(seg.content)}</span>
      );
    }
  });

  return (
    <>
      {elements}
      {imageUrl && (
        <div className="mt-4 rounded-lg border border-zinc-200 overflow-hidden bg-white">
          <img src={imageUrl} alt="Question diagram" className="w-full h-auto max-h-[300px] object-contain" />
        </div>
      )}
    </>
  );
}

/* Clean LaTeX formula into readable format */
function cleanFormula(latex: string): string {
  return latex
    // Common fractions: \frac{1}{2} → ½, \frac{1}{3} → ⅓, etc.
    .replace(/\\frac\{1\}\{2\}/g, "½")
    .replace(/\\frac\{1\}\{3\}/g, "⅓")
    .replace(/\\frac\{1\}\{4\}/g, "¼")
    .replace(/\\frac\{3\}\{4\}/g, "¾")
    .replace(/\\frac\{1\}\{8\}/g, "⅛")
    // General fractions: \frac{a}{b} → a/b
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2")
    // Square root: \sqrt{x} → √x
    .replace(/\\sqrt\{([^}]*)\}/g, "√$1")
    .replace(/\\sqrt/g, "√")
    // Greek letters
    .replace(/\\alpha/g, "α").replace(/\\beta/g, "β").replace(/\\gamma/g, "γ")
    .replace(/\\delta/g, "δ").replace(/\\Delta/g, "Δ").replace(/\\theta/g, "θ")
    .replace(/\\lambda/g, "λ").replace(/\\mu/g, "μ").replace(/\\pi/g, "π")
    .replace(/\\sigma/g, "σ").replace(/\\omega/g, "ω").replace(/\\phi/g, "φ")
    .replace(/\\epsilon/g, "ε").replace(/\\nu/g, "ν").replace(/\\rho/g, "ρ")
    .replace(/\\tau/g, "τ")
    // Operators
    .replace(/\\times/g, "×").replace(/\\cdot/g, "·").replace(/\\div/g, "÷")
    .replace(/\\pm/g, "±").replace(/\\mp/g, "∓")
    .replace(/\\leq/g, "≤").replace(/\\geq/g, "≥").replace(/\\neq/g, "≠")
    .replace(/\\approx/g, "≈").replace(/\\infty/g, "∞").replace(/\\propto/g, "∝")
    .replace(/\\rightarrow/g, "→").replace(/\\leftarrow/g, "←").replace(/\\to/g, "→")
    .replace(/\\Rightarrow/g, "⇒").replace(/\\Leftarrow/g, "⇐")
    // Integrals and sums
    .replace(/\\int_\{([^}]*)\}\^\{([^}]*)\}/g, "∫[$1→$2]")
    .replace(/\\int/g, "∫")
    .replace(/\\sum_\{([^}]*)\}\^\{([^}]*)\}/g, "Σ[$1→$2]")
    .replace(/\\sum/g, "Σ")
    .replace(/\\prod/g, "∏")
    // Limits
    .replace(/\\lim_\{([^}]*)\}/g, "lim($1)")
    .replace(/\\lim/g, "lim")
    // Superscripts: x^{2} → x², common powers
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
    // Subscripts: x_{i} → xᵢ
    .replace(/_\{0\}/g, "₀").replace(/_\{1\}/g, "₁").replace(/_\{2\}/g, "₂")
    .replace(/_\{3\}/g, "₃").replace(/_\{4\}/g, "₄").replace(/_\{5\}/g, "₅")
    .replace(/_\{([^}]*)\}/g, "₍$1₎")
    .replace(/_0/g, "₀").replace(/_1/g, "₁").replace(/_2/g, "₂")
    .replace(/_3/g, "₃").replace(/_4/g, "₄").replace(/_5/g, "₅")
    // Clean up remaining LaTeX commands
    .replace(/\\text\{([^}]*)\}/g, "$1")
    .replace(/\\mathrm\{([^}]*)\}/g, "$1")
    .replace(/\\left/g, "").replace(/\\right/g, "")
    .replace(/\\\\/g, "")
    .replace(/\\,/g, " ").replace(/\\;/g, " ").replace(/\\quad/g, "  ")
    // Chemistry arrows
    .replace(/->/g, "→").replace(/<->/g, "⇌")
    .trim();
}

/* Render inline formatting: `code`, $math$, $$math$$, chemical formulas */
function renderRichText(text: string) {
  // Regex to match: $$block math$$, $inline math$, `inline code`, chemical arrows (→, ⇌)
  const tokenRegex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$|`[^`]+`)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    // Text before token
    if (match.index > lastIndex) {
      parts.push(<span key={`r-${lastIndex}`}>{formatPlainText(text.slice(lastIndex, match.index))}</span>);
    }

    const token = match[1];
    if (token.startsWith("$$") && token.endsWith("$$")) {
      // Block math/formula
      const math = token.slice(2, -2).trim();
      // Only clean if it contains LaTeX commands, otherwise show as-is
      const readable = math.includes("\\") ? cleanFormula(math) : math;
      parts.push(
        <div key={`bm-${match.index}`} className="my-3 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-center">
          <span className="font-mono text-base text-blue-900">{readable}</span>
        </div>
      );
    } else if (token.startsWith("$") && token.endsWith("$")) {
      // Inline math
      const math = token.slice(1, -1);
      const readable = math.includes("\\") ? cleanFormula(math) : math;
      parts.push(
        <span key={`im-${match.index}`} className="mx-0.5 rounded bg-blue-50 px-1.5 py-0.5 font-mono text-[14px] text-blue-800">
          {readable}
        </span>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      // Inline code
      const code = token.slice(1, -1);
      parts.push(
        <code key={`ic-${match.index}`} className="mx-0.5 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[14px] font-mono font-medium text-rose-600">
          {code}
        </code>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`r-${lastIndex}`}>{formatPlainText(text.slice(lastIndex))}</span>);
  }

  if (parts.length === 0) return <>{formatPlainText(text)}</>;
  return <>{parts}</>;
}

/* Format plain text: handle newlines, ASCII diagrams, chemical arrows, subscripts/superscripts */
function formatPlainText(text: string) {
  // Detect ASCII art/diagrams (trees, tables, box drawings)
  // Patterns: multiple lines with / \ | _ characters used for structure, or significant leading spaces
  const lines = text.split("\n");
  
  if (lines.length > 2) {
    const diagramIndicators = lines.filter(
      (l) => /[/\\|─┌┐└┘├┤┬┴┼]/.test(l) && /^\s{2,}/.test(l)
    ).length;
    // If more than 40% of lines look like diagram lines (have tree chars + leading spaces)
    if (diagramIndicators / lines.length > 0.4) {
      return (
        <pre className="my-2 rounded-lg bg-zinc-50 border border-zinc-200 p-3 text-sm font-mono leading-relaxed text-zinc-800 whitespace-pre overflow-hidden">
          {text}
        </pre>
      );
    }
  }

  if (lines.length <= 1) return <>{formatChemistry(text)}</>;

  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {formatChemistry(line)}
        </span>
      ))}
    </>
  );
}

/* Format chemistry: arrows, subscripts (H2O → H₂O), superscripts */
function formatChemistry(text: string) {
  // Detect chemical-like patterns and format them
  // Replace common arrow notations
  let formatted = text
    .replace(/->/g, "→")
    .replace(/<->/g, "⇌")
    .replace(/<=>/g, "⇌");

  // Check if it looks like a chemical equation (contains element symbols + numbers or arrows)
  const isChemical = /([A-Z][a-z]?\d*[→⇌+])|(\b(H|He|Li|Be|B|C|N|O|F|Ne|Na|Mg|Al|Si|P|S|Cl|Ar|K|Ca|Fe|Cu|Zn|Ag|Au|Pb)\d*\b.*[→⇌+])/.test(formatted);

  if (isChemical) {
    // Format subscript numbers in chemical formulas (e.g., H2O → H₂O)
    const subscriptMap: Record<string, string> = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉" };
    formatted = formatted.replace(/([A-Z][a-z]?)(\d+)/g, (_, el, num) => {
      const sub = num.split("").map((d: string) => subscriptMap[d] || d).join("");
      return el + sub;
    });
    // Format superscript charges (e.g., Fe2+ → Fe²⁺)
    const superscriptMap: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "+": "⁺", "-": "⁻" };
    formatted = formatted.replace(/(\d*[+-])(?=\s|$|→|⇌)/g, (match) => {
      return match.split("").map((c) => superscriptMap[c] || c).join("");
    });

    return (
      <span className="rounded bg-emerald-50 px-2 py-0.5 font-mono text-[15px] text-emerald-800 border border-emerald-100">
        {formatted}
      </span>
    );
  }

  return <>{formatted}</>;
}

/* ─── Fullscreen Permission Gate ─── */
function FullscreenGate({
  quizTitle,
  subject,
  difficulty,
  totalQuestions,
  durationMins,
  onGranted,
  onDenied,
}: {
  quizTitle: string;
  subject?: string | null;
  difficulty?: string | null;
  totalQuestions: number;
  durationMins: number;
  onGranted: () => void;
  onDenied: () => void;
}) {
  const [denied, setDenied] = useState(false);

  const handleEnterFullscreen = async () => {
    try {
      await requestFullscreen();
      onGranted();
    } catch {
      setDenied(true);
    }
  };

  if (denied) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
        <div className="mx-4 w-full max-w-md">
          <Card className="border-red-200/20 bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="size-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">Fullscreen Required</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              This quiz requires fullscreen mode to maintain exam integrity. You cannot take this quiz without enabling fullscreen.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button className="w-full py-3" onClick={handleEnterFullscreen}>
                <Maximize className="size-4" /> Try Again
              </Button>
              <Button variant="outline" className="w-full py-3" onClick={onDenied}>
                Go Back
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#1a1f36] to-slate-900">
      <div className="mx-4 w-full max-w-lg">
        <Card className="overflow-hidden border-0 bg-white shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2b7fff] to-[#1a6ef0] px-8 py-6 text-white">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-white/20">
                <Shield className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Quiz Security Check</h2>
                <p className="text-sm text-blue-100">Enable fullscreen to proceed</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Quiz Info */}
            <div className="mb-6 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
              <h3 className="font-semibold text-zinc-900">{quizTitle}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {subject && <Badge className="bg-blue-50 text-blue-700">{subject}</Badge>}
                {difficulty && <Badge className="bg-amber-50 capitalize text-amber-700">{difficulty}</Badge>}
                <Badge className="bg-zinc-100 text-zinc-600">{totalQuestions} questions</Badge>
                <Badge className="bg-zinc-100 text-zinc-600">{durationMins} min</Badge>
              </div>
            </div>

            {/* Rules */}
            <div className="mb-6 space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Quiz Rules</h4>
              <div className="space-y-2.5">
                {[
                  { icon: Maximize, text: "Quiz runs in fullscreen mode only" },
                  { icon: Eye, text: "Exiting fullscreen will pause the quiz" },
                  { icon: Lock, text: "Tab switching is monitored" },
                  { icon: Clock, text: "Timer continues once started" },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-zinc-50 px-3 py-2.5">
                    <Icon className="size-4 shrink-0 text-[#2b7fff]" />
                    <span className="text-sm text-zinc-700">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action */}
            <button
              onClick={handleEnterFullscreen}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#2b7fff] to-[#1a6ef0] py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98]"
            >
              <Maximize className="size-5" />
              Enter Fullscreen & Start Quiz
            </button>
            <p className="mt-3 text-center text-xs text-zinc-400">
              By proceeding, you agree to take this quiz in fullscreen mode
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ─── Fullscreen Exit Overlay ─── */
function FullscreenExitOverlay({ onReenter, violations }: { onReenter: () => void; violations: number }) {
  const handleReenter = async () => {
    try {
      await requestFullscreen();
      onReenter();
    } catch {
      toast.error("Please allow fullscreen to continue");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md">
        <Card className="border-0 bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="size-10 text-red-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900">Quiz Paused!</h2>
          <p className="mt-2 text-sm text-zinc-600">
            You exited fullscreen mode. The quiz is paused until you return to fullscreen.
          </p>
          <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
            <p className="text-sm font-medium text-amber-800">
              ⚠️ Violations: {violations}/3
            </p>
            <p className="text-xs text-amber-600 mt-1">
              After 3 violations, your quiz will be auto-submitted
            </p>
          </div>
          <button
            onClick={handleReenter}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2b7fff] to-[#1a6ef0] py-4 font-semibold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
          >
            <Maximize className="size-5" />
            Return to Fullscreen
          </button>
        </Card>
      </div>
    </div>
  );
}

/* ─── Main TakeQuiz Component ─── */
export default function TakeQuiz() {
  const { sessionId = "" } = useParams();
  const navigate = useNavigate();
  const state = (useLocation().state ?? null) as TakeState | null;

  // Hide navbar and scrollbar when this page mounts
  useEffect(() => {
    // Hide navbar
    const navbar = document.querySelector("nav");
    if (navbar) (navbar as HTMLElement).style.display = "none";
    // Hide scrollbar
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("hide-scrollbar");
    document.body.classList.add("hide-scrollbar");

    return () => {
      // Restore navbar
      if (navbar) (navbar as HTMLElement).style.display = "";
      // Restore scrollbar
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.documentElement.classList.remove("hide-scrollbar");
      document.body.classList.remove("hide-scrollbar");
    };
  }, []);

  /* Fullscreen state */
  const [fullscreenGranted, setFullscreenGranted] = useState(false);
  const [fullscreenExited, setFullscreenExited] = useState(false);
  const [violations, setViolations] = useState(0);

  const [answers, setAnswers] = useState<Record<string, string>>(() => state?.savedAnswers ?? {});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [idx, setIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [presence, setPresence] = useState<{ count: number; users: Presence[] }>({ count: 0, users: [] });
  const [connected, setConnected] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const questions = useMemo(() => state?.questions ?? [], [state]);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const submittedRef = useRef(false);
  const timeRef = useRef<Record<string, number>>({});
  const tickRef = useRef(Date.now());
  const idxRef = useRef(0);

  const deadline = useMemo(() => {
    const dur = (state?.durationMins ?? 30) * 60000;
    if (state?.scheduledAt) {
      const end = new Date(state.scheduledAt).getTime() + dur;
      if (end > Date.now()) return end;
    }
    return Date.now() + dur;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, Math.round((deadline - Date.now()) / 1000)));

  useEffect(() => {
    const prevId = questions[idxRef.current]?.id;
    if (prevId) timeRef.current[prevId] = (timeRef.current[prevId] ?? 0) + (Date.now() - tickRef.current) / 1000;
    tickRef.current = Date.now();
    idxRef.current = idx;
  }, [idx, questions]);

  const submit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    const curId = questions[idxRef.current]?.id;
    if (curId) timeRef.current[curId] = (timeRef.current[curId] ?? 0) + (Date.now() - tickRef.current) / 1000;
    try {
      // Exit fullscreen before navigation
      if (isFullscreen()) exitFullscreen();
      await api.post(`/sessions/${sessionId}/submit`, {
        answers: questions.map((q) => ({ questionId: q.id, answer: answersRef.current[q.id] ?? "", timeTaken: Math.round(timeRef.current[q.id] ?? 0) })),
      });
      navigate(`/results/${sessionId}`);
    } catch (err) {
      toast.error(apiError(err, "Could not submit your answers"));
      submittedRef.current = false;
      setSubmitting(false);
    }
  }, [questions, sessionId, navigate]);

  // Countdown; auto-submit at zero
  useEffect(() => {
    if (state?.completed) return;
    if (!fullscreenGranted) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          void submit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullscreenGranted]);

  // Fullscreen exit detection
  useEffect(() => {
    if (!fullscreenGranted) return;
    const handleChange = () => {
      if (!isFullscreen() && !submittedRef.current) {
        setFullscreenExited(true);
        setViolations((v) => {
          const next = v + 1;
          if (next >= 3) {
            toast.error("Maximum violations reached. Auto-submitting...");
            void submit();
          }
          return next;
        });
      }
    };
    document.addEventListener("fullscreenchange", handleChange);
    document.addEventListener("webkitfullscreenchange", handleChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
      document.removeEventListener("webkitfullscreenchange", handleChange);
    };
  }, [fullscreenGranted, submit]);

  // Live presence
  useEffect(() => {
    const socket = connectQuizSocket();
    socket.on("connect", () => {
      setConnected(true);
      socket.emit("presence_join", { sessionId });
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("presence_update", (d: { count: number; users: Presence[] }) => setPresence(d));
    return () => { socket.disconnect(); };
  }, [sessionId]);

  // Redirect if no state
  if (!state) {
    navigate("/discover", { replace: true });
    return null;
  }

  if (questions.length === 0) return <TakeQuizSkeleton />;

  // Show fullscreen gate before quiz
  if (!fullscreenGranted && !state.completed) {
    return (
      <FullscreenGate
        quizTitle={state.quizTitle}
        subject={state.subject}
        difficulty={state.difficulty}
        totalQuestions={questions.length}
        durationMins={state.durationMins ?? 30}
        onGranted={() => setFullscreenGranted(true)}
        onDenied={() => navigate(-1)}
      />
    );
  }

  // Show overlay if user exited fullscreen
  if (fullscreenExited && !submittedRef.current) {
    return (
      <FullscreenExitOverlay
        violations={violations}
        onReenter={() => setFullscreenExited(false)}
      />
    );
  }

  const q = questions[idx];
  const total = questions.length;
  const locked = !!state.completed;
  const answeredCount = questions.filter((x) => answers[x.id]).length;
  const flaggedCount = questions.filter((x) => flagged[x.id]).length;
  const isLive =
    !!state.scheduledAt && new Date(state.scheduledAt).getTime() + (state.durationMins ?? 30) * 60000 > Date.now();

  const chipClass = (i: number) => {
    const id = questions[i].id;
    if (i === idx) return "ring-2 ring-[#2b7fff] bg-[#2b7fff]/10 text-[#2b7fff] font-bold";
    if (flagged[id]) return "bg-amber-100 text-amber-700 border border-amber-300";
    if (answers[id]) return "bg-[#2b7fff] text-white";
    return "bg-zinc-100 text-zinc-500 hover:bg-zinc-200";
  };

  // Timer color based on urgency
  const timerColor = timeLeft <= 60 ? "text-red-500" : timeLeft <= 300 ? "text-amber-500" : "text-[#2b7fff]";
  const timerBg = timeLeft <= 60 ? "bg-red-50 border-red-200" : timeLeft <= 300 ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200";

  // Progress percentage for circular indicator
  const progressPercent = total ? (answeredCount / total) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#f8f9fb] overflow-hidden scrollbar-hide">
      {/* ═══ TOP BAR ═══ */}
      <header className="shrink-0 border-b border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left: Quiz info */}
          <div className="flex items-center gap-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#2b7fff] to-[#1a6ef0]">
              <Shield className="size-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-zinc-900 line-clamp-1 max-w-[280px]">{state.quizTitle}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                {state.subject && <span className="text-xs text-zinc-500">{state.subject}</span>}
                {state.subject && state.difficulty && <span className="text-xs text-zinc-300">•</span>}
                {state.difficulty && <span className="text-xs capitalize text-zinc-500">{state.difficulty}</span>}
              </div>
            </div>
          </div>

          {/* Center: Timer */}
          <div className={cn("flex items-center gap-3 rounded-xl border px-5 py-2.5", timerBg)}>
            <Timer className={cn("size-5", timerColor)} />
            <div className="text-center">
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Time Remaining</p>
              <p className={cn("font-mono text-xl font-bold tabular-nums leading-tight", timerColor)}>{fmt(timeLeft)}</p>
            </div>
          </div>

          {/* Right: Status + Submit Button */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2">
              <div className={cn("size-2 rounded-full", connected ? "bg-green-500 animate-pulse" : "bg-zinc-300")} />
              <span className="text-xs font-medium text-zinc-600">{connected ? "Live" : "..."}</span>
            </div>
            {isLive && (
              <div className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2">
                <Radio className="size-3 text-red-500 animate-pulse" />
                <span className="text-xs font-semibold text-red-600">LIVE</span>
              </div>
            )}
            {violations > 0 && (
              <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                <AlertTriangle className="size-3 text-amber-500" />
                <span className="text-xs font-semibold text-amber-700">{violations}/3</span>
              </div>
            )}
            <button
              onClick={() => setConfirmSubmit(true)}
              disabled={submitting || answeredCount === 0 || locked}
              className="flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none cursor-pointer"
            >
              <Send className="size-4" /> {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </header>

      {/* ═══ STATS BAR + PROGRESS ═══ */}
      <div className="shrink-0 border-b border-zinc-200 bg-white px-6 py-2.5">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[#2b7fff]" />
              <span className="text-xs font-medium text-zinc-600">Answered: <span className="font-bold text-zinc-900">{answeredCount}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-amber-400" />
              <span className="text-xs font-medium text-zinc-600">Flagged: <span className="font-bold text-zinc-900">{flaggedCount}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-zinc-300" />
              <span className="text-xs font-medium text-zinc-600">Unanswered: <span className="font-bold text-zinc-900">{total - answeredCount}</span></span>
            </div>
          </div>
          {/* Progress line + count on right */}
          <div className="flex-1 flex items-center gap-3 justify-end">
            <div className="w-48 h-1.5 rounded-full bg-zinc-100">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-[#2b7fff] to-[#1a6ef0] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-[#2b7fff]">{answeredCount}/{total} completed</span>
          </div>
        </div>
      </div>

      {locked && (
        <div className="shrink-0 border-b border-blue-100 bg-blue-50 px-6 py-2.5 text-center">
          <p className="text-sm font-medium text-blue-700">
            ✓ You've already completed this quiz — viewing submitted answers (read-only)
          </p>
        </div>
      )}

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Question List (single column, square cards, scrollable) */}
        <aside className="hidden lg:flex w-[60px] shrink-0 flex-col items-center border-r border-zinc-200 bg-white overflow-y-auto py-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d4d4d8 transparent' }}>
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={cn(
                "mb-2 flex size-10 items-center justify-center rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer",
                chipClass(i)
              )}
            >
              {i + 1}
            </button>
          ))}
        </aside>

        {/* Right: Question Content */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="flex flex-col h-full">
            {/* Single Card covering everything */}
            <Card className="border-0 shadow-none rounded-none border-l-0 flex-1 flex flex-col overflow-hidden">
              {/* Two Column: Question (40%) | Options (60%) */}
              <div className="flex-1 grid lg:grid-cols-[40%_60%] min-h-0 overflow-y-auto scrollbar-hide">
                {/* Column 1: Question */}
                <div className="p-5 flex flex-col border-r border-zinc-200">
                  <div className="flex items-center flex-wrap gap-2 mb-4">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#2b7fff] to-[#1a6ef0] text-xs font-bold text-white">
                      {idx + 1}
                    </span>
                    <Badge className="bg-purple-50 border border-purple-200 text-purple-700">{typeLabel[q.questionType] ?? q.questionType}</Badge>
                    {q.difficulty && (
                      <Badge className={cn(
                        "border",
                        q.difficulty === "easy" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                        q.difficulty === "medium" ? "bg-orange-50 border-orange-200 text-orange-700" :
                        "bg-rose-50 border-rose-200 text-rose-700"
                      )}>
                        {q.difficulty}
                      </Badge>
                    )}
                    {state.subject && (
                      <Badge className="bg-blue-50 border border-blue-200 text-blue-700">{state.subject}</Badge>
                    )}
                    <span className="ml-auto text-xs font-medium text-zinc-400">{idx + 1} / {total}</span>
                  </div>
                  {/* Question text in bordered box */}
                  <div className="rounded-xl border border-dashed border-zinc-300 p-4 mb-3">
                    <div className="text-[15px] font-medium leading-relaxed text-zinc-800">
                      {renderQuestionText(q.questionText.includes("\\") ? cleanFormula(q.questionText) : q.questionText, q.imageUrl)}
                    </div>
                  </div>
                </div>

                {/* Column 2: Options */}
                <div className="p-5 flex flex-col">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-4">Select your answer</h3>
                  {q.options && q.options.length ? (
                    <div className="flex flex-col gap-3 flex-1">
                      {q.options.map((o, i) => {
                        const selected = answers[q.id] === o.id;
                        return (
                          <button
                            key={o.id}
                            disabled={locked}
                            onClick={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))}
                            className={cn(
                              "group flex items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all duration-200",
                              selected
                                ? "border-[#2b7fff] bg-[#2b7fff]/5 shadow-sm shadow-blue-100"
                                : "border-zinc-200 hover:border-[#2b7fff]/50 hover:bg-zinc-50 hover:shadow-sm"
                            )}
                          >
                            <span
                              className={cn(
                                "flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all",
                                selected
                                  ? "border-[#2b7fff] bg-[#2b7fff] text-white"
                                  : "border-zinc-300 text-zinc-500 group-hover:border-[#2b7fff]/50"
                              )}
                            >
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span className={cn(
                              "text-sm font-medium transition-colors",
                              selected ? "text-[#2b7fff]" : "text-zinc-700"
                            )}>
                              {o.text.includes("\\") ? cleanFormula(o.text) : o.text}
                            </span>
                            {selected && <CheckCircle2 className="ml-auto size-5 text-[#2b7fff] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <textarea
                      value={answers[q.id] ?? ""}
                      disabled={locked}
                      onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                      placeholder="Type your answer here..."
                      rows={4}
                      className="w-full flex-1 rounded-xl border-2 border-zinc-200 px-4 py-3 text-sm outline-none transition-colors focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/10 resize-none"
                    />
                  )}
                </div>
              </div>

              {/* Navigation - pinned at bottom */}
              <div className="shrink-0 flex items-center justify-between border-t border-zinc-200 px-6 py-3 bg-white">
                <Button
                  variant="outline"
                  disabled={idx === 0}
                  onClick={() => setIdx((i) => i - 1)}
                  className="rounded-lg"
                >
                  <ChevronLeft className="size-4" /> Previous
                </Button>

                <Button
                  variant="ghost"
                  className={cn(
                    "rounded-lg",
                    flagged[q.id] ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : ""
                  )}
                  onClick={() => setFlagged((f) => ({ ...f, [q.id]: !f[q.id] }))}
                >
                  <Flag className={cn("size-4", flagged[q.id] && "fill-amber-500")} />
                  {flagged[q.id] ? "Flagged" : "Flag for Review"}
                </Button>

                {idx < total - 1 ? (
                  <Button onClick={() => setIdx((i) => i + 1)} className="rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white">
                    Next <ChevronRight className="size-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => setConfirmSubmit(true)}
                    disabled={locked || submitting || answeredCount === 0}
                    className="rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white"
                  >
                    <Send className="size-4" /> Submit
                  </Button>
                )}
              </div>
            </Card>

          </div>
        </main>
      </div>

      {/* Submit Confirmation Modal */}
      {confirmSubmit && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="mx-4 w-full max-w-sm border-0 p-6 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-green-50">
                <Send className="size-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">Submit Quiz?</h3>
              <p className="mt-2 text-sm text-zinc-600">
                You've answered <span className="font-bold text-[#2b7fff]">{answeredCount}</span> out of <span className="font-bold">{total}</span> questions.
                {total - answeredCount > 0 && (
                  <span className="text-amber-600"> {total - answeredCount} unanswered.</span>
                )}
              </p>
              {flaggedCount > 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  ⚠️ {flaggedCount} flagged {flaggedCount === 1 ? "question" : "questions"} pending review
                </p>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-lg py-3"
                onClick={() => setConfirmSubmit(false)}
              >
                Review
              </Button>
              <button
                onClick={() => { setConfirmSubmit(false); void submit(); }}
                disabled={submitting}
                className="flex-1 rounded-lg bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Confirm Submit"}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
