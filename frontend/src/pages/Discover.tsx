import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Search,
  ArrowRight,
  Radio,
  Infinity as InfinityIcon,
  CalendarClock,
  Zap,
  Play,
  Bell,
  Calendar,
  Clock,
  Target,
  Users,
  Lock,
  Globe,
  Hash,
  KeyRound,
  LogIn,
  ShieldCheck,
  Wand2,
  Plus,
  Atom,
  Landmark,
  Code2,
  Microscope,
  Sigma,
  FlaskConical,
  Brain,
} from "lucide-react";
import { api, apiError } from "@/lib/api";
import toast from "react-hot-toast";
import { Button, cn } from "@/components/ui";

const card = "rounded-2xl border border-zinc-200 bg-white shadow-sm";
const inputBase =
  "w-full rounded-lg border border-zinc-200 bg-white text-sm outline-none focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/20";

interface QuizItem {
  id: string;
  title: string;
  subject: string | null;
  difficulty: string;
  status: string;
  quizType: "public" | "private";
  scheduledAt: string | null;
  creatorId: string;
  participants?: number;
  accuracy?: number;
  durationMins?: number;
  _count?: { questions: number };
}

function subjectIcon(subject: string | null) {
  const s = (subject ?? "").toLowerCase();
  if (s.includes("hist")) return Landmark;
  if (s.includes("math") || s.includes("algebra") || s.includes("calc")) return Sigma;
  if (s.includes("cod") || s.includes("program") || s.includes("java") || s.includes("python")) return Code2;
  if (s.includes("chem")) return FlaskConical;
  if (s.includes("bio") || s.includes("cell")) return Microscope;
  return Atom;
}

function endsIn(scheduledAt: string | null, durationMins?: number) {
  if (!scheduledAt) return "—";
  const end = new Date(scheduledAt).getTime() + (durationMins ?? 60) * 60000;
  const m = Math.max(0, Math.round((end - Date.now()) / 60000));
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
}

