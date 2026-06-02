import { Brain, Sparkles, BarChart3, HelpCircle, Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#2b7fff]">
      <div className="absolute -left-32 -top-32 size-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-32 size-[28rem] rounded-full bg-white/10 blur-3xl" />
      <div className="absolute right-1/4 top-1/4 size-72 rounded-full bg-white/5 blur-3xl" />

      <div className="relative flex flex-col items-center gap-12">
        <div className="relative flex size-80 items-center justify-center">
          <div className="absolute inset-12 animate-pulse rounded-3xl bg-white/20 blur-2xl" />
          <div className="absolute inset-16 animate-ping rounded-3xl border border-white/30" />
          <div className="relative flex size-32 items-center justify-center rounded-3xl border border-white/25 bg-white/15 shadow-2xl backdrop-blur-md">
            <Brain className="size-16 text-white" />
          </div>
          <div className="absolute left-1/2 top-2 flex size-16 -translate-x-1/2 animate-bounce items-center justify-center rounded-2xl border border-white/25 bg-white/15 shadow-lg backdrop-blur-md">
            <Sparkles className="size-6 text-white" />
          </div>
          <div className="absolute bottom-6 right-2 flex size-16 animate-bounce items-center justify-center rounded-2xl border border-white/25 bg-white/15 shadow-lg backdrop-blur-md">
            <BarChart3 className="size-6 text-white" />
          </div>
          <div className="absolute bottom-6 left-2 flex size-16 animate-bounce items-center justify-center rounded-2xl border border-white/25 bg-white/15 shadow-lg backdrop-blur-md">
            <HelpCircle className="size-6 text-white" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <Brain className="size-6 text-white" />
            <span className="text-2xl font-semibold tracking-tight text-white">QuizMind AI</span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <Loader2 className="size-4 animate-spin" />
            <span className="text-sm">Loading your content…</span>
          </div>
          <div className="mt-2 h-1 w-56 overflow-hidden rounded-full bg-white/20">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
