"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const db_1 = require("../../config/db");
const redis_1 = require("../../config/redis");
const crypto_1 = require("crypto");
const env_1 = require("../../config/env");
const password_1 = require("../../utils/password");
const jwt_1 = require("../../utils/jwt");
const ApiError_1 = require("../../utils/ApiError");
const sanitizeUser_1 = require("../../utils/sanitizeUser");
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const refreshKey = (userId, jti) => `refresh:${userId}:${jti}`;
async function issueTokens(userId) {
    const accessToken = (0, jwt_1.signAccessToken)(userId);
    const { token: refreshToken, jti } = (0, jwt_1.signRefreshToken)(userId);
    await redis_1.redis.set(refreshKey(userId, jti), "1", "EX", REFRESH_TTL_SECONDS);
    return { accessToken, refreshToken };
}
exports.AuthService = {
    async register(input) {
        const passwordHash = await (0, password_1.hashPassword)(input.password);
        const user = await db_1.prisma.user.create({
            data: {
                email: input.email,
                username: input.username,
                passwordHash,
                displayName: input.displayName ?? input.username,
            },
        });
        const tokens = await issueTokens(user.id);
        return { user: (0, sanitizeUser_1.toPublicUser)(user), ...tokens };
    },
    async login(input) {
        const user = await db_1.prisma.user.findUnique({ where: { email: input.email } });
        if (!user || !(await (0, password_1.verifyPassword)(input.password, user.passwordHash))) {
            throw ApiError_1.ApiError.unauthorized("Invalid email or password");
        }
        const tokens = await issueTokens(user.id);
        return { user: (0, sanitizeUser_1.toPublicUser)(user), ...tokens };
    },
    async refresh(refreshToken) {
        if (!refreshToken)
            throw ApiError_1.ApiError.unauthorized("No refresh token");
        let payload;
        try {
            payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        }
        catch {
            throw ApiError_1.ApiError.unauthorized("Invalid refresh token");
        }
        const key = refreshKey(payload.sub, payload.jti);
        const exists = await redis_1.redis.get(key);
        if (!exists)
            throw ApiError_1.ApiError.unauthorized("Refresh token revoked");
        // Rotate: invalidate the old token, issue a fresh pair.
        await redis_1.redis.del(key);
        return issueTokens(payload.sub);
    },
    async logout(refreshToken) {
        if (!refreshToken)
            return;
        try {
            const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
            await redis_1.redis.del(refreshKey(payload.sub, payload.jti));
        }
        catch {
            // ignore — logout is idempotent
        }
    },
    /**
     * Issues a single-use password reset token (15 min, stored in Redis).
     * Returns the token only outside production (no email provider wired up).
     */
    async requestPasswordReset(email) {
        const user = await db_1.prisma.user.findUnique({ where: { email } });
        if (!user)
            return { devToken: undefined }; // don't reveal whether the email exists
        const token = (0, crypto_1.randomUUID)();
        await redis_1.redis.set(`reset:${token}`, user.id, "EX", 15 * 60);
        return { devToken: env_1.isProd ? undefined : token };
    },
    async resetPassword(token, password) {
        const key = `reset:${token}`;
        const userId = await redis_1.redis.get(key);
        if (!userId)
            throw ApiError_1.ApiError.badRequest("Invalid or expired reset token");
        const passwordHash = await (0, password_1.hashPassword)(password);
        await db_1.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
        await redis_1.redis.del(key);
    },
};
//# sourceMappingURL=auth.service.js.map