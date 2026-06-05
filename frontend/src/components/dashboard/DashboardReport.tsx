import { forwardRef, type ReactNode } from "react";
import {
  Brain,
  CheckCircle2,
  Network,
  TrendingUp,
  Users,
  Target,
  Flame,
  Calendar,
  User as UserIcon,
  LayoutGrid,
  Atom,
  Landmark,
  Code2,
  Sigma,
  Folder,
  HelpCircle,
  Trophy,
  FileCheck2,
  ShieldCheck,
  Clock,
  CheckCircle,
  type LucideIcon,
} from "lucide-react";

export interface DashboardReportQuiz {
  type: "Created" | "Joined";
  title: string;
  subject: string;
  date: string; // formatted like "Jun 18"
  questionCount: number;
  totalStudents: number;
  avgScorePct: number;
  completionPct: number;
  avgTimeText: string;
  topStudent: { name: string; pct: number } | null;
}

export interface DashboardReportData {
  reportId: string;
  generatedDate: string; // "Jun 18, 2025"
  preparedFor: string;
  dateRangeText: string; // "Jun 12 – Jun 18, 2025"
  totalQuizzes: number;
  stats: {
    created: number;
    createdTrend?: string;
    joined: number;
    joinedTrend?: string;
    avgScorePct: number;
    avgScoreTrend?: string;
    dayStreak: number;
    dayStreakTrend?: string;
  };
  quizzes: DashboardReportQuiz[];
  overall: {
    totalStudents: number;
    avgScorePct: number;
    completionPct: number;
    avgTimeText: string;
  };
}

/** Map a free-text subject to a representative lucide icon. */
function subjectIcon(subject: string): LucideIcon {
  const s = (subject ?? "").toLowerCase();
  if (s.includes("hist")) return Landmark;
  if (s.includes("cod") || s.includes("prog") || s.includes("script") || s.includes("dev"))
    return Code2;
  if (s.includes("math") || s.includes("alge") || s.includes("calc") || s.includes("geom"))
    return Sigma;
  // Default to a science-style icon — also covers biology, physics, chemistry, etc.
  return Atom;
}

/**
 * Off-screen "Recent Quizzes Summary" report rendered to the PDF. Mirrors
 * the AnalyticsReport pattern: pure layout, fixed 816px width (≈ Letter @
 * 96dpi), all geometry in absolute units so the rasterized capture is
 * deterministic.
 */
