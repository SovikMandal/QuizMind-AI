import { Link } from "react-router-dom";
import {
  Microscope,
  FolderOpen,
  FileQuestion,
  Calendar,
  Download,
  Share2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui";
import type { AnalyticsData } from "./types";
import type { ExportQuota } from "./useAnalyticsExport";

interface Props {
  quiz: AnalyticsData["quiz"];
  exporting: boolean;
  quota: ExportQuota | null;
  onExport: () => void;
  onShare: () => void;
}

const tierLabel: Record<ExportQuota["tier"], string> = {
  free: "Free",
  pro: "Pro",
  premium: "Premium",
};

export function AnalyticsHeader({ quiz, exporting, quota, onExport, onShare }: Props) {
  const exhausted = quota ? quota.remaining <= 0 : false;

  let exportText = "Export";
  if (exporting) exportText = "Exporting…";
  else if (quota) {
    exportText = exhausted
      ? `Limit reached (${tierLabel[quota.tier]})`
      : `Export · ${quota.remaining} left today`;
  }

  return (
    <>
      <div className="mb-6 flex items-center gap-2 text-sm text-[#71717b]">
        <Link to="/dashboard">Dashboard</Link>
        <ChevronRight className="size-4" />
        <Link to="/results">Results</Link>
        <ChevronRight className="size-4" />
        <span className="font-medium text-zinc-950">{quiz.title}</span>
      </div>

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-4">
          <div className="flex size-14 items-center justify-center rounded-xl bg-[#2b7fff]/10">
            <Microscope className="size-7 text-[#2b7fff]" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{quiz.title}</h1>
              <span className="rounded-full bg-[#2b7fff]/10 px-2.5 py-0.5 text-xs font-medium capitalize text-[#2b7fff]">
                {quiz.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#71717b]">
              <span className="flex items-center gap-1.5">
                <FolderOpen className="size-4" /> {quiz.subject ?? "General"}
              </span>
              <span className="flex items-center gap-1.5">
                <FileQuestion className="size-4" /> {quiz.questionCount} questions
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                Created{" "}
                {new Date(quiz.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={onExport}
            disabled={exporting || exhausted}
            title={
              exhausted
                ? `You've used all ${quota?.limit} exports for today. Resets at ${new Date(
                    quota!.resetAt
                  ).toLocaleString()}.`
                : undefined
            }
          >
            <Download className="size-4" /> {exportText}
          </Button>
          <Button className="gap-2" onClick={onShare}>
            <Share2 className="size-4" /> Share quiz
          </Button>
        </div>
      </div>
    </>
  );
}
