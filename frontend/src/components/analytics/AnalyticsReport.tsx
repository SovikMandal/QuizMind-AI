import { forwardRef } from "react";
import {
  Brain,
  CheckCircle2,
  Folder,
  HelpCircle,
  Calendar,
  Users,
  Target,
  CheckCircle,
  Clock,
  Trophy,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";

export interface ReportLeader {
  rank: number;
  participantId: string;
  username: string;
  score: number;
  scorePct: number;
  timeText: string;
  status: string;
}
export interface ReportQuestion {
  index: number;
  questionText: string;
  accuracy: number;
}
export interface ReportBucket {
  range: string;
  count: number;
}
export interface ReportData {
  reportId: string;
  generatedDate: string; // formatted, e.g. "Jun 18, 2025"
  preparedFor: string;
  title: string;
  subject: string;
  status: string;
  questionCount: number;
  createdDate: string;
  metrics: {
    students: number;
    avgScorePct: number;
    completionRate: number;
    avgTimeText: string;
  };
  passRate: number;
  scoreDistribution: ReportBucket[];
  hardest: ReportQuestion[];
  leaderboard: ReportLeader[];
}

const accColor = (a: number) => (a < 40 ? "#e7000b" : a < 60 ? "#ca8a04" : "#16a34a");

/**
 * Off-screen report layout used to render the PDF via html2canvas.
 * Width is fixed at 816px (≈ Letter @ 96dpi) so the rasterized output
 * lays out predictably regardless of the host page.
 */
export const AnalyticsReport = forwardRef<HTMLDivElement, { data: ReportData }>(
  function AnalyticsReport({ data }, ref) {
    const distMax = Math.max(1, ...data.scoreDistribution.map((b) => b.count));

    return (
      <div ref={ref} className="bg-white text-zinc-950" style={{ width: 816 }}>
        <div className="overflow-hidden bg-white">
          {/* Header */}
          <div className="flex items-start justify-between bg-[#2b7fff] p-12 text-blue-50">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50/15">
                  <Brain className="size-5 text-blue-50" />
                </div>
                <span className="text-lg font-bold leading-7 tracking-tight">QuizMind AI</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase leading-4 tracking-widest text-blue-50/70">
                  Quiz Results Report
                </span>
                <h1 className="text-3xl font-bold leading-9 tracking-tight">{data.title}</h1>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50/15 px-2 py-1 text-xs font-medium capitalize leading-4">
                <CheckCircle2 className="size-3" /> {data.status}
              </span>
              <span className="text-xs leading-4 text-blue-50/70">
                Generated {data.generatedDate}
              </span>
              <span className="text-xs leading-4 text-blue-50/70">
                Report ID #{data.reportId}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-8 p-12">
            {/* Quiz info bar */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <div className="flex items-center gap-6 text-sm leading-5 text-[#71717b]">
                <span className="inline-flex items-center gap-2">
                  <Folder className="size-4 text-[#2b7fff]" /> {data.subject}
                </span>
                <span className="inline-flex items-center gap-2">
                  <HelpCircle className="size-4 text-[#2b7fff]" /> {data.questionCount} questions
                </span>
                <span className="inline-flex items-center gap-2">
                  <Calendar className="size-4 text-[#2b7fff]" /> Created {data.createdDate}
                </span>
              </div>
              <span className="text-xs leading-4 text-[#71717b]">
                Prepared for {data.preparedFor}
              </span>
            </div>

            {/* Performance Summary */}
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold uppercase leading-5 tracking-wide text-[#71717b]">
                Performance Summary
              </h2>
              <div className="grid grid-cols-4 gap-4">
                <SummaryCard
                  Icon={Users}
                  label="Students Joined"
                  value={String(data.metrics.students)}
                />
                <SummaryCard
                  Icon={Target}
                  label="Avg. Score"
                  value={`${data.metrics.avgScorePct}%`}
                />
                <SummaryCard
                  Icon={CheckCircle}
                  label="Completion Rate"
                  value={`${data.metrics.completionRate}%`}
                />
                <SummaryCard
                  Icon={Clock}
                  label="Avg. Time Taken"
                  value={data.metrics.avgTimeText}
                  hint="Average"
                />
              </div>
            </div>

            {/* Score Distribution + Hardest Questions */}
            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold uppercase leading-5 tracking-wide text-[#71717b]">
                  Score Distribution
                </h2>
                <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4">
                  <div className="flex h-32 items-end gap-3">
                    {data.scoreDistribution.length === 0 ? (
                      <span className="m-auto text-xs text-zinc-400">No data</span>
                    ) : (
                      data.scoreDistribution.map((b, i) => {
                        const opacity = 0.3 + (i / Math.max(1, data.scoreDistribution.length - 1)) * 0.7;
                        const h = Math.max(8, (b.count / distMax) * 100);
                        return (
                          <div key={b.range} className="flex flex-1 flex-col items-center justify-end gap-1">
                            <div
                              className="w-full rounded-t-sm"
                              style={{ height: `${h}%`, background: `rgba(43,127,255,${opacity})` }}
                            />
                            <span className="text-[10px] text-[#71717b]">{b.range}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-zinc-100 px-3 py-2">
                    <span className="text-sm leading-5 text-[#71717b]">Pass rate</span>
                    <span className="text-sm font-bold leading-5 text-[#2b7fff]">{data.passRate}%</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold uppercase leading-5 tracking-wide text-[#71717b]">
                  Hardest Questions
                </h2>
                <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-4">
                  {data.hardest.length === 0 && (
                    <p className="text-sm text-zinc-400">No data yet</p>
                  )}
                  {data.hardest.map((q) => (
                    <div key={q.index} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-sm leading-5">
                        <span className="truncate">
                          Q{q.index} · {q.questionText}
                        </span>
                        <span className="font-semibold" style={{ color: accColor(q.accuracy) }}>
                          {q.accuracy}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
                        <div className="h-full bg-[#2b7fff]" style={{ width: `${q.accuracy}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold uppercase leading-5 tracking-wide text-[#71717b]">
                Student Leaderboard
              </h2>
              <div className="overflow-hidden rounded-lg border border-zinc-200">
                <div className="grid grid-cols-[40px_1fr_80px_100px_110px] gap-2 bg-zinc-100 px-4 py-2 text-xs font-medium leading-4 text-[#71717b]">
                  <span>Rank</span>
                  <span>Student</span>
                  <span>Score</span>
                  <span>Time</span>
                  <span>Status</span>
                </div>
                {data.leaderboard.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-zinc-400">No participants yet.</div>
                ) : (
                  data.leaderboard.slice(0, 10).map((e) => (
                    <div
                      key={e.participantId}
                      className="grid grid-cols-[40px_1fr_80px_100px_110px] items-center gap-2 border-t border-zinc-200 px-4 py-3 text-sm leading-5"
                    >
                      {e.rank === 1 ? (
                        <span className="inline-flex size-6 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                          <Trophy className="size-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex size-6 items-center justify-center rounded-full bg-zinc-100 text-xs leading-4 text-[#71717b]">
                          {e.rank}
                        </span>
                      )}
                      <span className="truncate font-medium">{e.username}</span>
                      <span className="font-semibold text-[#2b7fff]">{e.scorePct}%</span>
                      <span className="text-[#71717b]">{e.timeText}</span>
                      <span
                        className={
                          e.status === "completed"
                            ? "text-xs leading-4 text-emerald-600"
                            : "text-xs leading-4 text-amber-600"
                        }
                      >
                        {e.status === "completed" ? "Completed" : "In progress"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Certification */}
            <div className="flex flex-col gap-6 rounded-lg border border-zinc-200 p-6">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-[#2b7fff]">
                    <FileCheck2 className="size-4 text-blue-50" />
                  </div>
                  <h2 className="text-sm font-semibold leading-5">Report Certification</h2>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium leading-4 text-emerald-700">
                  <ShieldCheck className="size-3" /> Verified
                </span>
              </div>
              <p className="text-sm leading-relaxed text-[#71717b]">
                This report has been automatically generated and validated against the QuizMind AI
                assessment records. The figures presented above reflect the final published results
                for this quiz as of the generation date.
              </p>
              <div className="grid grid-cols-3 gap-6">
                <CertCol label="Reviewed By" value="QuizMind AI" hint="Automated review" />
                <CertCol label="Date Issued" value={data.generatedDate} hint="Local time" />
                <CertCol
                  label="Signature"
                  value={<span className="text-lg font-[cursive] leading-6 text-[#2b7fff]">QuizMind</span>}
                  hint="Authorized"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-zinc-200 px-12 py-6 text-xs leading-4 text-[#71717b]">
            <div className="flex items-center gap-2">
              <Brain className="size-4 text-[#2b7fff]" />
              <span className="font-medium text-zinc-950">QuizMind AI</span>
            </div>
            <span>© {new Date().getFullYear()} QuizMind. All rights reserved. · Page 1 of 1</span>
          </div>
        </div>
      </div>
    );
  }
);

function SummaryCard({
  Icon,
  label,
  value,
  hint,
}: {
  Icon: typeof Users;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-zinc-200 p-4">
      <div className="flex items-center gap-2 text-[#71717b]">
        <Icon className="size-4 text-[#2b7fff]" />
        <span className="text-xs leading-4">{label}</span>
      </div>
      <span className="text-2xl font-bold leading-8">{value}</span>
      {hint && <span className="text-xs leading-4 text-[#71717b]">{hint}</span>}
    </div>
  );
}

function CertCol({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase leading-4 tracking-widest text-[#71717b]">{label}</span>
      <span className="text-sm font-medium leading-5">{value}</span>
      <span className="text-xs leading-4 text-[#71717b]">{hint}</span>
    </div>
  );
}
