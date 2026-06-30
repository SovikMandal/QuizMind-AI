import { randomBytes } from "crypto";
import { prisma } from "../../config/db";
import { isProd } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { hashPassword } from "../../utils/password";
import { toPublicUser } from "../../utils/sanitizeUser";
import { sendMail } from "../../utils/mailer";
import { welcomeEmailTemplate } from "../../utils/emailTemplates";
import { logger } from "../../utils/logger";
import { issueTokens } from "./auth.service";
import { getProvider, NormalizedProfile, OAuthProviderName } from "./oauth.providers";

/**
 * Builds the provider's consent-screen URL. `state` is an opaque CSRF token
 * that the controller also stores in a cookie and re-checks on callback.
 */
export function buildAuthorizeUrl(providerName: string, state: string): string {
  const provider = getProvider(providerName);
  const params = new URLSearchParams({
    client_id: provider.clientId!,
    redirect_uri: provider.redirectUri,
    response_type: "code",
    scope: provider.scope,
    state,
    ...provider.extraAuthParams,
  });
  return `${provider.authorizeUrl}?${params.toString()}`;
}

/** Builds a unique username that satisfies the registration regex/length rules. */
async function generateUniqueUsername(profile: NormalizedProfile): Promise<string> {
  const seed =
    profile.email?.split("@")[0] ?? profile.name ?? `${profile.provider}user`;
  let base = seed
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 40);
  if (base.length < 3) base = `${profile.provider}_${base}`;

  // Try the base first, then append a short random suffix until it's free.
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate =
      attempt === 0 ? base : `${base}_${randomBytes(3).toString("hex")}`.slice(0, 50);
    const taken = await prisma.user.findUnique({ where: { username: candidate } });
    if (!taken) return candidate;
  }
  // Extremely unlikely fallback.
  return `${profile.provider}_${randomBytes(8).toString("hex")}`;
}

/**
 * Links the OAuth identity to a user by verified email. If no account exists,
 * one is created with a random password (OAuth users sign in via the provider,
 * not a password) and `emailVerified: true`.
 */
async function findOrCreateUser(profile: NormalizedProfile) {
  if (!profile.email) {
    throw ApiError.badRequest(
      `Your ${profile.provider} account has no accessible email. Make your email public or grant email access, then try again.`
    );
  }

  const existing = await prisma.user.findUnique({ where: { email: profile.email } });
  if (existing) return existing;

  const username = await generateUniqueUsername(profile);
  // OAuth users don't use this password; it's a random unguessable placeholder.
  const passwordHash = await hashPassword(randomBytes(32).toString("hex"));

  const user = await prisma.user.create({
    data: {
      email: profile.email,
      username,
      passwordHash,
      displayName: profile.name ?? username,
      avatarUrl: profile.avatarUrl ?? undefined,
      emailVerified: true,
    },
  });

  sendMail(
    user.email,
    "Welcome to QuizMind AI 🎉",
    welcomeEmailTemplate(user.displayName ?? user.username)
  ).catch((err) => logger.error(`Failed to send welcome email: ${err}`));

  return user;
}

export const OAuthService = {
  buildAuthorizeUrl,

  /** Exchanges the code, resolves the user, and issues our own JWT pair. */
  async handleCallback(providerName: string, code: string) {
    const provider = getProvider(providerName);
    const accessToken = await provider.exchangeCode(code);
    const profile = await provider.fetchProfile(accessToken);
    const user = await findOrCreateUser(profile);
    const tokens = await issueTokens(user.id);
    if (!isProd) {
      logger.info(`OAuth login via ${providerName as OAuthProviderName}: ${user.email}`);
    }
    return { user: toPublicUser(user), ...tokens };
  },
};
