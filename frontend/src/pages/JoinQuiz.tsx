import { FormEvent, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  KeyRound,
  LogIn,
  Lock,
  ShieldCheck,
  Sparkles,
  Clock,
  Users,
  ListChecks,
  Timer,
  Info,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { api, apiError } from "@/lib/api";
import { connectQuizSocket } from "@/lib/socket";
import toast from "react-hot-toast";
import { Button, Card, Badge } from "@/components/ui";

interface QuizInfo {
  title: string;
  subject: string | null;
  questionCount: number;
  durationMins?: number;
  scheduledAt: string | null;
  status: string;
  hostName: string;
  participants: number;
}

const pad = (n: number) => String(Math.max(0, n)).padStart(2, "0");

export default function JoinQuiz() {
  const { quizId = "" } = useParams();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"loading" | "waiting" | "password">("loading");
  const [info, setInfo] = useState<QuizInfo | null>(null);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [waiting, setWaiting] = useState(0);
  const startTriggered = useRef(false);

  const go = (data: { sessionId: string; participantId: string; completed?: boolean; savedAnswers?: Record<string, string>; quiz: Record<string, unknown> }) => {
    const { sessionId, participantId, quiz, completed, savedAnswers } = data;
    navigate(`/take/${sessionId}`, {
      replace: true,
      state: {
        participantId,
        questions: quiz.questions,
        quizTitle: quiz.title,
        subject: quiz.subject,
        difficulty: quiz.difficulty,
        scheduledAt: quiz.scheduledAt,
        durationMins: quiz.durationMins,
        completed,
        savedAnswers,
      },
    });
  };

  const attempt = async (pwd?: string) => {
    try {
      const res = await api.post("/sessions/join", { quizId, ...(pwd ? { password: pwd } : {}) });
      go(res.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setPhase("password");
        if (pwd) toast.error("Incorrect password");
      } else {
        toast.error(apiError(err, "Could not open quiz"));
        navigate("/discover", { replace: true });
      }
    }
  };

  const load = async () => {
    try {
      const res = await api.get(`/quizzes/${quizId}/info`);
      const q: QuizInfo = res.data.quiz;
      setInfo(q);
      if (q.status === "scheduled") {
        setPhase("waiting");
      } else if (q.status === "draft") {
        toast.error("This quiz isn't available yet");
        navigate("/discover", { replace: true });
      } else {
        await attempt();
      }
    } catch (err) {
      toast.error(apiError(err, "Quiz not found"));
      navigate("/discover", { replace: true });
    }
  };

  useEffect(() => {
    if (startTriggered.current) return;
    startTriggered.current = true;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Waiting-room countdown; re-check (and auto-join) once the start time passes.
  const reachedStart = useRef(false);
  useEffect(() => {
    if (phase !== "waiting" || !info?.scheduledAt) return;
    const target = new Date(info.scheduledAt).getTime();
    const id = setInterval(() => {
      setNow(Date.now());
      if (target - Date.now() <= 0 && !reachedStart.current) {
        reachedStart.current = true;
        load();
      }
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, info]);

  // Live count of students currently in the waiting room (keyed by quiz id).
  useEffect(() => {
    if (phase !== "waiting") return;
    const socket = connectQuizSocket();
    socket.on("connect", () => socket.emit("presence_join", { sessionId: quizId }));
    socket.on("presence_update", (d: { count: number }) => setWaiting(d.count));
    return () => {
      socket.disconnect();
    };
  }, [phase, quizId]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await attempt(password);
    setSubmitting(false);
  };

  // ── Loading ──
  if (phase === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-10 animate-spin rounded-full border-4 border-[#2b7fff] border-t-transparent" />
      </div>
    );
  }

  // ── Private password prompt ──
  if (phase === "password") {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-6">
        <div className="flex w-full flex-col gap-5 rounded-2xl border border-[#2b7fff]/30 bg-[#2b7fff]/5 p-6">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#2b7fff] text-blue-50"><Lock className="size-5" /></div>
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Join a Private Quiz</h2>
            <p className="text-sm text-[#71717b]">This quiz is private. Enter the password shared by your host to join.</p>
          </div>
          <form onSubmit={submit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-1.5 text-sm font-medium"><KeyRound className="size-3.5 text-[#71717b]" /> Password</label>
              <input
                type="password"
                required
                className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/20"
                placeholder="Enter quiz password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={submitting || !password}>
              <LogIn className="size-4" /> {submitting ? "Joining..." : "Join private quiz"}
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-xs text-[#71717b]"><ShieldCheck className="size-3.5" /> Your access is secure and encrypted</p>
          </form>
        </div>
      </main>
    );
  }

  // ── Waiting room (scheduled) ──
  const remaining = info?.scheduledAt ? Math.max(0, new Date(info.scheduledAt).getTime() - now) : 0;
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);

  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-8 py-12">
      <div className="flex w-full flex-col items-center gap-2">
        <Badge className="gap-1.5 rounded-full bg-[#2b7fff]/10 px-3 py-1 text-[#2b7fff]">
          <span className="size-2 animate-pulse rounded-full bg-[#2b7fff]" /> Waiting room
        </Badge>
        <h1 className="mt-2 text-center text-3xl font-bold tracking-tight">Get ready, the quiz is about to begin</h1>
        <p className="max-w-md text-center text-sm text-[#71717b]">
          This quiz hasn't started yet. Hang tight — we'll move you in automatically the moment it goes live.
        </p>
      </div>

      <Card className="flex w-full flex-col gap-6 p-8">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-[#2b7fff] text-blue-50"><Sparkles className="size-6" /></div>
          <div className="flex flex-1 flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#2b7fff]">You're joining</p>
            <h2 className="text-xl font-bold tracking-tight">{info?.title}</h2>
            <p className="text-sm text-[#71717b]">{info?.subject ?? "General"} · {info?.questionCount} questions · Hosted by {info?.hostName}</p>
          </div>
          <Badge className="gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-amber-700"><Clock className="size-3.5" /> Not started</Badge>
        </div>

        <div className="flex flex-col items-center gap-4 rounded-2xl bg-zinc-100 py-8">
          <p className="text-sm font-medium text-[#71717b]">Quiz starts in</p>
          <div className="flex items-end gap-3">
            <div className="flex flex-col items-center gap-1">
              <div className="flex size-20 items-center justify-center rounded-2xl bg-white text-4xl font-bold tabular-nums shadow-sm">{pad(mins)}</div>
              <span className="text-xs font-medium text-[#71717b]">Min</span>
            </div>
            <span className="pb-7 text-3xl font-bold text-[#71717b]">:</span>
            <div className="flex flex-col items-center gap-1">
              <div className="flex size-20 items-center justify-center rounded-2xl bg-[#2b7fff] text-4xl font-bold tabular-nums text-blue-50 shadow-sm">{pad(secs)}</div>
              <span className="text-xs font-medium text-[#71717b]">Sec</span>
            </div>
          </div>
          <p className="text-center text-xs text-[#71717b]">{remaining <= 0 ? "Starting…" : "Preparing your session…"}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center gap-2 rounded-xl border border-zinc-200 p-4">
            <Users className="size-5 text-[#2b7fff]" />
            <span className="text-lg font-bold">{waiting}</span>
            <span className="text-xs text-[#71717b]">Waiting</span>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-xl border border-zinc-200 p-4">
            <ListChecks className="size-5 text-[#2b7fff]" />
            <span className="text-lg font-bold">{info?.questionCount}</span>
            <span className="text-xs text-[#71717b]">Questions</span>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-xl border border-zinc-200 p-4">
            <Timer className="size-5 text-[#2b7fff]" />
            <span className="text-lg font-bold">{info?.durationMins ?? 0}m</span>
            <span className="text-xs text-[#71717b]">Duration</span>
          </div>
        </div>
      </Card>

      <div className="flex w-full items-start gap-3 rounded-xl border border-[#2b7fff]/20 bg-[#2b7fff]/5 p-4">
        <Info className="mt-0.5 size-4 shrink-0 text-[#2b7fff]" />
        <p className="text-sm text-[#71717b]">Keep this tab open. You'll be moved into the quiz automatically when it goes live.</p>
      </div>

      <div className="flex w-full items-center justify-between">
        <Button variant="outline" className="gap-2" onClick={() => navigate("/discover")}><ArrowLeft className="size-4" /> Leave room</Button>
        <Button variant="outline" className="gap-2" onClick={load}><RefreshCw className="size-4" /> Refresh status</Button>
      </div>
    </main>
  );
}
