"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const db_1 = require("../../config/db");
const redis_1 = require("../../config/redis");
const crypto_1 = require("crypto");
const env_1 = require("../../config/env");
const mailer_1 = require("../../utils/mailer");
const emailTemplates_1 = require("../../utils/emailTemplates");
const logger_1 = require("../../utils/logger");
const password_1 = require("../../utils/password");
const jwt_1 = require("../../utils/jwt");
const ApiError_1 = require("../../utils/ApiError");
const sanitizeUser_1 = require("../../utils/sanitizeUser");
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const refreshKey = (userId, jti) => `refresh:${userId}:${jti}`;
const pendingKey = (email) => `pendingreg:${email.toLowerCase()}`;
const newCode = () => String(Math.floor(100000 + Math.random() * 900000));
function emailCode(email, code, name) {
    // Fire and forget - don't block the response
    (0, mailer_1.sendMail)(email, "Verify your QuizMind email", (0, emailTemplates_1.otpEmailTemplate)(name, code)).catch((err) => logger_1.logger.error(`Failed to send verification email: ${err}`));
    if (!env_1.isProd)
        logger_1.logger.info(`Email verification code for ${email}: ${code}`);
}
async function issueTokens(userId) {
    const accessToken = (0, jwt_1.signAccessToken)(userId);
    const { token: refreshToken, jti } = (0, jwt_1.signRefreshToken)(userId);
    await redis_1.redis.set(refreshKey(userId, jti), "1", "EX", REFRESH_TTL_SECONDS);
    return { accessToken, refreshToken };
}
exports.AuthService = {
    async register(input) {
        const existing = await db_1.prisma.user.findFirst({
            where: { OR: [{ email: input.email }, { username: input.username }] },
        });
        if (existing) {
            throw ApiError_1.ApiError.conflict(existing.email === input.email ? "Email already registered" : "Username already taken");
        }
        const passwordHash = await (0, password_1.hashPassword)(input.password);
        const code = newCode();
        const pending = {
            email: input.email,
            username: input.username,
            passwordHash,
            displayName: input.displayName ?? input.username,
            code,
        };
        await redis_1.redis.set(pendingKey(input.email), JSON.stringify(pending), "EX", 15 * 60);
        emailCode(input.email, code, pending.displayName); // Don't await
        // devCode is returned only outside production so the flow is testable without email.
        return { email: input.email, devCode: env_1.isProd ? undefined : code };
    },
    /** Verifies the code, then actually creates the user and logs them in. */
    async verifyRegistration(email, code) {
        const raw = await redis_1.redis.get(pendingKey(email));
        if (!raw)
            throw ApiError_1.ApiError.badRequest("Registration expired — please sign up again");
        const pending = JSON.parse(raw);
        if (pending.code !== code)
            throw ApiError_1.ApiError.badRequest("Invalid or expired code");
        const user = await db_1.prisma.user.create({
            data: {
                email: pending.email,
                username: pending.username,
                passwordHash: pending.passwordHash,
                displayName: pending.displayName,
                emailVerified: true,
            },
        });
        await redis_1.redis.del(pendingKey(email));
        (0, mailer_1.sendMail)(user.email, "Welcome to QuizMind AI 🎉", (0, emailTemplates_1.welcomeEmailTemplate)(user.displayName ?? user.username)).catch((err) => logger_1.logger.error(`Failed to send welcome email: ${err}`));
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
        await redis_1.redis.set(`reset:${token}`, user.id, "EX", 30 * 60);
        const link = `${env_1.env.FRONTEND_URL}/forgot-password?token=${token}`;
        (0, mailer_1.sendMail)(user.email, "Reset your QuizMind password", (0, emailTemplates_1.forgotPasswordEmailTemplate)(user.displayName ?? user.username, link)).catch((err) => logger_1.logger.error(`Failed to send password reset email: ${err}`));
        // Returned only outside production as a fallback when email isn't configured.
        return { devToken: env_1.isProd || mailer_1.isMailConfigured ? undefined : token };
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
    async resendVerification(email) {
        const raw = await redis_1.redis.get(pendingKey(email));
        if (!raw)
            return;
        const pending = JSON.parse(raw);
        pending.code = newCode();
        await redis_1.redis.set(pendingKey(email), JSON.stringify(pending), "EX", 15 * 60);
        emailCode(email, pending.code, pending.displayName); // Don't await
    },
};
//# sourceMappingURL=auth.service.js.map