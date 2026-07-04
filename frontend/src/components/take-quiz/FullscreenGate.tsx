import { useState } from "react";
import { Maximize, AlertTriangle, Shield, Lock, Eye, Clock } from "lucide-react";
import { Button, Card, Badge } from "@/components/ui";
import { requestFullscreen } from "./utils";

interface Props {
  quizTitle: string;
  subject?: string | null;
  difficulty?: string | null;
  totalQuestions: number;
  durationMins: number;
  onGranted: () => void;
  onDenied: () => void;
}

export function FullscreenGate({
  quizTitle,
  subject,
  difficulty,
  totalQuestions,
  durationMins,
  onGranted,
  onDenied,
}: Props) {
  const [denied, setDenied] = useState(false);

  const handleEnterFullscreen = async () => {
    try {
      await requestFullscreen();
      onGranted();
    } catch {
      setDenied(true);
    }
  };

  if (denied) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
        <div className="mx-4 w-full max-w-md">
          <Card className="border-red-200/20 bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="size-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">Fullscreen Required</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              This quiz requires fullscreen mode to maintain exam integrity. You cannot take this quiz without enabling
              fullscreen.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button className="w-full py-3" onClick={handleEnterFullscreen}>
                <Maximize className="size-4" /> Try Again
              </Button>
              <Button variant="outline" className="w-full py-3" onClick={onDenied}>
                Go Back
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#1a1f36] to-slate-900">
      <div className="mx-4 w-full max-w-lg">
        <Card className="overflow-hidden border-0 bg-white shadow-2xl">
          <div className="bg-gradient-to-r from-[#2b7fff] to-[#1a6ef0] px-8 py-6 text-white">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-white/20">
                <Shield className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Quiz Security Check</h2>
                <p className="text-sm text-blue-100">Enable fullscreen to proceed</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-6 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
              <h3 className="font-semibold text-zinc-900">{quizTitle}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {subject && <Badge className="bg-blue-50 text-blue-700">{subject}</Badge>}
                {difficulty && <Badge className="bg-amber-50 capitalize text-amber-700">{difficulty}</Badge>}
                <Badge className="bg-zinc-100 text-zinc-600">{totalQuestions} questions</Badge>
                <Badge className="bg-zinc-100 text-zinc-600">{durationMins} min</Badge>
              </div>
            </div>

            <div className="mb-6 space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Quiz Rules</h4>
              <div className="space-y-2.5">
                {[
                  { icon: Maximize, text: "Quiz runs in fullscreen mode only" },
                  { icon: Eye, text: "Exiting fullscreen will pause the quiz" },
                  { icon: Lock, text: "Tab switching is monitored" },
                  { icon: Clock, text: "Timer continues once started" },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-zinc-50 px-3 py-2.5">
                    <Icon className="size-4 shrink-0 text-[#2b7fff]" />
                    <span className="text-sm text-zinc-700">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleEnterFullscreen}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#2b7fff] to-[#1a6ef0] py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98] cursor-pointer"
            >
              <Maximize className="size-5" />
              Enter Fullscreen & Start Quiz
            </button>
            <p className="mt-3 text-center text-xs text-zinc-400">
              By proceeding, you agree to take this quiz in fullscreen mode
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
