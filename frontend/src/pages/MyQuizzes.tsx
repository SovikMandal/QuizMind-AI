import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Lock,
  Globe,
  Eye,
  Users,
  Target,
  Hash,
  KeyRound,
  Play,
  Share2,
  Trash2,
  Trophy,
  AlertTriangle,
  Landmark,
  Sigma,
  Code2,
  Microscope,
  FlaskConical,
  Atom,
} from "lucide-react";
import { api, apiError } from "@/lib/api";
import toast from "react-hot-toast";
import { useAuth } from "@/stores/auth";
import { Button, Card, cn } from "@/components/ui";
import { MyQuizzesSkeleton } from "@/components/MyQuizzesSkeleton";

interface MyQuiz {
  id: string;
  title: string;
  subject: string | null;
  difficulty: string;
  quizType: "public" | "private";
  status: string;
  accessCode: string | null;
  hasPassword: boolean;
  questionCount: number;
  participants: number;
  accuracy: number;
}

interface JoinedQuiz {
  sessionId: string;
  title: string;
  subject: string | null;
  creatorId: string;
  score: number;
  rank: number | null;
  status: string;
}

const statusLabel = (s: string) => (s === "live" ? "Live" : s === "scheduled" ? "Soon" : "Open");

function subjectIcon(subject: string | null) {
  const s = (subject ?? "").toLowerCase();
  if (s.includes("hist")) return Landmark;
  if (s.includes("math") || s.includes("algebra") || s.includes("calc")) return Sigma;
  if (s.includes("cod") || s.includes("c++") || s.includes("program") || s.includes("java") || s.includes("python")) return Code2;
  if (s.includes("chem")) return FlaskConical;
  if (s.includes("bio") || s.includes("cell")) return Microscope;
  return Atom;
}

