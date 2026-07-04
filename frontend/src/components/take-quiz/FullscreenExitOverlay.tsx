import { Maximize, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui";
import { requestFullscreen } from "./utils";

interface Props {
  onReenter: () => void;
  violations: number;
}

export function FullscreenExitOverlay({ onReenter, violations }: Props) {
  const handleReenter = async () => {
    try {
      await requestFullscreen();
      onReenter();
    } catch {
      toast.error("Please allow fullscreen to continue");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md">
        <Card className="border-0 bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="size-10 text-red-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900">Quiz Paused!</h2>
          <p className="mt-2 text-sm text-zinc-600">
            You exited fullscreen mode. The quiz is paused until you return to fullscreen.
          </p>
          <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
            <p className="text-sm font-medium text-amber-800">⚠️ Violations: {violations}/3</p>
            <p className="text-xs text-amber-600 mt-1">After 3 violations, your quiz will be auto-submitted</p>
          </div>
          <button
            onClick={handleReenter}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2b7fff] to-[#1a6ef0] py-4 font-semibold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98] cursor-pointer"
          >
            <Maximize className="size-5" />
            Return to Fullscreen
          </button>
        </Card>
      </div>
    </div>
  );
}
