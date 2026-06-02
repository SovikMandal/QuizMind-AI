import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Microscope,
  FolderOpen,
  FileQuestion,
  Calendar,
  Download,
  Share2,
  Users,
  Target,
  CircleCheck,
  Clock,
  Trophy,
  Sparkles,
  Wand2,
  ChevronRight,
  Brain,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api, apiError } from "@/lib/api";
import toast from "react-hot-toast";
import { Button } from "@/components/ui";

const card = "rounded-2xl border border-zinc-200 bg-white shadow-sm";

interface LbEntry {
  rank: number;
  participantId: string;
  username: string;
  avatarUrl: string | null;
  score: number;
  timeSecs: number;
  status: string;
}
interface Analytics {
  quiz: { id: string; title: string; subject: string | null; totalPoints: number; questionCount: number; status: string; createdAt: string };
  metrics: { totalStudents: number; avgScorePct: number; completionRate: number; avgTimeSecs: number };
  questions: { index: number; questionText: string; accuracy: number }[];
  participation: { label: string; attempts: number }[];
  scoreDistribution: { range: string; count: number }[];
  leaderboard: LbEntry[];
  summary: string;
}

const fmtTime = (s: number) => `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
const accColor = (a: number) => (a < 40 ? "#e7000b" : a < 60 ? "#ca8a04" : "#16a34a");

export default function Analytics() {
  const { sessionId = "" } = useParams();
  const navigate = useNavigate();
  const [d, setD] = useState<Analytics | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/sessions/${sessionId}/analytics`).then((r) => setD(r.data)).catch((e) => setError(apiError(e)));
  }, [sessionId]);

  if (error) return <main className="mx-auto max-w-xl px-6 py-20 text-center text-red-600">{error}</main>;
  if (!d) return <main className="px-6 py-20 text-center text-zinc-500">Loading…</main>;

  const total = d.quiz.totalPoints || 1;
  const pct = (score: number) => Math.round((score / total) * 100);
  const distTotal = d.scoreDistribution.reduce((s, b) => s + b.count, 0) || 1;
  const passCount = d.scoreDistribution.filter((b) => parseInt(b.range) >= 50).reduce((s, b) => s + b.count, 0);
  const passRate = Math.round((passCount / distTotal) * 100);
  const hardest = [...d.questions].sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);

  const metricCards = [
    { icon: Users, value: d.metrics.totalStudents, label: "Students Joined" },
    { icon: Target, value: `${d.metrics.avgScorePct}%`, label: "Avg. Score" },
    { icon: CircleCheck, value: `${d.metrics.completionRate}%`, label: "Completion Rate" },
    { icon: Clock, value: fmtTime(d.metrics.avgTimeSecs), label: "Avg. Time Taken" },
  ];

  return (
    <>
      <main className="mx-auto max-w-[1140px] px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-[#71717b]">
          <Link to="/dashboard">Dashboard</Link>
          <ChevronRight className="size-4" />
          <Link to="/results">Results</Link>
          <ChevronRight className="size-4" />
          <span className="font-medium text-zinc-950">{d.quiz.title}</span>
        </div>

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex items-start gap-4">
            <div className="flex size-14 items-center justify-center rounded-xl bg-[#2b7fff]/10">
              <Microscope className="size-7 text-[#2b7fff]" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{d.quiz.title}</h1>
                <span className="rounded-full bg-[#2b7fff]/10 px-2.5 py-0.5 text-xs font-medium capitalize text-[#2b7fff]">{d.quiz.status}</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-[#71717b]">
                <span className="flex items-center gap-1.5"><FolderOpen className="size-4" /> {d.quiz.subject ?? "General"}</span>
                <span className="flex items-center gap-1.5"><FileQuestion className="size-4" /> {d.quiz.questionCount} questions</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4" /> Created {new Date(d.quiz.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2"><Download className="size-4" /> Export</Button>
            <Button
              className="gap-2"
              onClick={() => {
                navigator.clipboard?.writeText(`${location.origin}/join/${d.quiz.id}`);
                toast.success("Quiz link copied");
              }}
            >
              <Share2 className="size-4" /> Share quiz
            </Button>
          </div>
        </div>

        {/* Metric cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {metricCards.map((c) => (
            <div key={c.label} className={`flex flex-col gap-4 p-6 ${card}`}>
              <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100 text-[#2b7fff]">
                <c.icon className="size-5" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-bold">{c.value}</span>
                <span className="text-sm text-[#71717b]">{c.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className={`flex flex-col gap-4 p-6 lg:col-span-2 ${card}`}>
            <div>
              <h2 className="text-lg font-semibold">Participation Over Time</h2>
              <p className="text-sm text-[#71717b]">Student attempts over the last 6 weeks</p>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={d.participation}>
                <defs>
                  <linearGradient id="fillAttempts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2b7fff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2b7fff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
                <Tooltip />
                <Area dataKey="attempts" type="natural" fill="url(#fillAttempts)" stroke="#2b7fff" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className={`flex flex-col gap-4 p-6 ${card}`}>
            <div>
              <h2 className="text-lg font-semibold">Score Distribution</h2>
              <p className="text-sm text-[#71717b]">How students scored</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={d.scoreDistribution}>
                <CartesianGrid vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="range" tickLine={false} axisLine={false} tickMargin={8} />
                <Tooltip />
                <Bar dataKey="count" fill="#2b7fff" radius={6} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-between rounded-lg bg-zinc-100 p-4">
              <span className="text-sm text-[#71717b]">Pass rate (≥50%)</span>
              <span className="text-lg font-bold text-[#2b7fff]">{passRate}%</span>
            </div>
          </div>
        </div>

        {/* Leaderboard + sidebar */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className={`flex flex-col gap-4 p-6 lg:col-span-2 ${card}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Student Leaderboard</h2>
                <p className="text-sm text-[#71717b]">Top performers ranked by score</p>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#71717b]">
                  <th className="w-16 pb-2 font-medium">Rank</th>
                  <th className="pb-2 font-medium">Student</th>
                  <th className="pb-2 font-medium">Score</th>
                  <th className="pb-2 font-medium">Time</th>
                  <th className="pb-2 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {d.leaderboard.length === 0 && (
                  <tr><td colSpan={5} className="py-4 text-zinc-500">No participants yet.</td></tr>
                )}
                {d.leaderboard.map((e) => (
                  <tr key={e.participantId} className="border-t border-zinc-100">
                    <td className="py-3">
                      {e.rank === 1 ? (
                        <span className="flex size-7 items-center justify-center rounded-full bg-amber-100"><Trophy className="size-4 text-amber-500" /></span>
                      ) : (
                        <span className="flex size-7 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600">{e.rank}</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className="flex items-center gap-3">
                        {e.avatarUrl ? (
                          <img src={e.avatarUrl} alt="" className="size-8 rounded-full object-cover" />
                        ) : (
                          <span className="flex size-8 items-center justify-center rounded-full bg-[#2b7fff]/10 text-xs font-semibold text-[#2b7fff]">
                            {e.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                        <span className="font-medium">{e.username}</span>
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-[#2b7fff]">{pct(e.score)}%</td>
                    <td className="py-3 text-[#71717b]">{fmtTime(e.timeSecs)}</td>
                    <td className="py-3 text-right">
                      {e.status === "completed" ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600">Completed</span>
                      ) : (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">In progress</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-6">
            <div className={`flex flex-col gap-4 p-6 ${card}`}>
              <div>
                <h2 className="text-lg font-semibold">Hardest Questions</h2>
                <p className="text-sm text-[#71717b]">Lowest correct answer rates</p>
              </div>
              <div className="flex flex-col gap-4">
                {hardest.length === 0 && <p className="text-sm text-zinc-400">No data yet</p>}
                {hardest.map((q) => (
                  <div key={q.index} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate font-medium">Q{q.index} · {q.questionText}</span>
                      <span style={{ color: accColor(q.accuracy) }}>{q.accuracy}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100">
                      <div className="h-2 rounded-full" style={{ width: `${q.accuracy}%`, background: accColor(q.accuracy) }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl border border-[#2b7fff]/20 bg-[#2b7fff]/5 p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-[#2b7fff] text-white">
                  <Sparkles className="size-5" />
                </div>
                <h2 className="text-base font-semibold">AI Insights</h2>
              </div>
              <p className="text-sm text-[#71717b]">{d.summary}</p>
              <Button className="w-full gap-2" onClick={() => navigate("/quiz/create")}>
                <Wand2 className="size-4" /> Generate review
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200">
        <div className="mx-auto flex max-w-[1140px] items-center justify-between p-6">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#2b7fff] text-white">
              <Brain className="size-4" />
            </div>
            <span className="font-semibold">QuizMind AI</span>
          </div>
          <span className="text-sm text-[#71717b]">© 2025 QuizMind. All rights reserved.</span>
        </div>
      </footer>
    </>
  );
}
