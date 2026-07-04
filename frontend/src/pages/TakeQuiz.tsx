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
} from "lucide-react";
import { api, apiError } from "@/lib/api";
import toast from "react-hot-toast";
import { connectQuizSocket } from "@/lib/socket";
import { Button, Card, Badge, cn } from "@/components/ui";
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
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Top Bar - Professional exam header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3">
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

          {/* Right: Status */}
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
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full bg-zinc-100">
          <div
            className="h-1 bg-gradient-to-r from-[#2b7fff] to-[#1a6ef0] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {locked && (
        <div className="border-b border-blue-100 bg-blue-50 px-6 py-2.5 text-center">
          <p className="text-sm font-medium text-blue-700">
            ✓ You've already completed this quiz — viewing submitted answers (read-only)
          </p>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-[1400px] px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Question Area */}
          <div className="flex flex-col gap-5">
            {/* Question Card */}
            <Card className="overflow-hidden border-0 shadow-md">
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2b7fff] to-[#1a6ef0] text-sm font-bold text-white shadow-sm">
                    {idx + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-white border border-zinc-200 text-zinc-700 shadow-sm">{typeLabel[q.questionType] ?? q.questionType}</Badge>
                    {q.difficulty && (
                      <Badge className={cn(
                        "border shadow-sm",
                        q.difficulty === "easy" ? "bg-green-50 border-green-200 text-green-700" :
                        q.difficulty === "medium" ? "bg-amber-50 border-amber-200 text-amber-700" :
                        "bg-red-50 border-red-200 text-red-700"
                      )}>
                        {q.difficulty}
                      </Badge>
                    )}
                  </div>
                </div>
                <span className="rounded-lg bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500">
                  {idx + 1} / {total}
                </span>
              </div>

              {/* Question Body */}
              <div className="p-6 lg:p-8">
                <h2 className="text-lg font-semibold leading-relaxed text-zinc-900 lg:text-xl">
                  {q.questionText}
                </h2>

                {/* Options */}
                {q.options && q.options.length ? (
                  <div className="mt-6 flex flex-col gap-3">
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
                            {o.text}
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
                    className="mt-6 w-full rounded-xl border-2 border-zinc-200 px-4 py-3 text-sm outline-none transition-colors focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/10 resize-none"
                  />
                )}
              </div>

              {/* Question Footer - Navigation */}
              <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/30 px-6 py-4">
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
                  <Button onClick={() => setIdx((i) => i + 1)} className="rounded-lg">
                    Next <ChevronRight className="size-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => setConfirmSubmit(true)}
                    disabled={locked || submitting || answeredCount === 0}
                    className="rounded-lg bg-green-600 hover:bg-green-700"
                  >
                    <Send className="size-4" /> Submit
                  </Button>
                )}
              </div>
            </Card>

            {/* Presence Indicator */}
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-3.5 shadow-sm">
              <div className="flex items-center gap-3">
                <Users className="size-4 text-[#2b7fff]" />
                <p className="text-sm text-zinc-600">
                  <span className="font-semibold text-zinc-900">{presence.count}</span>{" "}
                  {presence.count === 1 ? "student" : "students"} attempting now
                </p>
              </div>
              {presence.users.length > 0 && (
                <div className="flex -space-x-2">
                  {presence.users.slice(0, 4).map((u, i) =>
                    u.avatarUrl ? (
                      <img key={u.userId} src={u.avatarUrl} alt="" className="size-7 rounded-full border-2 border-white object-cover" />
                    ) : (
                      <span
                        key={u.userId}
                        className={cn(
                          "flex size-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white",
                          avatarColors[i % avatarColors.length]
                        )}
                      >
                        {initials(u.name)}
                      </span>
                    )
                  )}
                  {presence.count > 4 && (
                    <span className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-zinc-200 text-[10px] font-bold text-zinc-600">
                      +{presence.count - 4}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            {/* Progress Panel */}
            <Card className="sticky top-[88px] border-0 p-6 shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Progress</h3>
                <span className="rounded-full bg-[#2b7fff]/10 px-3 py-1 text-xs font-bold text-[#2b7fff]">
                  {answeredCount}/{total}
                </span>
              </div>

              {/* Circular Progress */}
              <div className="mt-4 flex items-center justify-center">
                <div className="relative">
                  <svg className="size-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f1f1" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none" stroke="#2b7fff" strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - progressPercent / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-zinc-900">{Math.round(progressPercent)}%</span>
                  </div>
                </div>
              </div>

              {/* Question Grid */}
              <div className="mt-5">
                <p className="mb-2.5 text-xs font-medium text-zinc-400">Question Map</p>
                <div className="grid grid-cols-6 gap-1.5">
                  {questions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIdx(i)}
                      className={cn(
                        "flex aspect-square items-center justify-center rounded-lg text-[11px] font-semibold transition-all",
                        chipClass(i)
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-5 space-y-2 border-t border-zinc-100 pt-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs text-zinc-500">
                    <span className="size-3 rounded bg-[#2b7fff]" /> Answered
                  </span>
                  <span className="text-xs font-bold text-zinc-700">{answeredCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs text-zinc-500">
                    <span className="size-3 rounded border border-amber-300 bg-amber-100" /> Flagged
                  </span>
                  <span className="text-xs font-bold text-zinc-700">{flaggedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs text-zinc-500">
                    <span className="size-3 rounded bg-zinc-100" /> Unanswered
                  </span>
                  <span className="text-xs font-bold text-zinc-700">{total - answeredCount}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={() => setConfirmSubmit(true)}
                disabled={submitting || answeredCount === 0 || locked}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-600/20 transition-all hover:shadow-xl disabled:opacity-50 disabled:shadow-none"
              >
                <Send className="size-4" /> {submitting ? "Submitting..." : "Submit Quiz"}
              </button>
              <p className="mt-2 text-center text-[11px] text-zinc-400">
                Review flagged questions before submitting
              </p>
            </Card>

            {/* Connection Status */}
            <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className={cn(
                "flex size-9 items-center justify-center rounded-lg",
                connected ? "bg-green-50" : "bg-zinc-100"
              )}>
                <Wifi className={cn("size-4", connected ? "text-green-600" : "text-zinc-400")} />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">{connected ? "Connected" : "Connecting…"}</p>
                <p className="text-[11px] text-zinc-400">{isLive ? "Live session" : "Async mode"} • Proctored</p>
              </div>
            </div>
          </div>
        </div>
      </main>

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