export default function Discover() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [search, setSearch] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [privateQuiz, setPrivateQuiz] = useState<QuizItem | null>(null);
  const [modalPwd, setModalPwd] = useState("");

  useEffect(() => {
    api.get("/quizzes?limit=50").then((r) => setQuizzes(r.data.quizzes)).catch(() => {});
  }, []);

  const join = async (body: Record<string, unknown>, participants?: number) => {
    try {
      const res = await api.post("/sessions/join", body);
      const { sessionId, participantId, quiz } = res.data;
      navigate(`/take/${sessionId}`, {
        state: {
          participantId,
          questions: quiz.questions,
          quizTitle: quiz.title,
          subject: quiz.subject,
          difficulty: quiz.difficulty,
          scheduledAt: quiz.scheduledAt,
          durationMins: quiz.durationMins,
          participants,
          completed: res.data.completed,
          savedAnswers: res.data.savedAnswers,
        },
      });
    } catch (err) {
      toast.error(apiError(err, "Could not join quiz"));
    }
  };

  const joinCard = (q: QuizItem) => {
    if (q.quizType === "private") {
      setModalPwd("");
      setPrivateQuiz(q);
    } else {
      join({ quizId: q.id }, q.participants);
    }
  };

  const filtered = quizzes.filter((q) => q.title.toLowerCase().includes(search.toLowerCase()));
  const live = filtered.filter((q) => q.status === "live");
  const upcoming = filtered.filter((q) => q.status === "scheduled");
  const async = filtered.filter((q) => !["live", "scheduled", "draft"].includes(q.status));

  const QuizCard = ({ q, variant }: { q: QuizItem; variant: "live" | "async" | "upcoming" }) => {
    const Icon = subjectIcon(q.subject);
    return (
      <div className={`flex flex-col gap-4 p-5 ${card}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100">
              <Icon className="size-5 text-[#2b7fff]" />
            </div>
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                q.quizType === "private" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
              )}
            >
              {q.quizType === "private" ? <Lock className="size-3" /> : <Globe className="size-3" />}
              {q.quizType === "private" ? "Private" : "Public"}
            </span>
          </div>
          {variant === "live" && (
            <span className="flex items-center gap-1 rounded-full bg-[#e7000b]/10 px-2 py-0.5 text-xs text-[#e7000b]">
              <span className="size-1.5 rounded-full bg-[#e7000b]" /> Live
            </span>
          )}
          {variant === "async" && (
            <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-[#71717b]">Open</span>
          )}
          {variant === "upcoming" && (
            <span className="rounded-full bg-[#2b7fff]/10 px-2 py-0.5 text-xs text-[#2b7fff]">Soon</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">{q.title}</h3>
          <p className="text-xs text-[#71717b]">{q.subject ?? "General"} · {q._count?.questions ?? 0} questions</p>
          <div className="flex items-center gap-4 pt-1 text-xs text-[#71717b]">
            {variant === "upcoming" ? (
              q.scheduledAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5" /> {new Date(q.scheduledAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </span>
              )
            ) : (
              <>
                <span className="flex items-center gap-1">
                  <Users className="size-3.5" /> {q.participants ?? 0}
                </span>
                {variant === "async" ? (
                  <span className="flex items-center gap-1">
                    <Target className="size-3.5" /> {q.accuracy ?? 0}%
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" /> Ends in {endsIn(q.scheduledAt, q.durationMins)}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
        {variant === "live" && (
          <Button className="w-full gap-2" onClick={() => joinCard(q)}><Zap className="size-4" /> Join now</Button>
        )}
        {variant === "async" && (
          <Button variant="outline" className="w-full gap-2" onClick={() => joinCard(q)}><Play className="size-4" /> Take quiz</Button>
        )}
        {variant === "upcoming" && (
          <Button variant="outline" className="w-full gap-2"><Bell className="size-4" /> Remind me</Button>
        )}
      </div>
    );
  };

  const Section = ({
    icon,
    title,
    badge,
    items,
    variant,
    note,
  }: {
    icon: React.ReactNode;
    title: string;
    badge: React.ReactNode;
    items: QuizItem[];
    variant: "live" | "async" | "upcoming";
    note?: string;
  }) => (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold">{title}</h2>
          {badge}
        </div>
        <span className="flex cursor-pointer items-center gap-1 text-sm font-medium text-[#71717b] hover:text-[#2b7fff]">
          View all <ArrowRight className="size-4" />
        </span>
      </div>
      {note && <p className="-mt-2 text-xs text-[#71717b]">{note}</p>}
      {items.length === 0 ? (
        <p className="text-sm text-zinc-400">Nothing here right now.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((q) => (
            <QuizCard key={q.id} q={q} variant={variant} />
          ))}
        </div>
      )}
    </section>
  );

  return (
    <>
      <main className="mx-auto max-w-[1140px] px-6 py-12">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-2">
            <span className="flex w-fit items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium">
              <Sparkles className="size-3.5 text-[#2b7fff]" /> Browse all quizzes
            </span>
            <h1 className="text-3xl font-bold tracking-tight">Discover Quizzes</h1>
            <p className="max-w-xl text-sm text-[#71717b]">
              Explore public quizzes that are live now, available anytime, or coming soon. Or join a private quiz with a code.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#71717b]" />
            <input className={`${inputBase} h-10 pl-9 pr-3`} placeholder="Search quizzes..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-8 lg:col-span-2">
            <Section
              variant="live"
              title="Live Quizzes"
              icon={
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#e7000b] opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-[#e7000b]" />
                </span>
              }
              badge={<span className="rounded-full bg-[#e7000b]/10 px-2 py-0.5 text-xs text-[#e7000b]">{live.length} active</span>}
              items={live}
            />
            <Section
              variant="async"
              title="Asynchronous Quizzes"
              icon={<InfinityIcon className="size-5 text-[#2b7fff]" />}
              badge={<span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs">Anytime</span>}
              note="Live sessions ended but these quizzes are still open to take on your own time."
              items={async}
            />
            <Section
              variant="upcoming"
              title="Upcoming Quizzes"
              icon={<CalendarClock className="size-5 text-[#2b7fff]" />}
              badge={<span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs">Scheduled</span>}
              items={upcoming}
            />
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-6">
            <div className="flex flex-col gap-5 rounded-2xl border border-[#2b7fff]/30 bg-[#2b7fff]/5 p-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#2b7fff] text-blue-50">
                <Lock className="size-5" />
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Join a Private Quiz</h2>
                <p className="text-sm text-[#71717b]">Got an invite? Enter the access code and password shared by your host.</p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-1.5 text-sm font-medium"><Hash className="size-3.5 text-[#71717b]" /> Quiz Code</label>
                <input className={`${inputBase} h-11 px-3 uppercase tracking-widest`} placeholder="e.g. JP29TV" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-1.5 text-sm font-medium"><KeyRound className="size-3.5 text-[#71717b]" /> Password</label>
                <input type="password" className={`${inputBase} h-11 px-3`} placeholder="Enter quiz password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button className="w-full gap-2" disabled={!code} onClick={() => join({ accessCode: code, password })}>
                <LogIn className="size-4" /> Join private quiz
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-xs text-[#71717b]">
                <ShieldCheck className="size-3.5" /> Your access is secure and encrypted
              </p>
            </div>

            <div className={`flex flex-col gap-4 p-6 ${card}`}>
              <div>
                <h3 className="text-base font-semibold">Quiz Stats</h3>
                <p className="text-xs text-[#71717b]">Across the platform today</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-[#71717b]"><Radio className="size-4 text-[#e7000b]" /> Live now</span>
                <span className="text-sm font-semibold">{live.length}</span>
              </div>
              <div className="h-px bg-zinc-200" />
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-[#71717b]"><InfinityIcon className="size-4 text-[#2b7fff]" /> Available anytime</span>
                <span className="text-sm font-semibold">{async.length}</span>
              </div>
              <div className="h-px bg-zinc-200" />
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-[#71717b]"><CalendarClock className="size-4 text-[#2b7fff]" /> Upcoming</span>
                <span className="text-sm font-semibold">{upcoming.length}</span>
              </div>
            </div>

            <div className={`flex flex-col gap-3 p-6 ${card}`}>
              <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100">
                <Wand2 className="size-5 text-[#2b7fff]" />
              </div>
              <h3 className="text-base font-semibold">Create your own</h3>
              <p className="text-sm text-[#71717b]">Turn any topic into a quiz and host it live or share privately.</p>
              <Button variant="outline" className="w-full gap-2" onClick={() => navigate("/quiz/create")}>
                <Plus className="size-4" /> Create quiz
              </Button>
            </div>
          </aside>
        </div>
      </main>

      <footer className="border-t border-zinc-200">
        <div className="mx-auto flex max-w-[1140px] items-center justify-between px-6 py-8">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#2b7fff] text-white">
              <Brain className="size-4" />
            </div>
            <span className="font-semibold">QuizMind AI</span>
          </div>
          <span className="text-sm text-[#71717b]">© 2025 QuizMind. All rights reserved.</span>
        </div>
      </footer>

      {privateQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4" onClick={() => setPrivateQuiz(null)}>
          <div
            className="flex w-full max-w-md flex-col gap-5 rounded-2xl border border-[#2b7fff]/30 bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-[#2b7fff] text-blue-50"><Lock className="size-5" /></div>
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">Join a Private Quiz</h2>
              <p className="text-sm text-[#71717b]">"{privateQuiz.title}" is private. Enter the password shared by your host.</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-1.5 text-sm font-medium"><KeyRound className="size-3.5 text-[#71717b]" /> Password</label>
              <input
                type="password"
                autoFocus
                className={`${inputBase} h-11 px-3`}
                placeholder="Enter quiz password"
                value={modalPwd}
                onChange={(e) => setModalPwd(e.target.value)}
              />
            </div>
            <Button className="w-full gap-2" disabled={!modalPwd} onClick={() => join({ quizId: privateQuiz.id, password: modalPwd }, privateQuiz.participants)}>
              <LogIn className="size-4" /> Join private quiz
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-xs text-[#71717b]"><ShieldCheck className="size-3.5" /> Your access is secure and encrypted</p>
          </div>
        </div>
      )}
    </>
  );
}