export const DashboardReport = forwardRef<HTMLDivElement, { data: DashboardReportData }>(
  function DashboardReport({ data }, ref) {
    return (
      <div ref={ref} className="bg-white text-zinc-950" style={{ width: 816 }}>
        {/* Header */}
        <div className="bg-[#2b7fff] p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-white/20">
                <Brain className="size-5 text-white" />
              </div>
              <span className="text-lg font-bold leading-7 text-white">QuizMind AI</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5">
                <CheckCircle2 className="size-3 text-white" />
                <span className="text-xs leading-4 text-white">Published</span>
              </div>
              <span className="text-xs leading-4 text-white/80">
                Generated {data.generatedDate}
              </span>
              <span className="text-xs leading-4 text-white/80">
                Report ID #{data.reportId}
              </span>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-xs uppercase leading-4 tracking-widest text-white/80">
              Recent Quizzes Detail Report
            </p>
            <h1 className="mt-1 text-3xl font-bold leading-9 text-white">Recent Quizzes Summary</h1>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-8 p-8">
          {/* Top stat cards */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              Icon={Network}
              label="Quizzes Created"
              value={String(data.stats.created)}
              trend={data.stats.createdTrend}
            />
            <StatCard
              Icon={Users}
              label="Quizzes Joined"
              value={String(data.stats.joined)}
              trend={data.stats.joinedTrend}
            />
            <StatCard
              Icon={Target}
              label="Avg. Score"
              value={`${data.stats.avgScorePct}%`}
              trend={data.stats.avgScoreTrend}
            />
            <StatCard
              Icon={Flame}
              label="Day Streak"
              value={String(data.stats.dayStreak)}
              trend={data.stats.dayStreakTrend}
            />
          </div>

          {/* Date range bar */}
          <div className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3">
            <div className="flex items-center gap-2 text-sm leading-5 text-zinc-700">
              <Calendar className="size-4 text-zinc-500" />
              <span>Date Range: {data.dateRangeText}</span>
            </div>
            <div className="flex items-center gap-2 text-sm leading-5 text-zinc-700">
              <UserIcon className="size-4 text-zinc-500" />
              <span>Prepared for {data.preparedFor}</span>
            </div>
            <div className="flex items-center gap-2 text-sm leading-5 text-zinc-700">
              <LayoutGrid className="size-4 text-zinc-500" />
              <span>{data.totalQuizzes} Quizzes Total</span>
            </div>
          </div>

          {/* Quiz cards overview */}
          <div className="flex flex-col gap-4">
            <p className="text-xs uppercase leading-4 tracking-widest text-zinc-500">
              Quiz Cards Overview
            </p>
            {data.quizzes.length === 0 ? (
              <div className="rounded-lg border border-zinc-200 px-4 py-6 text-center text-sm text-zinc-500">
                No recent quiz activity to summarise yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {data.quizzes.map((q, i) => (
                  <QuizCard key={`${q.title}-${i}`} q={q} />
                ))}
              </div>
            )}
          </div>

          {/* Overall summary */}
          <div className="flex flex-col gap-4">
            <p className="text-xs uppercase leading-4 tracking-widest text-zinc-500">
              Overall Performance Summary
            </p>
            <div className="grid grid-cols-4 gap-4">
              <SummaryCell
                Icon={Users}
                iconClass="text-[#2b7fff]"
                label="Total Students"
                value={data.overall.totalStudents.toLocaleString()}
              />
              <SummaryCell
                Icon={Target}
                iconClass="text-[#2b7fff]"
                label="Overall Avg. Score"
                value={`${data.overall.avgScorePct}%`}
              />
              <SummaryCell
                Icon={CheckCircle}
                iconClass="text-emerald-600"
                label="Avg. Completion Rate"
                value={`${data.overall.completionPct}%`}
              />
              <SummaryCell
                Icon={Clock}
                iconClass="text-zinc-500"
                label="Avg. Time Taken"
                value={data.overall.avgTimeText}
              />
            </div>
          </div>

          {/* Certification */}
          <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-[#2b7fff]/10">
                  <FileCheck2 className="size-5 text-[#2b7fff]" />
                </div>
                <span className="font-bold text-zinc-950">Report Certification</span>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5">
                <ShieldCheck className="size-3 text-emerald-600" />
                <span className="text-xs leading-4 text-emerald-600">Verified</span>
              </div>
            </div>
            <div className="h-px bg-zinc-100" />
            <p className="text-sm leading-relaxed text-zinc-500">
              This report has been automatically generated and validated against the QuizMind AI
              assessment records. The figures presented above reflect the final published results
              for these quizzes as of the generation date.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <CertCol label="Reviewed By" value="QuizMind AI" hint="Automated review" />
              <CertCol label="Date Issued" value={data.generatedDate} hint="Local time" />
              <CertCol
                label="Signature"
                value={
                  <span className="text-lg font-medium italic leading-7 text-[#2b7fff]">
                    QuizMind
                  </span>
                }
                hint="Authorized"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
            <div className="flex items-center gap-2">
              <Brain className="size-4 text-[#2b7fff]" />
              <span className="text-sm font-medium leading-5 text-zinc-700">QuizMind AI</span>
            </div>
            <span className="text-xs leading-4 text-zinc-400">
              © {new Date().getFullYear()} QuizMind. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    );
  }
);

function StatCard({
  Icon,
  label,
  value,
  trend,
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
  trend?: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100">
          <Icon className="size-5 text-[#2b7fff]" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5">
            <TrendingUp className="size-3 text-emerald-600" />
            <span className="text-xs leading-4 text-emerald-600">{trend}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-3xl font-bold leading-9 text-zinc-950">{value}</span>
        <span className="text-sm leading-5 text-zinc-500">{label}</span>
      </div>
    </div>
  );
}

function QuizCard({ q }: { q: DashboardReportQuiz }) {
  const Icon = subjectIcon(q.subject);
  const isCreated = q.type === "Created";
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex size-9 items-center justify-center rounded-lg ${
              isCreated ? "bg-[#2b7fff]/10" : "bg-amber-100"
            }`}
          >
            <Icon className={`size-5 ${isCreated ? "text-[#2b7fff]" : "text-amber-600"}`} />
          </div>
          <span className="truncate text-sm font-bold leading-5 text-zinc-950">{q.title}</span>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs leading-4 ${
            isCreated ? "bg-[#2b7fff]/10 text-[#2b7fff]" : "bg-zinc-100 text-zinc-600"
          }`}
        >
          {q.type}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs leading-4 text-zinc-500">
        <span className="flex items-center gap-1">
          <Folder className="size-3" />
          {q.subject}
        </span>
        <span className="flex items-center gap-1">
          <HelpCircle className="size-3" />
          {q.questionCount}Q
        </span>
        <span className="flex items-center gap-1">
          <Users className="size-3" />
          {q.totalStudents}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="size-3" />
          {q.date}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500">Avg. Score</span>
          <span className="text-sm font-bold leading-5 text-[#2b7fff]">{q.avgScorePct}%</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500">Completion Rate</span>
          <span className="text-sm font-bold leading-5 text-emerald-600">{q.completionPct}%</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500">Avg. Time</span>
          <span className="text-sm font-bold leading-5 text-zinc-700">{q.avgTimeText}</span>
        </div>
      </div>

      <div className="h-px bg-zinc-100" />

      <div className="flex items-center gap-2">
        <Trophy className="size-4 text-amber-500" />
        <span className="text-xs leading-4 text-zinc-600">
          Top Student:{" "}
          {q.topStudent ? (
            <>
              <span className="font-medium text-zinc-900">{q.topStudent.name}</span>
              {" · "}
              {q.topStudent.pct}%
            </>
          ) : (
            <span className="text-zinc-400">No completions yet</span>
          )}
        </span>
      </div>
    </div>
  );
}

function SummaryCell({
  Icon,
  iconClass,
  label,
  value,
}: {
  Icon: LucideIcon;
  iconClass: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4">
      <div className="flex items-center gap-2 text-xs leading-4 text-zinc-500">
        <Icon className={`size-4 ${iconClass}`} />
        {label}
      </div>
      <span className="text-2xl font-bold leading-8 text-zinc-950">{value}</span>
    </div>
  );
}

function CertCol({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-zinc-400">{label}</span>
      <span className="text-sm font-medium leading-5 text-zinc-900">{value}</span>
      <span className="text-xs leading-4 text-zinc-500">{hint}</span>
    </div>
  );
}
