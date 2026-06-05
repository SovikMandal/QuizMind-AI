import { fmtTime } from "../analytics/format";
import type { DashboardReportData, DashboardReportQuiz } from "./DashboardReport";

/** Subset of /sessions/:id/analytics we actually need for a quiz card. */
export interface QuizAnalyticsLite {
  quiz: { totalPoints: number; questionCount: number };
  metrics: {
    totalStudents: number;
    avgScorePct: number;
    completionRate: number;
    avgTimeSecs: number;
  };
  leaderboard: { username: string; score: number; status: string }[];
}

interface RecentQuiz {
  sessionId: string;
  title: string;
  subject: string | null;
  joinedAt: string;
  /** Whether the user authored the quiz. */
  isOwn: boolean;
}

interface BuildArgs {
  /** Display name (or username) for the "Prepared for" line. */
  preparedFor: string;
  /** Top-line dashboard stats from /users/me/dashboard. */
  stats: { created: number; joined: number; avgScore: number; dayStreak: number };
  /** Optional trend strings ("+8%", "+24%") from /users/me/dashboard. */
  trends: { created?: string; joined?: string };
  /** Top recent quizzes (already trimmed to 4) with their fetched analytics. */
  recents: { quiz: RecentQuiz; analytics: QuizAnalyticsLite | null }[];
}

const monthDay = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

const monthDayYear = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

/** Builds the report ID like `QM-2026-RQ7B` — short, URL-safe-ish. */
function makeReportId() {
  const year = new Date().getFullYear();
  const tag = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `QM-${year}-RQ${tag}`;
}

/**
 * Adapts dashboard data + a batch of per-session analytics into the shape the
 * `DashboardReport` layout expects. Falls back gracefully when a session's
 * analytics couldn't be fetched (e.g. permission denied or the request
 * failed) so the report still renders with whatever data is available.
 */
export function buildDashboardReport(args: BuildArgs): DashboardReportData {
  const { preparedFor, stats, trends, recents } = args;

  // Per-quiz cards.
  const quizzes: DashboardReportQuiz[] = recents.map(({ quiz, analytics }) => {
    if (!analytics) {
      // No analytics for this session — show the card with placeholders for
      // the aggregate fields rather than dropping it.
      return {
        type: quiz.isOwn ? "Created" : "Joined",
        title: quiz.title,
        subject: quiz.subject ?? "General",
        date: monthDay(quiz.joinedAt),
        questionCount: 0,
        totalStudents: 0,
        avgScorePct: 0,
        completionPct: 0,
        avgTimeText: "—",
        topStudent: null,
      };
    }
    const top = analytics.leaderboard.find((e) => e.status === "completed") ?? null;
    const total = analytics.quiz.totalPoints || 1;
    return {
      type: quiz.isOwn ? "Created" : "Joined",
      title: quiz.title,
      subject: quiz.subject ?? "General",
      date: monthDay(quiz.joinedAt),
      questionCount: analytics.quiz.questionCount,
      totalStudents: analytics.metrics.totalStudents,
      avgScorePct: analytics.metrics.avgScorePct,
      completionPct: analytics.metrics.completionRate,
      avgTimeText: fmtTime(analytics.metrics.avgTimeSecs),
      topStudent: top ? { name: top.username, pct: Math.round((top.score / total) * 100) } : null,
    };
  });

  // Overall summary aggregated across the analytics we successfully fetched.
  const withAnalytics = recents
    .map((r) => r.analytics)
    .filter((a): a is QuizAnalyticsLite => a !== null);
  const totalStudents = withAnalytics.reduce((s, a) => s + a.metrics.totalStudents, 0);
  const avgScorePct = withAnalytics.length
    ? Math.round(
        withAnalytics.reduce((s, a) => s + a.metrics.avgScorePct, 0) / withAnalytics.length
      )
    : 0;
  const completionPct = withAnalytics.length
    ? Math.round(
        withAnalytics.reduce((s, a) => s + a.metrics.completionRate, 0) / withAnalytics.length
      )
    : 0;
  const avgTimeSecs = withAnalytics.length
    ? Math.round(
        withAnalytics.reduce((s, a) => s + a.metrics.avgTimeSecs, 0) / withAnalytics.length
      )
    : 0;

  // Date range = oldest to newest joinedAt of the cards shown, or today if empty.
  const dates = recents.map((r) => new Date(r.quiz.joinedAt).getTime()).sort((a, b) => a - b);
  const dateRangeText =
    dates.length === 0
      ? monthDayYear(new Date().toISOString())
      : `${monthDay(new Date(dates[0]).toISOString())} – ${monthDayYear(
          new Date(dates[dates.length - 1]).toISOString()
        )}`;

  return {
    reportId: makeReportId(),
    generatedDate: monthDayYear(new Date().toISOString()),
    preparedFor,
    dateRangeText,
    totalQuizzes: recents.length,
    stats: {
      created: stats.created,
      createdTrend: trends.created,
      joined: stats.joined,
      joinedTrend: trends.joined,
      avgScorePct: stats.avgScore,
      dayStreak: stats.dayStreak,
    },
    quizzes,
    overall: {
      totalStudents,
      avgScorePct,
      completionPct,
      avgTimeText: fmtTime(avgTimeSecs),
    },
  };
}
