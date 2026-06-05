import { Brain } from "lucide-react";

export function AnalyticsFooter() {
  return (
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
  );
}
