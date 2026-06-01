import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import type { Socket } from "socket.io-client";
import { Clock, Check, Lightbulb, Trophy, Users, Play, ArrowRight } from "lucide-react";
import { connectQuizSocket } from "@/lib/socket";
import { Button, Card, Badge, cn } from "@/components/ui";

interface Opt { id: string; text: string }
interface LiveQuestion {
  question: { id: string; questionText: string; questionType: string; options?: Opt[] };
  questionIndex: number;
  total: number;
  timeLimit: number;
}
interface LbEntry { rank: number; participantId: string; username: string; score: number }
interface PlayState { participantId: string; isHost: boolean; quizTitle: string }

const medals = ["🏆", "🥈", "🥉"];

export default function PlayQuiz() {
  const { sessionId = "" } = useParams();
  const navigate = useNavigate();
  const state = (useLocation().state ?? null) as PlayState | null;
  const socketRef = useRef<Socket | null>(null);

  const [status, setStatus] = useState<"lobby" | "live" | "ended">("lobby");
  const [participants, setParticipants] = useState<{ id: string; username: string }[]>([]);
  const [current, setCurrent] = useState<LiveQuestion | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selected, setSelected] = useState("");
  const [answered, setAnswered] = useState(false);
  const [result, setResult] = useState<{ isCorrect: boolean; pointsEarned: number } | null>(null);
  const [reveal, setReveal] = useState<{ correctAnswer: string; explanation: string | null } | null>(null);
  const [leaderboard, setLeaderboard] = useState<LbEntry[]>([]);
  const [error, setError] = useState("");

  // Establish the socket once and wire up all events.
  useEffect(() => {
    if (!state) {
      navigate("/discover", { replace: true });
      return;
    }
    const socket = connectQuizSocket();
    socketRef.current = socket;

    socket.on("connect", () => socket.emit("join_room", { sessionId, participantId: state.participantId }));
    socket.on("waiting_room_update", (d: { participants: typeof participants }) => setParticipants(d.participants));
    socket.on("quiz_started", () => setStatus("live"));
    socket.on("question_started", (q: LiveQuestion) => {
      setCurrent(q);
      setStatus("live");
      setSelected("");
      setAnswered(false);
      setResult(null);
      setReveal(null);
    });
    socket.on("answer_confirmed", (r: { isCorrect: boolean; pointsEarned: number }) => setResult(r));
    socket.on("leaderboard_update", (d: { leaderboard: LbEntry[] }) => setLeaderboard(d.leaderboard));
    socket.on("question_ended", (d: { correctAnswer: string; explanation: string | null; leaderboard: LbEntry[] }) => {
      setReveal({ correctAnswer: d.correctAnswer, explanation: d.explanation });
      setLeaderboard(d.leaderboard);
    });
    socket.on("quiz_ended", (d: { finalLeaderboard: LbEntry[] }) => {
      setLeaderboard(d.finalLeaderboard);
      setStatus("ended");
    });
    socket.on("error", (d: { message: string }) => setError(d.message));

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Per-question countdown.
  useEffect(() => {
    if (!current || reveal) return;
    setTimeLeft(current.timeLimit);
    const id = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [current, reveal]);

  const submit = () => {
    if (!current || !selected) return;
    socketRef.current?.emit("submit_answer", {
      sessionId,
      questionId: current.question.id,
      answer: selected,
      timeTaken: current.timeLimit - timeLeft,
    });
    setAnswered(true);
  };

  const optionClass = (o: Opt) => {
    if (reveal) {
      if (o.id === reveal.correctAnswer) return "border-green-400 bg-green-50 text-green-800";
      if (o.id === selected) return "border-red-300 bg-red-50 text-red-700";
      return "border-zinc-200 opacity-70";
    }
    return selected === o.id ? "border-[#2b7fff] bg-[#2b7fff]/5 text-[#2b7fff]" : "border-zinc-200 hover:border-[#2b7fff]";
  };

  if (error && status !== "ended") {
    return (
      <main className="mx-auto max-w-xl px-6 py-20 text-center">
        <p className="rounded-lg bg-red-50 px-4 py-3 text-red-600">{error}</p>
        <Button className="mt-4" onClick={() => navigate("/discover")}>Back to Discover</Button>
      </main>
    );
  }

  // ── Lobby ──
  if (status === "lobby") {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12">
        <Badge className="bg-[#2b7fff]/10 text-[#2b7fff]">Waiting room</Badge>
        <h1 className="mt-3 text-3xl font-bold">{state?.quizTitle}</h1>
        <Card className="mt-6 p-6">
          <div className="flex items-center gap-2 text-zinc-600">
            <Users className="size-4" /> {participants.length} joined
          </div>
          <ul className="mt-4 flex flex-wrap gap-2">
            {participants.map((p) => (
              <Badge key={p.id}>{p.username}</Badge>
            ))}
          </ul>
          <div className="mt-6">
            {state?.isHost ? (
              <Button onClick={() => socketRef.current?.emit("start_quiz", { sessionId })}>
                <Play className="size-4" /> Start Quiz
              </Button>
            ) : (
              <p className="text-sm text-zinc-500">Waiting for the host to start…</p>
            )}
          </div>
        </Card>
      </main>
    );
  }

  // ── Ended ──
  if (status === "ended") {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-3xl font-bold">Final Results</h1>
        <Card className="mt-6 divide-y divide-zinc-100">
          {leaderboard.map((e) => (
            <div key={e.participantId} className="flex items-center justify-between px-5 py-3">
              <span className="flex items-center gap-3">
                <span className="w-6 text-center">{medals[e.rank - 1] ?? e.rank}</span>
                <span className="font-medium">{e.username}</span>
              </span>
              <span className="font-bold text-[#2b7fff]">{e.score}</span>
            </div>
          ))}
        </Card>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => navigate(`/results/${sessionId}`)}>View detailed results</Button>
          {state?.isHost && (
            <Button variant="outline" onClick={() => navigate(`/analytics/${sessionId}`)}>
              View analytics
            </Button>
          )}
        </div>
      </main>
    );
  }

  // ── Live ──
  const q = current?.question;
  return (
    <main className="mx-auto grid max-w-[1140px] gap-6 px-6 py-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-500">
            Question {(current?.questionIndex ?? 0) + 1} of {current?.total}
          </span>
          <span className={cn("flex items-center gap-1 font-bold", timeLeft <= 5 ? "text-red-600" : "text-[#2b7fff]")}>
            <Clock className="size-4" /> {timeLeft}s
          </span>
        </div>

        <Card className="mt-4 p-8">
          <h2 className="text-lg font-bold">{q?.questionText}</h2>

          {q?.options ? (
            <div className="mt-5 space-y-3">
              {q.options.map((o) => (
                <button
                  key={o.id}
                  disabled={answered || !!reveal}
                  onClick={() => setSelected(o.id)}
                  className={cn("flex w-full items-center gap-3 rounded-lg border-2 px-4 py-3 text-left text-sm", optionClass(o))}
                >
                  {reveal?.correctAnswer === o.id && <Check className="size-4" />}
                  {o.text}
                </button>
              ))}
            </div>
          ) : (
            <input
              disabled={answered || !!reveal}
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              placeholder="Type your answer"
              className="mt-5 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          )}

          {result && (
            <p className={cn("mt-4 text-sm font-medium", result.isCorrect ? "text-green-600" : "text-red-600")}>
              {result.isCorrect ? `Correct! +${result.pointsEarned}` : "Incorrect"}
            </p>
          )}

          {reveal?.explanation && (
            <p className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-900">
              <Lightbulb className="mt-0.5 size-4 shrink-0" /> {reveal.explanation}
            </p>
          )}

          {!answered && !reveal && (
            <Button className="mt-5" disabled={!selected} onClick={submit}>
              Submit answer
            </Button>
          )}

          {reveal && state?.isHost && (
            <Button className="mt-5" onClick={() => socketRef.current?.emit("next_question", { sessionId })}>
              Next <ArrowRight className="size-4" />
            </Button>
          )}
          {reveal && !state?.isHost && (
            <p className="mt-5 text-sm text-zinc-500">Waiting for the host…</p>
          )}
        </Card>
      </div>

      <Card className="h-fit p-5">
        <h3 className="flex items-center gap-2 font-semibold">
          <Trophy className="size-4 text-[#2b7fff]" /> Leaderboard
        </h3>
        <div className="mt-3 space-y-2">
          {leaderboard.map((e) => (
            <div key={e.participantId} className="flex justify-between text-sm">
              <span>{medals[e.rank - 1] ?? `${e.rank}.`} {e.username}</span>
              <span className="font-semibold">{e.score}</span>
            </div>
          ))}
          {leaderboard.length === 0 && <p className="text-sm text-zinc-400">No scores yet</p>}
        </div>
      </Card>
    </main>
  );
}
