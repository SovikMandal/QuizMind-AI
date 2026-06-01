import { RequestHandler } from "express";
import { prisma } from "../config/db";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

/**
 * Restricts a route to paid (pro/premium) users when AI_REQUIRE_PAID is enabled.
 * No-op while the flag is off, so the free-tier demo keeps working (US-25).
 */
export const requirePaidTier: RequestHandler = async (req, _res, next) => {
  if (!env.AI_REQUIRE_PAID) return next();
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { tier: true },
  });
  if (!user || user.tier === "free") {
    throw ApiError.forbidden("AI generation requires a Pro or Premium plan");
  }
  next();
};
