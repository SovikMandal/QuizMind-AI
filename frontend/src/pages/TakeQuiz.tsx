import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
  Wifi,
  Users,
  Maximize,
  AlertTriangle,
  Shield,
  Lock,
  Eye,
  Zap,
  BookOpen,
  Target,
  Award,
} from "lucide-react";
import { api, apiError } from "@/lib/api";
import toast from "react-hot-toast";
import { connectQuizSocket } from "@/lib/socket";
import { cn } from "@/components/ui";
import { TakeQuizSkeleton } from "@/components/TakeQuizSkeleton";

/* ─── Types ─── */
interface Opt { id: string; text: string }
interface Q { id: string; questionText: string; questionType: string; options?: Opt[]; difficulty?: string }
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
  mcq: "Multiple Choice",
  true_false: "True / False",
  short_answer: "Short Answer",
};

interface Presence { userId: string; name: string; avatarUrl: string | null }
const avatarColors = ["from-blue-500 to-indigo-600", "from-emerald-500 to-teal-600", "from-purple-500 to-pink-600", "from-amber-500 to-orange-600"];
const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

const fmt = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
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
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0f172a]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="relative mx-4 w-full max-w-md">
          <div className="rounded-2xl border border-red-500/20 bg-white p-8 text-center shadow-2xl shadow-red-500/10">
            <div className="mx-auto mb-5 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-red-50 to-red-100">
              <AlertTriangle className="size-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Fullscreen mode is mandatory for exam integrity. Please enable fullscreen to proceed with this assessment.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={handleEnterFullscreen}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl active:scale-[0.98]"
              >
                <Maximize className="size-4" /> Enable Fullscreen
              </button>
              <button
                onClick={onDenied}
                className="w-full rounded-xl border border-slate-200 py-3.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                Exit Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0f172a] overflow-y-auto scrollbar-hide">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.1),transparent_50%)]" />
      
      <div className="relative mx-4 w-full max-w-xl py-8">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-[#0f172a] to-[#1e293b] px-8 py-8">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.2),transparent_60%)]" />
            <div className="relative flex items-start gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
                <Shield className="size-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Secure Assessment</h2>
                <p className="mt-1 text-sm text-slate-400">Proctored examination environment</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Quiz Info Card */}
            <div className="mb-7 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5">
              <h3 className="text-lg font-bold text-slate-900">{quizTitle}</h3>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {subject && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                    <BookOpen className="size-3" /> {subject}
                  </span>
                )}
                {difficulty && (
                  <span className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold capitalize",
                    difficulty === "easy" ? "bg-emerald-50 text-emerald-700" :
                    difficulty === "medium" ? "bg-amber-50 text-amber-700" :
                    "bg-red-50 text-red-700"
                  )}>
                    <Target className="size-3" /> {difficulty}
                  </span>
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white border border-slate-100 p-3 text-center">
                  <p className="text-2xl font-bold text-slate-900">{totalQuestions}</p>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Questions</p>
                </div>
                <div className="rounded-xl bg-white border border-slate-100 p-3 text-center">
                  <p className="text-2xl font-bold text-slate-900">{durationMins}</p>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Minutes</p>
                </div>
              </div>
            </div>

            {/* Rules */}
            <div className="mb-7">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Examination Protocol</h4>
              <div className="space-y-2">
                {[
                  { icon: Maximize, text: "Fullscreen mode is required throughout", color: "text-blue-500" },
                  { icon: Eye, text: "Leaving fullscreen will pause your exam", color: "text-purple-500" },
                  { icon: Lock, text: "Tab switching triggers a violation", color: "text-amber-500" },
                  { icon: Clock, text: "Timer begins immediately upon entry", color: "text-emerald-500" },
                  { icon: AlertTriangle, text: "3 violations = automatic submission", color: "text-red-500" },
                ].map(({ icon: Icon, text, color }, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 transition-colors hover:border-slate-200">
                    <Icon className={cn("size-4 shrink-0", color)} />
                    <span className="text-sm text-slate-600">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action */}
            <button
              onClick={handleEnterFullscreen}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 py-4.5 text-base font-bold text-white shadow-xl shadow-blue-600/25 transition-all hover:shadow-2xl hover:shadow-blue-600/30 active:scale-[0.98]"
            >
              <Maximize className="size-5 transition-transform group-hover:scale-110" />
              Begin Assessment
            </button>
            <p className="mt-4 text-center text-xs text-slate-400">
              By clicking above, you agree to the examination protocols listed
            </p>
          </div>
        </div>
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0f172a]/95 backdrop-blur-md">
      <div className="mx-4 w-full max-w-sm">
        <div className="rounded-3xl bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-red-50 to-orange-50">
            <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-orange-100">
              <AlertTriangle className="size-8 text-red-500 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Exam Paused</h2>
          <p className="mt-2 text-sm text-slate-500">
            Fullscreen violation detected. Return to fullscreen to continue.
          </p>
          
          {/* Violation meter */}
          <div className="mt-5 rounded-xl bg-slate-50 border border-slate-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Violation Level</span>
              <span className={cn(
                "text-xs font-bold",
                violations >= 3 ? "text-red-600" : violations >= 2 ? "text-amber-600" : "text-slate-600"
              )}>{violations} / 3</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  violations >= 3 ? "bg-red-500" : violations >= 2 ? "bg-amber-500" : "bg-blue-500"
                )}
                style={{ width: `${(violations / 3) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              {3 - violations > 0
                ? `${3 - violations} violation${3 - violations > 1 ? "s" : ""} remaining before auto-submit`
                : "Maximum violations reached"}
            </p>
          </div>

          <button
            onClick={handleReenter}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl active:scale-[0.98]"
          >
            <Maximize className="size-5" />
            Resume Exam
          </button>
        </div>
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
    const navbar = document.querySelector("nav");
    if (navbar) (navbar as HTMLElement).style.display = "none";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("hide-scrollbar");
    document.body.classList.add("hide-scrollbar");

    return () => {
      if (navbar) (navbar as HTMLElement).style.display = "";
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
  const [showSidebar, setShowSidebar] = useState(true);

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

  // Countdown
  useEffect(() => {
    if (state?.completed) return;
    if (!fullscreenGranted) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(id); void submit(); return 0; }
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
          if (next >= 3) { toast.error("Maximum violations. Auto-submitting..."); void submit(); }
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
    socket.on("connect", () => { setConnected(true); socket.emit("presence_join", { sessionId }); });
    socket.on("disconnect", () => setConnected(false));
    socket.on("presence_update", (d: { count: number; users: Presence[] }) => setPresence(d));
    return () => { socket.disconnect(); };
  }, [sessionId]);

  if (!state) { navigate("/discover", { replace: true }); return null; }
  if (questions.length === 0) return <TakeQuizSkeleton />;

  // Show fullscreen gate
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
    return <FullscreenExitOverlay violations={violations} onReenter={() => setFullscreenExited(false)} />;
  }

  const q = questions[idx];
  const total = questions.length;
  const locked = !!state.completed;
  const answeredCount = questions.filter((x) => answers[x.id]).length;
  const flaggedCount = questions.filter((x) => flagged[x.id]).length;
  const isLive = !!state.scheduledAt && new Date(state.scheduledAt).getTime() + (state.durationMins ?? 30) * 60000 > Date.now();
  const progressPercent = total ? (answeredCount / total) * 100 : 0;

  // Timer urgency
  const timerUrgent = timeLeft <= 60;
  const timerWarning = timeLeft <= 300 && timeLeft > 60;

  const optionLetter = (i: number) => String.fromCharCode(65 + i);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 overflow-hidden scrollbar-hide">
      {/* ═══ TOP BAR ═══ */}
      <header className="relative z-10 shrink-0 border-b border-slate-200/80 bg-white">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Left: Quiz info */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-600/20">
              <Zap className="size-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-slate-900 truncate max-w-[240px]">{state.quizTitle}</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                {state.subject && <span className="text-[11px] font-medium text-slate-400">{state.subject}</span>}
                {state.subject && <span className="text-[11px] text-slate-300">·</span>}
                <span className="text-[11px] font-medium text-slate-400 capitalize">{state.difficulty || "Mixed"}</span>
                <span className="text-[11px] text-slate-300">·</span>
                <span className="text-[11px] font-medium text-slate-400">Q{idx + 1}/{total}</span>
              </div>
            </div>
          </div>

          {/* Center: Timer */}
          <div className={cn(
            "flex items-center gap-3 rounded-2xl px-6 py-2.5 transition-all",
            timerUrgent ? "bg-red-50 border border-red-200 animate-pulse" :
            timerWarning ? "bg-amber-50 border border-amber-200" :
            "bg-slate-50 border border-slate-200"
          )}>
            <div className={cn(
              "flex size-8 items-center justify-center rounded-lg",
              timerUrgent ? "bg-red-100" : timerWarning ? "bg-amber-100" : "bg-blue-100"
            )}>
              <Timer className={cn(
                "size-4",
                timerUrgent ? "text-red-600" : timerWarning ? "text-amber-600" : "text-blue-600"
              )} />
            </div>
            <div className="text-center">
              <p className={cn(
                "font-mono text-2xl font-bold tracking-tight tabular-nums leading-none",
                timerUrgent ? "text-red-600" : timerWarning ? "text-amber-600" : "text-slate-900"
              )}>
                {fmt(timeLeft)}
              </p>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 mt-0.5">remaining</p>
            </div>
          </div>

          {/* Right: Status indicators */}
          <div className="flex items-center gap-2.5">
            {/* Connection */}
            <div className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2",
              connected ? "bg-emerald-50" : "bg-slate-100"
            )}>
              <div className={cn("size-1.5 rounded-full", connected ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
              <span className={cn("text-[11px] font-semibold", connected ? "text-emerald-700" : "text-slate-500")}>
                {connected ? "Secure" : "..."}
              </span>
            </div>
            
            {isLive && (
              <div className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2">
                <Radio className="size-3 text-red-500 animate-pulse" />
                <span className="text-[11px] font-bold text-red-600">LIVE</span>
              </div>
            )}

            {violations > 0 && (
              <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                <AlertTriangle className="size-3 text-amber-600" />
                <span className="text-[11px] font-bold text-amber-700">{violations}/3</span>
              </div>
            )}

            {/* Participants */}
            {presence.count > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                <Users className="size-3.5 text-slate-400" />
                <span className="text-[11px] font-semibold text-slate-600">{presence.count}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress rail */}
        <div className="h-[3px] w-full bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {locked && (
        <div className="shrink-0 border-b border-blue-100 bg-blue-50 px-6 py-2 text-center">
          <p className="text-xs font-medium text-blue-700">✓ Completed — viewing submitted answers</p>
        </div>
      )}

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex flex-1 overflow-hidden">
        {/* Question Area */}
        <main className="flex-1 overflow-y-auto scrollbar-hide p-6 lg:p-8">
          <div className="mx-auto max-w-3xl">
            {/* Question Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
              {/* Question header bar */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-3.5 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-[11px] font-bold text-white">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-medium text-slate-400">of {total}</span>
                  </div>
                  <div className="h-4 w-px bg-slate-200" />
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                    {typeLabel[q.questionType] ?? q.questionType}
                  </span>
                  {q.difficulty && (
                    <span className={cn(
                      "rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize",
                      q.difficulty === "easy" ? "bg-emerald-50 text-emerald-600" :
                      q.difficulty === "medium" ? "bg-amber-50 text-amber-600" :
                      "bg-red-50 text-red-600"
                    )}>
                      {q.difficulty}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setFlagged((f) => ({ ...f, [q.id]: !f[q.id] }))}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all",
                    flagged[q.id]
                      ? "bg-amber-50 text-amber-600 border border-amber-200"
                      : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  )}
                >
                  <Flag className={cn("size-3", flagged[q.id] && "fill-amber-400")} />
                  {flagged[q.id] ? "Flagged" : "Flag"}
                </button>
              </div>

              {/* Question Text */}
              <div className="px-6 pt-6 pb-2 lg:px-8 lg:pt-8">
                <h2 className="text-[17px] font-semibold leading-relaxed text-slate-900 lg:text-lg">
                  {q.questionText}
                </h2>
              </div>

              {/* Options */}
              <div className="px-6 pb-6 pt-4 lg:px-8 lg:pb-8">
                {q.options && q.options.length ? (
                  <div className="space-y-3">
                    {q.options.map((o, i) => {
                      const selected = answers[q.id] === o.id;
                      return (
                        <button
                          key={o.id}
                          disabled={locked}
                          onClick={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))}
                          className={cn(
                            "group relative flex w-full items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all duration-200",
                            selected
                              ? "border-blue-500 bg-blue-50/50 shadow-sm shadow-blue-100"
                              : "border-slate-150 hover:border-blue-200 hover:bg-blue-50/30"
                          )}
                        >
                          {/* Letter badge */}
                          <span className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all",
                            selected
                              ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30"
                              : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                          )}>
                            {optionLetter(i)}
                          </span>
                          
                          {/* Text */}
                          <span className={cn(
                            "flex-1 text-[15px] font-medium transition-colors",
                            selected ? "text-blue-900" : "text-slate-700"
                          )}>
                            {o.text}
                          </span>

                          {/* Check icon */}
                          {selected && (
                            <CheckCircle2 className="size-5 shrink-0 text-blue-500" />
                          )}
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
                    rows={5}
                    className="w-full rounded-xl border-2 border-slate-200 px-5 py-4 text-[15px] outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 resize-none placeholder:text-slate-300"
                  />
                )}
              </div>
            </div>

            {/* Navigation Bar */}
            <div className="mt-5 flex items-center justify-between">
              <button
                disabled={idx === 0}
                onClick={() => setIdx((i) => i - 1)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="size-4" /> Previous
              </button>

              {/* Quick nav dots for mobile */}
              <div className="hidden sm:flex items-center gap-1">
                {questions.slice(Math.max(0, idx - 2), idx + 3).map((_, i) => {
                  const actualIdx = Math.max(0, idx - 2) + i;
                  return (
                    <button
                      key={actualIdx}
                      onClick={() => setIdx(actualIdx)}
                      className={cn(
                        "size-2 rounded-full transition-all",
                        actualIdx === idx ? "bg-blue-500 scale-125" :
                        answers[questions[actualIdx]?.id] ? "bg-blue-200" : "bg-slate-200"
                      )}
                    />
                  );
                })}
              </div>

              {idx < total - 1 ? (
                <button
                  onClick={() => setIdx((i) => i + 1)}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:shadow-lg active:scale-[0.98]"
                >
                  Next <ChevronRight className="size-4" />
                </button>
              ) : (
                <button
                  onClick={() => setConfirmSubmit(true)}
                  disabled={locked || submitting || answeredCount === 0}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
                >
                  <Send className="size-4" /> Submit
                </button>
              )}
            </div>

            {/* Presence bar */}
            {presence.count > 0 && (
              <div className="mt-4 flex items-center justify-between rounded-xl bg-white border border-slate-200/80 px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <Users className="size-4 text-slate-400" />
                  <span className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{presence.count}</span> attempting now
                  </span>
                </div>
                <div className="flex -space-x-2">
                  {presence.users.slice(0, 4).map((u, i) =>
                    u.avatarUrl ? (
                      <img key={u.userId} src={u.avatarUrl} alt="" className="size-6 rounded-full border-2 border-white object-cover" />
                    ) : (
                      <span
                        key={u.userId}
                        className={cn("flex size-6 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white bg-gradient-to-br", avatarColors[i % avatarColors.length])}
                      >
                        {initials(u.name)}
                      </span>
                    )
                  )}
                  {presence.count > 4 && (
                    <span className="flex size-6 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[9px] font-bold text-slate-500">
                      +{presence.count - 4}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* ═══ SIDEBAR ═══ */}
        <aside className={cn(
          "hidden lg:flex w-[320px] shrink-0 flex-col border-l border-slate-200/80 bg-white overflow-y-auto scrollbar-hide transition-all"
        )}>
          <div className="flex flex-col gap-5 p-5">
            {/* Progress Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Progress</h3>
                <div className="flex items-center gap-1.5">
                  <Award className="size-3.5 text-blue-500" />
                  <span className="text-xs font-bold text-blue-600">{answeredCount}/{total}</span>
                </div>
              </div>

              {/* Circular Progress */}
              <div className="flex items-center justify-center mb-5">
                <div className="relative">
                  <svg className="size-28 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="url(#progressGradient)" strokeWidth="6"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - progressPercent / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-900">{Math.round(progressPercent)}%</span>
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Complete</span>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                <div className="rounded-xl bg-blue-50 p-2.5 text-center">
                  <p className="text-lg font-bold text-blue-600">{answeredCount}</p>
                  <p className="text-[9px] font-semibold text-blue-400 uppercase">Done</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-2.5 text-center">
                  <p className="text-lg font-bold text-amber-600">{flaggedCount}</p>
                  <p className="text-[9px] font-semibold text-amber-400 uppercase">Flagged</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5 text-center">
                  <p className="text-lg font-bold text-slate-600">{total - answeredCount}</p>
                  <p className="text-[9px] font-semibold text-slate-400 uppercase">Left</p>
                </div>
              </div>
            </div>

            {/* Question Map */}
            <div>
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Question Map</h4>
              <div className="grid grid-cols-6 gap-1.5">
                {questions.map((qItem, i) => {
                  const isCurrent = i === idx;
                  const isAnswered = !!answers[qItem.id];
                  const isFlagged = !!flagged[qItem.id];
                  return (
                    <button
                      key={i}
                      onClick={() => setIdx(i)}
                      className={cn(
                        "flex aspect-square items-center justify-center rounded-lg text-[11px] font-bold transition-all",
                        isCurrent
                          ? "ring-2 ring-blue-500 ring-offset-1 bg-blue-50 text-blue-700 scale-110"
                          : isFlagged
                          ? "bg-amber-100 text-amber-700 border border-amber-200"
                          : isAnswered
                          ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                      )}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <div className="mt-auto pt-4 border-t border-slate-100">
              <button
                onClick={() => setConfirmSubmit(true)}
                disabled={submitting || answeredCount === 0 || locked}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
              >
                <Send className="size-4" />
                {submitting ? "Submitting..." : "Submit Assessment"}
              </button>
              <p className="mt-2.5 text-center text-[10px] text-slate-400">
                Review all answers before final submission
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* ═══ SUBMIT CONFIRMATION MODAL ═══ */}
      {confirmSubmit && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="rounded-2xl bg-white p-7 shadow-2xl">
              <div className="text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50">
                  <Send className="size-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Submit Assessment?</h3>
                <p className="mt-2 text-sm text-slate-500">
                  This action cannot be undone.
                </p>
              </div>

              {/* Stats */}
              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-blue-50 p-3 text-center">
                  <p className="text-xl font-bold text-blue-600">{answeredCount}</p>
                  <p className="text-[10px] font-medium text-blue-400">Answered</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-3 text-center">
                  <p className="text-xl font-bold text-amber-600">{flaggedCount}</p>
                  <p className="text-[10px] font-medium text-amber-400">Flagged</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-xl font-bold text-slate-600">{total - answeredCount}</p>
                  <p className="text-[10px] font-medium text-slate-400">Skipped</p>
                </div>
              </div>

              {total - answeredCount > 0 && (
                <div className="mt-4 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
                  <p className="text-xs text-amber-700 text-center font-medium">
                    ⚠️ {total - answeredCount} unanswered {total - answeredCount === 1 ? "question" : "questions"} will be marked as skipped
                  </p>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setConfirmSubmit(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Review
                </button>
                <button
                  onClick={() => { setConfirmSubmit(false); void submit(); }}
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
                >
                  {submitting ? "..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
