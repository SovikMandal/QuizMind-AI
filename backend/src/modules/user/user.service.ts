import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { toPublicUser } from "../../utils/sanitizeUser";
import { UpdateProfileInput, UpdateGoalsInput, goalTypes } from "./user.schemas";

type GoalType = (typeof goalTypes)[number];
interface UserGoal {
  type: GoalType;
  label: string;
  target: number;
}

/** Defaults applied when the user hasn't customised their goals yet. */
const DEFAULT_GOALS: UserGoal[] = [
  { type: "createdQuizzes", label: "Create 12 quizzes", target: 12 },
  { type: "joinedQuizzes", label: "Join 30 quizzes", target: 30 },
  { type: "dayStreak", label: "20-day streak", target: 20 },
];

/** Best-effort coercion of the JSON field into a typed goals array. */
function readGoals(raw: unknown): UserGoal[] {
  if (!Array.isArray(raw)) return DEFAULT_GOALS;
  const seen = new Set<GoalType>();
  const out: UserGoal[] = [];
  for (const item of raw) {
    if (
      item &&
      typeof item === "object" &&
      typeof (item as { type?: unknown }).type === "string" &&
      typeof (item as { label?: unknown }).label === "string" &&
      typeof (item as { target?: unknown }).target === "number"
    ) {
      const t = (item as { type: string }).type as GoalType;
      if ((goalTypes as readonly string[]).includes(t) && !seen.has(t)) {
        out.push({
          type: t,
          label: (item as { label: string }).label,
          target: (item as { target: number }).target,
        });
        seen.add(t);
      }
    }
  }
  // Fill missing types with their defaults so the dashboard always renders 3 goals.
  for (const def of DEFAULT_GOALS) {
    if (!seen.has(def.type)) out.push(def);
  }
  return out;
}

export const UserService = {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound("User not found");
    return toPublicUser(user);
  },

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const user = await prisma.user.update({ where: { id: userId }, data });
    return toPublicUser(user);
  },

  async getStats(userId: string) {
    const [quizzesCreated, attempts, hostedSessions] = await Promise.all([
      prisma.quiz.count({ where: { creatorId: userId } }),
      prisma.participant.findMany({
        where: { userId },
        select: { score: true },
      }),
      prisma.quizSession.findMany({
        where: { hostId: userId },
        select: { _count: { select: { participants: true } } },
      }),
    ]);

    const totalAttempts = attempts.length;
    const avgScore =
      totalAttempts === 0
        ? 0
        : Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts);
    const studentsReached = hostedSessions.reduce(
      (sum, s) => sum + s._count.participants,
      0
    );

    return { quizzesCreated, totalAttempts, avgScore, studentsReached };
  },

  async getDashboard(userId: string) {
    const now = new Date();
    const [user, quizzes, parts] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { goals: true } }),
      prisma.quiz.findMany({ where: { creatorId: userId }, select: { subject: true, createdAt: true } }),
      prisma.participant.findMany({
        where: { userId },
        select: {
          score: true,
          joinedAt: true,
          session: { select: { quiz: { select: { subject: true, totalPoints: true } } } },
        },
      }),
    ]);
    if (!user) throw ApiError.notFound("User not found");

    const created = quizzes.length;
    const joined = parts.length;

    // Average score as a percentage of each quiz's total points.
    const scored = parts.filter((p) => (p.session.quiz.totalPoints ?? 0) > 0);
    const avgScore = scored.length
      ? Math.round(scored.reduce((s, p) => s + (p.score / p.session.quiz.totalPoints) * 100, 0) / scored.length)
      : 0;

    // Day streak: consecutive days (ending today or yesterday) with activity.
    const days = new Set(parts.map((p) => new Date(p.joinedAt).toDateString()));
    let dayStreak = 0;
    const cursor = new Date(now);
    if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
    while (days.has(cursor.toDateString())) {
      dayStreak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    // Activity over the last 6 months.
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, month: d.toLocaleString("en-US", { month: "short" }), created: 0, joined: 0 };
    });
    const mIdx = new Map(months.map((m, i) => [m.key, i]));
    const bucket = (date: Date) => mIdx.get(`${date.getFullYear()}-${date.getMonth()}`);
    for (const q of quizzes) {
      const i = bucket(new Date(q.createdAt));
      if (i !== undefined) months[i].created++;
    }
    for (const p of parts) {
      const i = bucket(new Date(p.joinedAt));
      if (i !== undefined) months[i].joined++;
    }
    const activity = months.map(({ month, created, joined }) => ({ month, created, joined }));

    // Category breakdown by subject (from quizzes joined).
    const palette = ["#ea580c", "#0d9488", "#1e3a8a", "#eab308", "#9333ea", "#dc2626"];
    const byCat = new Map<string, number>();
    for (const p of parts) {
      const s = p.session.quiz.subject ?? "General";
      byCat.set(s, (byCat.get(s) ?? 0) + 1);
    }
    const totalCat = joined || 1;
    const categories = [...byCat.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count], i) => ({ name, value: Math.round((count / totalCat) * 100), fill: palette[i % palette.length] }));

    // This-month / previous-month counts for goals + trends.
    const inMonth = (date: Date, offset: number) => {
      const m = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      return date.getFullYear() === m.getFullYear() && date.getMonth() === m.getMonth();
    };
    const createdThisMonth = quizzes.filter((q) => inMonth(new Date(q.createdAt), 0)).length;
    const joinedThisMonth = parts.filter((p) => inMonth(new Date(p.joinedAt), 0)).length;
    const createdPrev = quizzes.filter((q) => inMonth(new Date(q.createdAt), 1)).length;
    const joinedPrev = parts.filter((p) => inMonth(new Date(p.joinedAt), 1)).length;
    const pct = (cur: number, prev: number) =>
      prev === 0 ? (cur > 0 ? "+100%" : "0%") : `${cur - prev >= 0 ? "+" : ""}${Math.round(((cur - prev) / prev) * 100)}%`;

    const goalSignals: Record<GoalType, number> = {
      createdQuizzes: createdThisMonth,
      joinedQuizzes: joinedThisMonth,
      dayStreak,
    };
    const userGoals = readGoals(user.goals);
    const goals = userGoals.map((g) => {
      const cur = goalSignals[g.type];
      return {
        type: g.type,
        label: g.label,
        target: g.target,
        text: `${cur}/${g.target}`,
        value: Math.min(100, Math.round((cur / Math.max(1, g.target)) * 100)),
      };
    });

    return {
      stats: { created, joined, avgScore, dayStreak },
      trends: { created: pct(createdThisMonth, createdPrev), joined: pct(joinedThisMonth, joinedPrev) },
      activity,
      categories,
      goals,
    };
  },

  /** Read the user's customisable goals, falling back to defaults if unset. */
  async getGoals(userId: string): Promise<UserGoal[]> {
    const u = await prisma.user.findUnique({ where: { id: userId }, select: { goals: true } });
    if (!u) throw ApiError.notFound("User not found");
    return readGoals(u.goals);
  },

  /** Replace the user's goals. Missing types are filled with defaults on read. */
  async updateGoals(userId: string, input: UpdateGoalsInput): Promise<UserGoal[]> {
    await prisma.user.update({
      where: { id: userId },
      data: { goals: input.goals },
    });
    return readGoals(input.goals);
  },
};
