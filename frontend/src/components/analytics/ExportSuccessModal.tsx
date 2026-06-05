import {
  CheckCircle2,
  FileText,
  Check,
  ExternalLink,
  ArrowLeft,
  Brain,
} from "lucide-react";
import { Button, Card } from "@/components/ui";
import type { ExportedFile } from "./useAnalyticsExport";

interface Props {
  exported: ExportedFile;
  quizTitle: string;
  onDismiss: () => void;
}

export function ExportSuccessModal({ exported, quizTitle, onDismiss }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4 backdrop-blur-[2px]">
      <Card className="flex w-[440px] max-w-full flex-col gap-6 p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-[#2b7fff]/15">
            <CheckCircle2 className="size-8 text-emerald-600" />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-bold leading-7 tracking-tight">
              Report Exported Successfully
            </h3>
            <p className="text-sm leading-5 text-[#71717b]">
              Your {quizTitle} quiz results report (PDF) has been downloaded.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg bg-zinc-100 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#2b7fff]/15">
            <FileText className="size-5 text-[#2b7fff]" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-sm font-medium leading-5">{exported.filename}</span>
            <span className="text-xs leading-4 text-[#71717b]">
              {exported.sizeKb} KB · PDF Document
            </span>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium leading-4 text-emerald-700">
            <Check className="size-3" /> Ready
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            className="w-full gap-2"
            onClick={() => window.open(exported.blobUrl, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="size-4" /> Open File
          </Button>
          <Button variant="outline" className="w-full gap-2" onClick={onDismiss}>
            <ArrowLeft className="size-4" /> Back to Report
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 border-t border-zinc-200 pt-4 text-xs leading-4 text-[#71717b]">
          <Brain className="size-4 text-[#2b7fff]" />
          <span>QuizMind AI · Secure export</span>
        </div>
      </Card>
    </div>
  );
}
