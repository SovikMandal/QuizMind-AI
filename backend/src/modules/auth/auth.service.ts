import { prisma } from "../../config/db";
import { redis } from "../../config/redis";
import { randomUUID } from "crypto";
import { isProd } from "../../config/env";
import { hashPassword, verifyPassword } from "../../utils/password";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import { ApiError } from "../../utils/ApiError";
import { toPublicUser } from "../../utils/sanitizeUser";
import { RegisterInput, LoginInput } from "./auth.schemas";

const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const refreshKey = (userId: string, jti: string) => `refresh:${userId}:${jti}`;

async function issueTokens(userId: string) {
  const accessToken = signAccessToken(userId);
  const { token: refreshToken, jti } = signRefreshToken(userId);
  await redis.set(refreshKey(userId, jti), "1", "EX", REFRESH_TTL_SECONDS);
  return { accessToken, refreshToken };
}

export const AuthService = {
  async register(input: RegisterInput) {
    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        passwordHash,
        displayName: input.displayName ?? input.username,
      },
    });
    const tokens = await issueTokens(user.id);
    return { user: toPublicUser(user), ...tokens };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      throw ApiError.unauthorized("Invalid email or password");
    }
    const tokens = await issueTokens(user.id);
    return { user: toPublicUser(user), ...tokens };
  },

  async refresh(refreshToken: string | undefined) {
    if (!refreshToken) throw ApiError.unauthorized("No refresh token");

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized("Invalid refresh token");
    }

    const key = refreshKey(payload.sub, payload.jti);
    const exists = await redis.get(key);
    if (!exists) throw ApiError.unauthorized("Refresh token revoked");

    // Rotate: invalidate the old token, issue a fresh pair.
    await redis.del(key);
    return issueTokens(payload.sub);
  },

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) return;
    try {
      const payload = verifyRefreshToken(refreshToken);
      await redis.del(refreshKey(payload.sub, payload.jti));
    } catch {
      // ignore — logout is idempotent
    }
  },

  /**
   * Issues a single-use password reset token (15 min, stored in Redis).
   * Returns the token only outside production (no email provider wired up).
   */
  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { devToken: undefined }; // don't reveal whether the email exists
    const token = randomUUID();
    await redis.set(`reset:${token}`, user.id, "EX", 15 * 60);
    return { devToken: isProd ? undefined : token };
  },

  async resetPassword(token: string, password: string) {
    const key = `reset:${token}`;
    const userId = await redis.get(key);
    if (!userId) throw ApiError.badRequest("Invalid or expired reset token");
    const passwordHash = await hashPassword(password);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    await redis.del(key);
  },
};
