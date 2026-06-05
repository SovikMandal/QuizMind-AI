import type { ReportData } from "./AnalyticsReport";
import type { AnalyticsData } from "./types";
import { fmtTime, pctOf } from "./format";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

/** Adapts the live analytics payload into the shape the report layout expects. */
export function buildReportData(d: AnalyticsData, sessionId: string, passRate: number): ReportData {
  const hardest = [...d.questions].sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);
  return {
    reportId: `QM-${new Date().getFullYear()}-${sessionId.slice(0, 6).toUpperCase()}`,
    generatedDate: formatDate(new Date().toISOString()),
    preparedFor: "Quiz host",
    title: d.quiz.title,
    subject: d.quiz.subject ?? "General",
    status: d.quiz.status,
    questionCount: d.quiz.questionCount,
    createdDate: formatDate(d.quiz.createdAt),
    metrics: {
      students: d.metrics.totalStudents,
      avgScorePct: d.metrics.avgScorePct,
      completionRate: d.metrics.completionRate,
      avgTimeText: fmtTime(d.metrics.avgTimeSecs),
    },
    passRate,
    scoreDistribution: d.scoreDistribution,
    hardest,
    leaderboard: d.leaderboard
      // Only completed attempts belong on the printed leaderboard — in-progress
      // entries have no final score or rank yet.
      .filter((e) => e.status === "completed")
      .map((e) => ({
        rank: e.rank,
        participantId: e.participantId,
        username: e.username,
        score: e.score,
        scorePct: pctOf(e.score, d.quiz.totalPoints),
        timeText: fmtTime(e.timeSecs),
        status: e.status,
      })),
  };
}
