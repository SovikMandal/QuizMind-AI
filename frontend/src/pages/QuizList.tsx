import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Search,
  Users,
  Target,
  Timer,
  Calendar,
  Zap,
  Play,
  ArrowRight,
  Share2,
  Lock,
  Globe,
  KeyRound,
  LogIn,
  ShieldCheck,
  Landmark,
  Sigma,
  Code2,
  Microscope,
  FlaskConical,
  Atom,
} from "lucide-react";
import { api, apiError } from "@/lib/api";
import toast from "react-hot-toast";
import { Button, Card, cn } from "@/components/ui";

interface QuizItem {
  id: string;
  title: string;
  subject: string | null;
  difficulty: string;
  status: string;
  quizType: "public" | "private";
  scheduledAt: string | null;
  durationMins?: number;
  participants?: number;
  accuracy?: number;
  _count?: { questions: number };
}

type Variant = "live" | "async" | "upcoming";
const cfg: Record<Variant, { title: string; desc: string; match: (q: QuizItem) => boolean }> = {
  live: { title: "Live Quizzes", desc: "Quizzes currently running live — join now before they end.", match: (q) => q.status === "live" },
  async: { title: "Asynchronous Quizzes", desc: "Open to take anytime, at your own pace.", match: (q) => !["live", "scheduled", "draft"].includes(q.status) },
  upcoming: { title: "Upcoming Quizzes", desc: "Scheduled quizzes — get ready to join when they go live.", match: (q) => q.status === "scheduled" },
};

function subjectIcon(subject: string | null) {
  const s = (subject ?? "").toLowerCase();
  if (s.includes("hist")) return Landmark;
  if (s.includes("math") || s.includes("algebra") || s.includes("calc")) return Sigma;
  if (s.includes("cod") || s.includes("program") || s.includes("java") || s.includes("python")) return Code2;
  if (s.includes("chem")) return FlaskConical;
  if (s.includes("bio") || s.includes("cell")) return Microscope;
  return Atom;
}

const endsClock = (scheduledAt: string | null, durationMins: number | undefined, now: number) => {
  if (!scheduledAt) return "—";
  const r = Math.max(0, new Date(scheduledAt).getTime() + (durationMins ?? 60) * 60000 - now);
  return `${Math.floor(r / 60000)}:${String(Math.floor((r % 60000) / 1000)).padStart(2, "0")}`;
};
const inputBase = "w-full rounded-lg border border-zinc-200 bg-white text-sm outline-none focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/20";

