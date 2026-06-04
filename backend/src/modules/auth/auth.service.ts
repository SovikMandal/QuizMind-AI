import { prisma } from "../../config/db";
import { redis } from "../../config/redis";
import { randomUUID } from "crypto";
import { env, isProd } from "../../config/env";
import { sendMail, isMailConfigured } from "../../utils/mailer";
import { otpEmailTemplate, forgotPasswordEmailTemplate, welcomeEmailTemplate } from "../../utils/emailTemplates";
import { logger } from "../../utils/logger";
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
const pendingKey = (email: string) => `pendingreg:${email.toLowerCase()}`;

interface PendingReg {
  email: string;
  username: string;
  passwordHash: string;
  displayName: string;
  code: string;
}

const newCode = () => String(Math.floor(100000 + Math.random() * 900000));

async function emailCode(email: string, code: string, name: string) {
  await sendMail(email, "Verify your QuizMind email", otpEmailTemplate(name, code));
  if (!isProd) logger.info(`Email verification code for ${email}: ${code}`);
}

async function issueTokens(userId: string) {
  const accessToken = signAccessToken(userId);
  const { token: refreshToken, jti } = signRefreshToken(userId);
  await redis.set(refreshKey(userId, jti), "1", "EX", REFRESH_TTL_SECONDS);
  return { accessToken, refreshToken };
}

export const AuthService = {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: input.email }, { username: input.username }] },
    });
    if (existing) {
      throw ApiError.conflict(existing.email === input.email ? "Email already registered" : "Username already taken");
    }
    const passwordHash = await hashPassword(input.password);
    const code = newCode();
    const pending: PendingReg = {
      email: input.email,
      username: input.username,
      passwordHash,
      displayName: input.displayName ?? input.username,
      code,
    };
    await redis.set(pendingKey(input.email), JSON.stringify(pending), "EX", 15 * 60);
    
    // Do not await the email to avoid blocking the registration request.
    // If the email fails, it fails silently in the background, but the user is created.
    emailCode(input.email, code, pending.displayName).catch(err => {
      logger.error(`Background email send failed: ${err.message}`);
    });

    // devCode is returned only outside production so the flow is testable without email.
    return { email: input.email, devCode: isProd ? undefined : code };
  },

  /** Verifies the code, then actually creates the user and logs them in. */
  async verifyRegistration(email: string, code: string) {
    const raw = await redis.get(pendingKey(email));
    if (!raw) throw ApiError.badRequest("Registration expired — please sign up again");
    const pending = JSON.parse(raw) as PendingReg;
    if (pending.code !== code) throw ApiError.badRequest("Invalid or expired code");

    const user = await prisma.user.create({
      data: {
        email: pending.email,
        username: pending.username,
        passwordHash: pending.passwordHash,
        displayName: pending.displayName,
        emailVerified: true,
      },
    });
    await redis.del(pendingKey(email));

    // Do not await welcome email
    sendMail(user.email, "Welcome to QuizMind AI 🎉", welcomeEmailTemplate(user.displayName ?? user.username)).catch(err => {
      logger.error(`Welcome email failed: ${err.message}`);
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
    await redis.set(`reset:${token}`, user.id, "EX", 30 * 60);

    const link = `${env.FRONTEND_URL}/forgot-password?token=${token}`;
    
    // Do not await forgot password email
    sendMail(
      user.email,
      "Reset your QuizMind password",
      forgotPasswordEmailTemplate(user.displayName ?? user.username, link)
    ).catch(err => {
      logger.error(`Forgot password email failed: ${err.message}`);
    });

    // Returned only outside production as a fallback when email isn't configured.
    return { devToken: isProd || isMailConfigured ? undefined : token };
  },

  async resetPassword(token: string, password: string) {
    const key = `reset:${token}`;
    const userId = await redis.get(key);
    if (!userId) throw ApiError.badRequest("Invalid or expired reset token");
    const passwordHash = await hashPassword(password);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    await redis.del(key);
  },

  async resendVerification(email: string) {
    const raw = await redis.get(pendingKey(email));
    if (!raw) return;
    const pending = JSON.parse(raw) as PendingReg;
    pending.code = newCode();
    await redis.set(pendingKey(email), JSON.stringify(pending), "EX", 15 * 60);

    // Do not await resend email
    emailCode(email, pending.code, pending.displayName).catch(err => {
      logger.error(`Resend email failed: ${err.message}`);
    });
  },
};
