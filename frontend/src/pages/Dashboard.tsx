import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Download,
  Plus,
  PencilRuler,
  Users,
  Target,
  Flame,
  TrendingUp,
  ArrowRight,
  Wand2,
  Atom,
  Brain,
} from "lucide-react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api } from "@/lib/api";
import { useAuth } from "@/stores/auth";
import { Button } from "@/components/ui";
import { LoadingScreen } from "@/components/LoadingScreen";

const card = "rounded-2xl border border-zinc-200 bg-white shadow-sm";

interface DashboardData {
  stats: { created: number; joined: number; avgScore: number; dayStreak: number };
  trends: { created: string; joined: string };
  activity: { month: string; created: number; joined: number }[];
  categories: { name: string; value: number; fill: string }[];
  goals: { label: string; text: string; value: number }[];
}

interface HistoryItem {
  sessionId: string;
  title: string;
  subject: string | null;
  score: number;
  status: string;
  joinedAt: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dash, setDash] = useState<DashboardData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/users/me/dashboard").then((r) => setDash(r.data)).catch(() => {}).finally(() => setLoading(false));
    api.get("/users/me/history").then((r) => setHistory(r.data.participated)).catch(() => {});
  }, []);

  if (loading) return <LoadingScreen />;

  const s = dash?.stats;
  const statCards = [
    { icon: PencilRuler, value: s?.created ?? 0, label: "Quizzes Created", trend: dash?.trends.created },
    { icon: Users, value: s?.joined ?? 0, label: "Quizzes Joined", trend: dash?.trends.joined },
    { icon: Target, value: `${s?.avgScore ?? 0}%`, label: "Avg. Score" },
    { icon: Flame, value: s?.dayStreak ?? 0, label: "Day Streak" },
  ];

  const activity = dash?.activity ?? [];
  const categories = dash?.categories ?? [];
  const goals = dash?.goals ?? [];

  return (
    <>
      <main className="mx-auto flex max-w-[1140px] flex-col gap-12 px-6 py-12">
        {/* Welcome */}
        <section className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-3">
            <span className="flex w-fit items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium">
              <Sparkles className="size-3.5 text-[#2b7fff]" /> {s?.dayStreak ?? 0}-day learning streak
            </span>
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome back, <span className="text-[#2b7fff]">{user?.displayName ?? user?.username}</span>
            </h1>
            <p className="max-w-xl text-base text-[#71717b]">
              Here's an overview of your learning activity, performance, and progress across all your quizzes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 px-5">
              <Download className="size-4" /> Export
            </Button>
            <Button className="gap-2 px-5" onClick={() => navigate("/quiz/create")}>
              <Plus className="size-4" /> Create quiz
            </Button>
          </div>
        </section>

        {/* Stat cards */}
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((c) => (
            <div key={c.label} className={`flex flex-col gap-4 p-6 ${card}`}>
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100 text-[#2b7fff]">
                  <c.icon className="size-5" />
                </div>
                {c.trend && (
                  <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-emerald-600">
                    <TrendingUp className="size-3" /> {c.trend}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-bold tracking-tight">{c.value}</span>
                <span className="text-sm text-[#71717b]">{c.label}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className={`flex flex-col gap-4 p-6 lg:col-span-2 ${card}`}>
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold">Quiz Activity</h2>
                <p className="text-sm text-[#71717b]">Created vs joined over the last 6 months</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#2b7fff]" /> Created</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#71717b]" /> Joined</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={256}>
              <AreaChart data={activity}>
                <defs>
                  <linearGradient id="fillCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2b7fff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2b7fff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillJoined" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#71717b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#71717b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                <Tooltip />
                <Area dataKey="joined" type="natural" fill="url(#fillJoined)" stroke="#71717b" strokeWidth={2} />
                <Area dataKey="created" type="natural" fill="url(#fillCreated)" stroke="#2b7fff" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className={`flex flex-col gap-4 p-6 ${card}`}>
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold">Category Breakdown</h2>
              <p className="text-sm text-[#71717b]">By quiz subject area</p>
            </div>
            {categories.length === 0 ? (
              <p className="py-10 text-center text-sm text-zinc-400">No quiz activity yet</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Tooltip />
                    <Pie data={categories} dataKey="value" nameKey="name" innerRadius={42} outerRadius={64} strokeWidth={2}>
                      {categories.map((c) => (
                        <Cell key={c.name} fill={c.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((c) => (
                    <span key={c.name} className="flex items-center gap-1.5 text-xs text-[#71717b]">
                      <span className="size-2 rounded-full" style={{ background: c.fill }} /> {c.name} {c.value}%
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Recent quizzes + sidebar */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className={`flex flex-col gap-4 p-6 lg:col-span-2 ${card}`}>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold">Recent Quizzes</h2>
                <p className="text-sm text-[#71717b]">Your latest created and joined activity</p>
              </div>
              <Button variant="ghost" className="gap-1 text-[#2b7fff]" onClick={() => navigate("/my-quizzes")}>
                View all <ArrowRight className="size-4" />
              </Button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#71717b]">
                  <th className="pb-2 font-medium">Quiz</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Score</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-zinc-500">
                      No quizzes yet.{" "}
                      <button className="text-[#2b7fff]" onClick={() => navigate("/discover")}>Find one to join</button>.
                    </td>
                  </tr>
                )}
                {history.slice(0, 5).map((h) => (
                  <tr
                    key={h.sessionId}
                    className="cursor-pointer border-t border-zinc-100 hover:bg-zinc-50"
                    onClick={() => navigate(`/results/${h.sessionId}`)}
                  >
                    <td className="py-3">
                      <span className="flex items-center gap-2 font-medium">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 text-[#2b7fff]">
                          <Atom className="size-4" />
                        </span>
                        {h.title}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs capitalize">{h.status}</span>
                    </td>
                    <td className="py-3 font-semibold text-[#2b7fff]">{h.score}</td>
                    <td className="py-3 text-[#71717b]">
                      {new Date(h.joinedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-6">
            <div className={`flex flex-col gap-4 p-6 ${card}`}>
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold">Goals Progress</h2>
                <p className="text-sm text-[#71717b]">Monthly targets</p>
              </div>
              <div className="flex flex-col gap-4">
                {goals.map((g) => (
                  <div key={g.label} className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{g.label}</span>
                      <span className="text-[#71717b]">{g.text}</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100">
                      <div className="h-2 rounded-full bg-[#2b7fff]" style={{ width: `${g.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl border border-[#2b7fff]/20 bg-[#2b7fff]/5 p-6">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[#2b7fff] text-white">
                <Wand2 className="size-5" />
              </div>
              <h2 className="text-base font-semibold">Generate with AI</h2>
              <p className="text-sm text-[#71717b]">
                Turn any topic into a tailored quiz with explanations in seconds.
              </p>
              <Button className="w-full gap-2" onClick={() => navigate("/quiz/create")}>
                <Sparkles className="size-4" /> Create quiz
              </Button>
            </div>
          </div>
        </section>
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