export default function QuizList() {
  const { type = "live" } = useParams();
  const variant = (["live", "async", "upcoming"].includes(type) ? type : "live") as Variant;
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [now, setNow] = useState(Date.now());
  const [privateQuiz, setPrivateQuiz] = useState<QuizItem | null>(null);
  const [modalPwd, setModalPwd] = useState("");

  useEffect(() => {
    api.get("/quizzes?limit=100").then((r) => setQuizzes(r.data.quizzes)).catch(() => {});
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const join = async (body: Record<string, unknown>) => {
    try {
      const res = await api.post("/sessions/join", body);
      const { sessionId, participantId, quiz, completed, savedAnswers } = res.data;
      navigate(`/take/${sessionId}`, {
        state: { participantId, questions: quiz.questions, quizTitle: quiz.title, subject: quiz.subject, difficulty: quiz.difficulty, scheduledAt: quiz.scheduledAt, durationMins: quiz.durationMins, completed, savedAnswers },
      });
    } catch (err) {
      toast.error(apiError(err, "Could not join quiz"));
    }
  };

  const onJoin = (q: QuizItem) => {
    if (variant === "upcoming") return navigate(`/join/${q.id}`);
    if (q.quizType === "private") {
      setModalPwd("");
      setPrivateQuiz(q);
    } else {
      join({ quizId: q.id });
    }
  };

  const share = (q: QuizItem) => {
    navigator.clipboard?.writeText(`${location.origin}/join/${q.id}`);
    toast.success("Quiz link copied");
  };

  const items = quizzes.filter(cfg[variant].match);
  const categories = useMemo(() => ["All", ...new Set(items.map((q) => q.subject).filter(Boolean) as string[])], [items]);
  const filtered = items.filter(
    (q) => q.title.toLowerCase().includes(search.toLowerCase()) && (cat === "All" || q.subject === cat)
  );

  return (
    <main className="mx-auto max-w-5xl px-8 py-10">
      <button onClick={() => navigate("/discover")} className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-[#2b7fff]">
        <ChevronLeft className="size-4" /> Back to Discover
      </button>

      <div className="mb-2 flex items-center gap-3">
        {variant === "live" && (
          <span className="relative flex size-3">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#e7000b] opacity-75" />
            <span className="relative inline-flex size-3 rounded-full bg-[#e7000b]" />
          </span>
        )}
        <h1 className="text-2xl font-bold tracking-tight">{cfg[variant].title}</h1>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-[#71717b]">{filtered.length}</span>
      </div>
      <p className="mb-6 text-sm text-[#71717b]">{cfg[variant].desc}</p>

      <div className="mb-8 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#71717b]" />
          <input className={`${inputBase} h-11 pl-9 pr-3`} placeholder="Search quizzes…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className={`${inputBase} h-11 w-52 px-3`} value={cat} onChange={(e) => setCat(e.target.value)}>
          {categories.map((c) => <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 py-16 text-center text-sm text-zinc-400">Nothing here right now.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((q) => {
            const Icon = subjectIcon(q.subject);
            return (
              <Card key={q.id} className="flex h-full flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100 text-[#2b7fff]"><Icon className="size-5" /></div>
                  <div className="flex items-center gap-2">
                    <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", q.quizType === "private" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600")}>
                      {q.quizType === "private" ? <Lock className="size-3" /> : <Globe className="size-3" />} {q.quizType === "private" ? "Private" : "Public"}
                    </span>
                    {variant === "live" ? (
                      <span className="rounded-full bg-[#e7000b]/10 px-2 py-0.5 text-xs font-medium text-[#e7000b]">Live</span>
                    ) : variant === "upcoming" ? (
                      <span className="rounded-full bg-[#2b7fff]/10 px-2 py-0.5 text-xs font-medium text-[#2b7fff]">Soon</span>
                    ) : (
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-[#71717b]">Open</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{q.title}</h3>
                    <p className="text-sm text-[#71717b]">{q.subject ?? "General"} · {q._count?.questions ?? 0} questions</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1.5"><Users className="size-4 text-[#71717b]" /> {q.participants ?? 0} joined</span>
                    <span className="flex items-center gap-1.5"><Target className="size-4 text-[#71717b]" /> {q.accuracy ?? 0}% avg</span>
                  </div>
                  {variant === "live" && (
                    <div className="flex items-center gap-2 rounded-lg bg-[#e7000b]/10 px-3 py-2 text-sm font-medium text-[#e7000b]">
                      <Timer className="size-4" /> Ends in: {endsClock(q.scheduledAt, q.durationMins, now)}
                    </div>
                  )}
                  {variant === "upcoming" && q.scheduledAt && (
                    <div className="flex items-center gap-2 rounded-lg bg-[#2b7fff]/10 px-3 py-2 text-sm font-medium text-[#2b7fff]">
                      <Calendar className="size-4" /> {new Date(q.scheduledAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </div>
                  )}
                  {variant === "async" && (
                    q.quizType === "private" ? (
                      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                        <Lock className="size-4 shrink-0" /> Private — enter the password to join.
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                        <Globe className="size-4 shrink-0" /> Anyone can join — no code or password needed.
                      </div>
                    )
                  )}
                </div>

                <div className="mt-auto flex gap-2">
                  <Button className="flex-1 gap-2" onClick={() => onJoin(q)}>
                    {variant === "live" ? <><Zap className="size-4" /> Join Live</> : variant === "upcoming" ? <><ArrowRight className="size-4" /> Waiting room</> : <><Play className="size-4" /> Take quiz</>}
                  </Button>
                  <Button variant="outline" className="!text-[#2b7fff]" onClick={() => share(q)}><Share2 className="size-4" /></Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {privateQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4" onClick={() => setPrivateQuiz(null)}>
          <div className="flex w-full max-w-md flex-col gap-5 rounded-2xl border border-[#2b7fff]/30 bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex size-11 items-center justify-center rounded-xl bg-[#2b7fff] text-blue-50"><Lock className="size-5" /></div>
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">Join a Private Quiz</h2>
              <p className="text-sm text-[#71717b]">"{privateQuiz.title}" is private. Enter the password shared by your host.</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-1.5 text-sm font-medium"><KeyRound className="size-3.5 text-[#71717b]" /> Password</label>
              <input type="password" autoFocus className={`${inputBase} h-11 px-3`} placeholder="Enter quiz password" value={modalPwd} onChange={(e) => setModalPwd(e.target.value)} />
            </div>
            <Button className="w-full gap-2" disabled={!modalPwd} onClick={() => join({ quizId: privateQuiz.id, password: modalPwd })}>
              <LogIn className="size-4" /> Join private quiz
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-xs text-[#71717b]"><ShieldCheck className="size-3.5" /> Your access is secure and encrypted</p>
          </div>
        </div>
      )}
    </main>
  );
}
