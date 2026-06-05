import { UserTier } from "@prisma/client";
import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { consumeDailyQuota, peekDailyQuota, type QuotaSnapshot } from "../../utils/dailyQuota";

/** Daily PDF export limit per tier. Centralised so the FE and BE can stay in sync. */
export const PDF_EXPORT_LIMITS: Record<UserTier, number> = {
  free: 1,
  pro: 10,
  premium: 20,
};

const NAMESPACE = "pdf-export";

export interface ExportQuota extends QuotaSnapshot {
  tier: UserTier;
}

async function loadTier(userId: string): Promise<UserTier> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { tier: true } });
  if (!user) throw ApiError.notFound("User not found");
  return user.tier;
}

/** Verify the user took or hosts the session before letting them export it. */
async function ensureAccess(sessionId: string, userId: string) {
  const session = await prisma.quizSession.findUnique({
    where: { id: sessionId },
    include: { quiz: { select: { creatorId: true } } },
  });
  if (!session) throw ApiError.notFound("Session not found");
  if (session.quiz.creatorId === userId) return;
  const participant = await prisma.participant.findFirst({ where: { sessionId, userId } });
  if (!participant) throw ApiError.forbidden("You did not take this quiz");
}

export const ExportService = {
  /** Read-only: how many exports the user has used today and how many remain. */
  async peek(userId: string): Promise<ExportQuota> {
    const tier = await loadTier(userId);
    const snapshot = await peekDailyQuota(NAMESPACE, userId, PDF_EXPORT_LIMITS[tier]);
    return { ...snapshot, tier };
  },

  /** Increment the counter, or throw 429 with the current quota in details. */
  async consume(sessionId: string, userId: string): Promise<ExportQuota> {
    await ensureAccess(sessionId, userId);
    const tier = await loadTier(userId);
    const limit = PDF_EXPORT_LIMITS[tier];
    const { allowed, snapshot } = await consumeDailyQuota(NAMESPACE, userId, limit);
    if (!allowed) {
      throw ApiError.tooManyRequests(
        `Daily export limit reached (${limit}/day on ${tier} plan). Resets at ${snapshot.resetAt}.`,
        { ...snapshot, tier }
      );
    }
    return { ...snapshot, tier };
  },
};
