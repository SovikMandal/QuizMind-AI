import { useEffect, useMemo, useRef, useState } from "react";
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
} from "lucide-react";
import { api, apiError } from "@/lib/api";
import toast from "react-hot-toast";
import { connectQuizSocket } from "@/lib/socket";
import { Button, Card, Badge, cn } from "@/components/ui";

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
const avatarColors = ["bg-[#2b7fff]", "bg-[#f54900]", "bg-[#009689]"];
const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function TakeQuiz() {
  const { sessionId = "" } = useParams();
  const navigate = useNavigate();
  const state = (useLocation().state ?? null) as TakeState | null;

  const [answers, setAnswers] = useState<Record<string, string>>(() => state?.savedAnswers ?? {});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [idx, setIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [presence, setPresence] = useState<{ count: number; users: Presence[] }>({ count: 0, users: [] });
  const [connected, setConnected] = useState(false);

  const questions = useMemo(() => state?.questions ?? [], [state]);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const submittedRef = useRef(false);

  // Attempt deadline: remaining live-window time if still open, else durationMins from now.
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

  const submit = async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      await api.post(`/sessions/${sessionId}/submit`, {
        answers: questions.map((q) => ({ questionId: q.id, answer: answersRef.current[q.id] ?? "" })),
      });
      navigate(`/results/${sessionId}`);
    } catch (err) {
      toast.error(apiError(err, "Could not submit your answers"));
      submittedRef.current = false;
      setSubmitting(false);
    }
  };

  // Countdown; auto-submit at zero.
  useEffect(() => {
    if (state?.completed) return;
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
  }, []);

  // Live presence: who is currently attempting this session.
  useEffect(() => {
    const socket = connectQuizSocket();
    socket.on("connect", () => {
      setConnected(true);
      socket.emit("presence_join", { sessionId });
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("presence_update", (d: { count: number; users: Presence[] }) => setPresence(d));
    return () => {
      socket.disconnect();
    };
  }, [sessionId]);

  if (!state) {
    navigate("/discover", { replace: true });
    return null;
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
    if (i === idx) return "border-2 border-[#2b7fff] text-[#2b7fff]";
    if (flagged[id]) return "bg-amber-100 text-amber-700";
    if (answers[id]) return "bg-[#2b7fff] text-blue-50";
    return "bg-zinc-100 text-[#71717b]";
  };

  return (
    <main className="mx-auto max-w-[1140px] px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{state.quizTitle}</h1>
            {state.subject && <Badge className="bg-zinc-100 text-zinc-900">{state.subject}</Badge>}
            {state.difficulty && <Badge className="bg-amber-100 capitalize text-amber-700">{state.difficulty}</Badge>}
          </div>
          <p className="text-sm text-[#71717b]">Answer all questions before submitting. Good luck!</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium",
              isLive ? "text-[#2b7fff]" : "text-[#71717b]"
            )}
          >
            {isLive ? <Radio className="size-4" /> : <Clock className="size-4" />} {isLive ? "Live" : "Async"}
          </span>
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2">
            <Timer className="size-5 text-[#2b7fff]" />
            <div className="leading-tight">
              <p className="text-xs text-[#71717b]">Time left</p>
              <p className="font-mono text-base font-bold tabular-nums">{fmt(timeLeft)}</p>
            </div>
          </div>
        </div>
      </div>

      {locked && (
        <p className="mb-4 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
          You've already completed this quiz — these are your submitted answers (read-only).
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Question */}
        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-lg bg-[#2b7fff] text-sm font-bold text-blue-50">
                  {idx + 1}
                </span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-zinc-100 text-zinc-900">{typeLabel[q.questionType] ?? q.questionType}</Badge>
                  {q.difficulty && <Badge className="bg-amber-100 capitalize text-amber-700">{q.difficulty}</Badge>}
                </div>
              </div>
              <span className="text-sm text-[#71717b]">
                Question {idx + 1} of {total}
              </span>
            </div>

            <h2 className="mt-4 text-xl font-semibold leading-snug">{q.questionText}</h2>

            {q.options && q.options.length ? (
              <div className="mt-4 flex flex-col gap-3">
                {q.options.map((o, i) => {
                  const selected = answers[q.id] === o.id;
                  return (
                    <button
                      key={o.id}
                      disabled={locked}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left",
                        selected ? "border-[#2b7fff] bg-[#2b7fff]/5" : "border-zinc-200 hover:border-[#2b7fff]"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-7 items-center justify-center rounded-full border-2 text-xs font-bold",
                          selected ? "border-[#2b7fff] text-[#2b7fff]" : "border-zinc-200 text-[#71717b]"
                        )}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm font-medium">{o.text}</span>
                      {selected && <CheckCircle2 className="ml-auto size-5 text-[#2b7fff]" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <input
                value={answers[q.id] ?? ""}
                disabled={locked}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                placeholder="Type your answer"
                className="mt-4 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            )}

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-zinc-200 pt-4">
              <Button variant="outline" disabled={idx === 0} onClick={() => setIdx((i) => i - 1)}>
                <ChevronLeft className="size-4" /> Previous
              </Button>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  className={cn(flagged[q.id] && "text-amber-600")}
                  onClick={() => setFlagged((f) => ({ ...f, [q.id]: !f[q.id] }))}
                >
                  <Flag className="size-4" /> {flagged[q.id] ? "Flagged" : "Flag"}
                </Button>
                <Button disabled={idx === total - 1} onClick={() => setIdx((i) => i + 1)}>
                  Next <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-zinc-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <Users className="size-5 text-[#2b7fff]" />
              <p className="text-sm text-[#71717b]">
                <span className="font-semibold text-zinc-950">
                  {presence.count} {presence.count === 1 ? "student" : "students"}
                </span>{" "}
                currently attempting this quiz
              </p>
            </div>
            {presence.users.length > 0 && (
              <div className="flex -space-x-2">
                {presence.users.slice(0, 3).map((u, i) =>
                  u.avatarUrl ? (
                    <img key={u.userId} src={u.avatarUrl} alt="" className="size-7 rounded-full border-2 border-zinc-100 object-cover" />
                  ) : (
                    <span
                      key={u.userId}
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full border-2 border-zinc-100 text-[10px] font-bold text-white",
                        avatarColors[i % avatarColors.length]
                      )}
                    >
                      {initials(u.name)}
                    </span>
                  )
                )}
                {presence.count > 3 && (
                  <span className="flex size-7 items-center justify-center rounded-full border-2 border-zinc-100 bg-zinc-200 text-[10px] font-bold text-[#71717b]">
                    +{presence.count - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Progress sidebar */}
        <div className="flex flex-col gap-6">
          <Card className="sticky top-6 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Progress</h3>
              <span className="text-sm font-bold text-[#2b7fff]">
                {answeredCount} / {total}
              </span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-zinc-100">
              <div
                className="h-2 rounded-full bg-[#2b7fff] transition-all"
                style={{ width: `${total ? (answeredCount / total) * 100 : 0}%` }}
              />
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-lg text-xs font-bold",
                    chipClass(i)
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-2 border-t border-zinc-200 pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#71717b]">
                  <span className="size-3 rounded-sm bg-[#2b7fff]" /> Answered
                </span>
                <span className="font-semibold">{answeredCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#71717b]">
                  <span className="size-3 rounded-sm bg-amber-200" /> Flagged
                </span>
                <span className="font-semibold">{flaggedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#71717b]">
                  <span className="size-3 rounded-sm bg-zinc-100" /> Unanswered
                </span>
                <span className="font-semibold">{total - answeredCount}</span>
              </div>
            </div>
            <button
              onClick={submit}
              disabled={submitting || answeredCount === 0 || locked}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Send className="size-4" /> {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
            <p className="mt-3 text-center text-xs text-[#71717b]">
              You can review flagged questions before submitting.
            </p>
          </Card>

          <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-100">
              <Wifi className={cn("size-4", connected ? "text-green-600" : "text-zinc-400")} />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold">{connected ? "Connected" : "Connecting…"}</p>
              <p className="text-xs text-[#71717b]">{isLive ? "Live session" : "Async mode"} · live presence</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
