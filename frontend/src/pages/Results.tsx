import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Sparkles,
  CheckCircle2,
  Trophy,
  Medal,
  Users,
  Target,
  Activity,
  Check,
  X,
  LayoutDashboard,
  BarChart3,
  RotateCcw,
} from "lucide-react";
import { api, apiError } from "@/lib/api";
import { Button, Card, Badge, cn } from "@/components/ui";
import { LoadingScreen } from "@/components/LoadingScreen";

interface ResultsData {
  quiz: { title: string; subject: string | null; totalPoints: number };
  personal: { score: number; rank: number | null; accuracyPct: number } | null;
  breakdown: {
    questionText: string;
    submittedAnswer: string | null;
    correctAnswer: string;
    isCorrect: boolean | null;
    pointsEarned: number;
    options?: { id: string; text: string; isCorrect?: boolean }[] | null;
  }[];
  leaderboard: { rank: number; username: string; score: number }[];
}

export default function Results() {
  const { sessionId = "" } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<ResultsData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/sessions/${sessionId}/results`).then((r) => setData(r.data)).catch((e) => setError(apiError(e)));
  }, [sessionId]);

  if (error) return <main className="mx-auto max-w-xl px-6 py-20 text-center text-red-600">{error}</main>;
  if (!data) return <LoadingScreen />;

  const total = data.quiz.totalPoints || 1;
  const score = data.personal?.score ?? 0;
  const accuracy = data.personal?.accuracyPct ?? 0;
  const scorePct = Math.min(100, Math.round((score / total) * 100));
  const n = data.leaderboard.length;

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      {/* Hero */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-zinc-200 bg-[#2b7fff]/5 p-8">
        <div className="absolute -right-12 -top-12 size-48 rounded-full bg-[#2b7fff]/10" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#2b7fff] text-blue-50">
              <Sparkles className="size-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#2b7fff]">Quiz Results</p>
              <h1 className="text-3xl font-bold tracking-tight">{data.quiz.title}</h1>
            </div>
          </div>
          <Badge className="rounded-full bg-[#2b7fff]/10 px-4 py-1.5 text-sm font-semibold text-[#2b7fff]">
            <CheckCircle2 className="size-4" /> Completed
          </Badge>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card className="relative overflow-hidden p-6">
          <div className="absolute inset-x-0 top-0 h-1 bg-[#2b7fff]" />
          <p className="flex items-center gap-2 text-sm text-[#71717b]">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#2b7fff]/10"><Trophy className="size-4 text-[#2b7fff]" /></span> Score
          </p>
          <p className="mt-2 text-4xl font-bold">{score}<span className="text-lg font-medium text-[#71717b]">/{data.quiz.totalPoints}</span></p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
            <div className="h-full rounded-full bg-[#2b7fff] transition-all" style={{ width: `${scorePct}%` }} />
          </div>
        </Card>

        <Card className="relative overflow-hidden p-6">
          <div className="absolute inset-x-0 top-0 h-1 bg-[#2b7fff]" />
          <p className="flex items-center gap-2 text-sm text-[#71717b]">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#2b7fff]/10"><Medal className="size-4 text-[#2b7fff]" /></span> Rank
          </p>
          <p className="mt-2 text-4xl font-bold">#{data.personal?.rank ?? "—"}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-[#71717b]"><Users className="size-3" /> of {n} participant{n !== 1 ? "s" : ""}</p>
        </Card>

        <Card className="relative overflow-hidden p-6">
          <div className="absolute inset-x-0 top-0 h-1 bg-[#2b7fff]" />
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p className="flex items-center gap-2 text-sm text-[#71717b]">
                <span className="flex size-7 items-center justify-center rounded-lg bg-[#2b7fff]/10"><Target className="size-4 text-[#2b7fff]" /></span> Accuracy
              </p>
              <p className="text-4xl font-bold">{accuracy}%</p>
            </div>
            <div
              className="relative flex size-16 shrink-0 items-center justify-center rounded-full"
              style={{ background: `conic-gradient(#2b7fff ${accuracy * 3.6}deg, #e4e4e7 ${accuracy * 3.6}deg)` }}
            >
              <div className="flex size-11 items-center justify-center rounded-full bg-white">
                <Activity className="size-5 text-[#2b7fff]" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Leaderboard */}
      <div className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold"><Trophy className="size-5 text-[#2b7fff]" /> Leaderboard</h2>
        <div className="flex flex-col gap-3">
          {data.leaderboard.map((e) => (
            <Card
              key={e.rank}
              className={cn("flex items-center justify-between p-4", e.rank === 1 && "border-[#2b7fff]/30 bg-[#2b7fff]/5")}
            >
              <div className="flex items-center gap-3">
                <div className={cn("flex size-9 items-center justify-center rounded-full", e.rank === 1 ? "bg-amber-400 text-white" : "bg-zinc-100 text-zinc-600")}>
                  {e.rank === 1 ? <Trophy className="size-4" /> : <span className="text-sm font-bold">{e.rank}</span>}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">{e.username}</span>
                  <span className="text-xs text-[#71717b]">Rank #{e.rank}</span>
                </div>
              </div>
              <span className="text-xl font-bold text-[#2b7fff]">{e.score} pts</span>
            </Card>
          ))}
        </div>
      </div>

      {/* Your answers */}
      {data.breakdown.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your answers</h2>
            <div className="flex items-center gap-3 text-xs text-[#71717b]">
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-emerald-500" /> Correct</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-[#e7000b]" /> Incorrect</span>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {data.breakdown.map((b, i) => (
              <Card key={i} className={cn("border-l-4 p-6", b.isCorrect ? "border-l-emerald-500" : "border-l-[#e7000b]")}>
                <div className="flex items-start gap-3">
                  <div className={cn("flex size-6 shrink-0 items-center justify-center rounded-full", b.isCorrect ? "bg-emerald-100" : "bg-[#e7000b]/10")}>
                    {b.isCorrect ? <Check className="size-3.5 text-emerald-600" /> : <X className="size-3.5 text-[#e7000b]" />}
                  </div>
                  <p className="font-semibold">{b.questionText}</p>
                </div>
                {b.options && b.options.length ? (
                  <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 pl-9 sm:grid-cols-2">
                    {b.options.map((o, oi) => {
                      const correct = o.id === b.correctAnswer || !!o.isCorrect;
                      const your = o.id === b.submittedAnswer;
                      return (
                        <div
                          key={o.id}
                          className={cn(
                            "flex items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-sm",
                            correct ? "bg-emerald-100 text-emerald-700" : your ? "bg-[#e7000b]/10 text-[#e7000b]" : "bg-zinc-100 text-zinc-900"
                          )}
                        >
                          <span className="flex items-center gap-3">
                            <span className={cn("flex size-5 items-center justify-center rounded-full text-xs font-semibold", correct ? "bg-emerald-200 text-emerald-700" : your ? "bg-[#e7000b]/20 text-[#e7000b]" : "bg-white text-[#71717b]")}>
                              {String.fromCharCode(97 + oi)}
                            </span>
                            {o.text}
                          </span>
                          {(correct || your) && (
                            <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium">
                              {correct ? <Check className="size-4" /> : <X className="size-4" />}
                              {correct && your ? "Your answer · Correct" : correct ? "Correct" : "Your answer"}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-2 flex items-center gap-2 pl-9 text-sm text-[#71717b]">
                    <span>Your answer:</span>
                    <Badge className={cn("rounded-full", b.isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-[#e7000b]/10 text-[#e7000b]")}>{b.submittedAnswer ?? "—"}</Badge>
                    {!b.isCorrect && (
                      <>
                        <span className="mx-1">·</span>
                        <span>Correct:</span>
                        <Badge className="rounded-full bg-emerald-100 text-emerald-700">{b.correctAnswer}</Badge>
                      </>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex items-center gap-4">
        <Button onClick={() => navigate("/dashboard")}><LayoutDashboard className="size-4" /> Back to Dashboard</Button>
        <Button variant="outline" onClick={() => navigate(`/analytics/${sessionId}`)}><BarChart3 className="size-4" /> Analytics</Button>
        <Button variant="ghost" className="ml-auto text-[#71717b]" onClick={() => navigate("/discover")}><RotateCcw className="size-4" /> Take another</Button>
      </div>
    </main>
  );
}
