"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePaidTier = void 0;
const db_1 = require("../config/db");
const env_1 = require("../config/env");
const ApiError_1 = require("../utils/ApiError");
/**
 * Restricts a route to paid (pro/premium) users when AI_REQUIRE_PAID is enabled.
 * No-op while the flag is off, so the free-tier demo keeps working (US-25).
 */
const requirePaidTier = async (req, _res, next) => {
    if (!env_1.env.AI_REQUIRE_PAID)
        return next();
    const user = await db_1.prisma.user.findUnique({
        where: { id: req.user.id },
        select: { tier: true },
    });
    if (!user || user.tier === "free") {
        throw ApiError_1.ApiError.forbidden("AI generation requires a Pro or Premium plan");
    }
    next();
};
exports.requirePaidTier = requirePaidTier;
//# sourceMappingURL=tier.middleware.js.map