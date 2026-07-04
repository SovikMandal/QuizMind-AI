import { Radio, Timer, Send, Shield, AlertTriangle } from "lucide-react";
import { cn } from "@/components/ui";
import { fmt } from "./utils";

interface Props {
  quizTitle: string;
  subject?: string | null;
  difficulty?: string | null;
  timeLeft: number;
  isLive: boolean;
  violations: number;
  submitting: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
}

export function QuizHeader({
  quizTitle,
  subject,
  difficulty,
  timeLeft,
  isLive,
  violations,
  submitting,
  canSubmit,
  onSubmit,
}: Props) {
  const timerColor = timeLeft <= 60 ? "text-red-500" : timeLeft <= 300 ? "text-amber-500" : "text-[#2b7fff]";
  const timerBg =
    timeLeft <= 60 ? "bg-red-50 border-red-200" : timeLeft <= 300 ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200";

  return (
    <header className="shrink-0 border-b border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left: Quiz info */}
        <div className="flex items-center gap-4">
          <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#2b7fff] to-[#1a6ef0]">
            <Shield className="size-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-900 line-clamp-1 max-w-[280px]">{quizTitle}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              {subject && <span className="text-xs text-zinc-500">{subject}</span>}
              {subject && difficulty && <span className="text-xs text-zinc-300">•</span>}
              {difficulty && <span className="text-xs capitalize text-zinc-500">{difficulty}</span>}
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

        {/* Right: Status + Submit */}
        <div className="flex items-center gap-3">
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
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className="flex items-center gap-2 rounded-lg bg-[#2b7fff] px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#1a6ef0] active:scale-[0.98] disabled:opacity-50 disabled:shadow-none cursor-pointer"
          >
            <Send className="size-4" /> {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </header>
  );
}