export default function MyQuizzes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<MyQuiz[]>([]);
  const [joined, setJoined] = useState<JoinedQuiz[]>([]);
  const [pendingDelete, setPendingDelete] = useState<MyQuiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get("/quizzes/mine").then((r) => setQuizzes(r.data.quizzes)),
      api.get("/users/me/history").then((r) => setJoined(r.data.participated)),
    ]).finally(() => setLoading(false));
  }, []);

  const otherQuizzes = joined.filter((j) => j.creatorId !== user?.id);

  const join = async (q: MyQuiz) => {
    try {
      const body: Record<string, unknown> = { quizId: q.id };
      if (q.quizType === "private") {
        const pwd = window.prompt(`"${q.title}" is private. Enter the password to take it:`);
        if (pwd === null) return;
        body.password = pwd;
      }
      const res = await api.post("/sessions/join", body);
      const { sessionId, participantId, quiz, completed, savedAnswers } = res.data;
      navigate(`/take/${sessionId}`, {
        state: {
          participantId,
          questions: quiz.questions,
          quizTitle: quiz.title,
          subject: quiz.subject,
          difficulty: quiz.difficulty,
          scheduledAt: quiz.scheduledAt,
          durationMins: quiz.durationMins,
          participants: q.participants,
          completed,
          savedAnswers,
        },
      });
    } catch (err) {
      toast.error(apiError(err, "Could not open quiz"));
    }
  };

  const share = (q: MyQuiz) => {
    navigator.clipboard?.writeText(`${location.origin}/join/${q.id}`);
    toast.success("Quiz link copied");
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await api.delete(`/quizzes/${pendingDelete.id}`);
      setQuizzes((qs) => qs.filter((x) => x.id !== pendingDelete.id));
      toast.success("Quiz deleted");
    } catch (err) {
      toast.error(apiError(err, "Could not delete quiz"));
    } finally {
      setPendingDelete(null);
    }
  };

  if (loading) return <MyQuizzesSkeleton />;

  return (
    <main className="mx-auto max-w-[1140px] px-6 py-8">
      <div className="mb-8 flex items-end justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">My Quizzes</h1>
          <p className="text-sm text-[#71717b]">All the quizzes you have created, with sharing details.</p>
        </div>
        <Button onClick={() => navigate("/quiz/create")}><Plus className="size-4" /> Create Quiz</Button>
      </div>

      <h2 className="mb-4 text-xl font-semibold">Created by you</h2>
      {quizzes.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 py-16 text-center text-sm text-zinc-400">
          You haven't created any quizzes yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((q) => {
            const Icon = subjectIcon(q.subject);
            return (
              <Card key={q.id} className="flex flex-col gap-4 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100 text-[#2b7fff]"><Icon className="size-5" /></div>
                    <span
                      className={cn(
                        "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                        q.quizType === "private" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                      )}
                    >
                      {q.quizType === "private" ? <Lock className="size-3" /> : <Globe className="size-3" />}
                      {q.quizType === "private" ? "Private" : "Public"}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-medium text-[#71717b]">
                    <Eye className="size-3" /> {statusLabel(q.status)}
                  </span>
                </div>

                <h3 className="text-lg font-bold leading-tight">{q.title}</h3>

                <p className="text-sm text-[#71717b]">{q.subject ?? "General"} · {q.questionCount} questions</p>
                <div className="flex items-center gap-4 text-sm text-[#71717b]">
                  <span className="flex items-center gap-1"><Users className="size-4" /> {q.participants}</span>
                  <span className="flex items-center gap-1"><Target className="size-4" /> {q.accuracy}%</span>
                </div>

                {q.quizType === "private" ? (
                  <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-zinc-100/50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-[#71717b]"><Hash className="size-3.5" /> Join Code</span>
                      <span className="rounded bg-white px-2 py-0.5 font-mono text-sm font-semibold tracking-widest">{q.accessCode ?? "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-[#71717b]"><KeyRound className="size-3.5" /> Password</span>
                      <span className="rounded bg-white px-2 py-0.5 font-mono text-sm font-semibold">{q.hasPassword ? "••••••" : "—"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 text-sm text-emerald-700">
                    <Globe className="size-4" /> Anyone can join — no code or password needed.
                  </div>
                )}

                <div className="mt-auto flex gap-2">
                  <Button variant="outline" className="!text-[#2b7fff]" onClick={() => share(q)}><Share2 className="size-4" /></Button>
                  <Button variant="outline" className="flex-1" onClick={() => join(q)}><Play className="size-4" /> Take quiz</Button>
                  <Button variant="outline" className="!text-[#e7000b]" onClick={() => setPendingDelete(q)}><Trash2 className="size-4" /></Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <h2 className="mb-4 mt-10 text-xl font-semibold">Joined quizzes</h2>
      {otherQuizzes.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 py-16 text-center text-sm text-zinc-400">
          You haven't joined any quizzes created by others yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {otherQuizzes.map((j) => {
            const Icon = subjectIcon(j.subject);
            return (
              <Card key={j.sessionId} className="flex flex-col gap-3 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100 text-[#2b7fff]"><Icon className="size-5" /></div>
                  <span className="flex items-center gap-1 rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-medium text-[#71717b]">
                    <Eye className="size-3" /> {statusLabel(j.status)}
                  </span>
                </div>
                <h3 className="text-lg font-bold leading-tight">{j.title}</h3>
                <p className="text-sm text-[#71717b]">{j.subject ?? "General"}</p>
                <div className="flex items-center gap-4 text-sm text-[#71717b]">
                  <span className="flex items-center gap-1"><Trophy className="size-4 text-[#2b7fff]" /> {j.score} pts</span>
                  <span>Rank #{j.rank ?? "—"}</span>
                </div>
                <Button variant="outline" className="mt-auto" onClick={() => navigate(`/results/${j.sessionId}`)}>View results</Button>
              </Card>
            );
          })}
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4">
          <Card className="w-[420px] max-w-full overflow-hidden p-0">
            <div className="flex flex-col items-center gap-3 border-b border-zinc-200 bg-zinc-100 px-8 pb-6 pt-8">
              <div className="flex size-14 items-center justify-center rounded-full bg-[#e7000b]/10">
                <AlertTriangle className="size-7 text-[#e7000b]" />
              </div>
              <h2 className="text-xl font-bold">Delete this quiz?</h2>
            </div>
            <div className="flex flex-col gap-4 p-8">
              <p className="text-center text-sm text-[#71717b]">
                <span className="font-medium text-zinc-950">{pendingDelete.title}</span> and all of its results will be permanently removed. This can't be undone.
              </p>
              <div className="flex gap-4 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setPendingDelete(null)}>Cancel</Button>
                <button onClick={confirmDelete} className="flex-1 rounded-lg bg-[#e7000b] py-2 text-sm font-medium text-white">
                  Delete Quiz
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}
