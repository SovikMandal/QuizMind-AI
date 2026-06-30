import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";

export type OAuthProviderName = "google" | "github";

/** Normalized profile shape used by the OAuth service regardless of provider. */
export interface NormalizedProfile {
  provider: OAuthProviderName;
  providerId: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

interface ProviderConfig {
  name: OAuthProviderName;
  clientId?: string;
  clientSecret?: string;
  redirectUri: string;
  authorizeUrl: string;
  scope: string;
  /** Extra params appended to the authorize URL. */
  extraAuthParams?: Record<string, string>;
  /** Exchanges an authorization code for an access token. */
  exchangeCode: (code: string) => Promise<string>;
  /** Fetches and normalizes the user's profile using the access token. */
  fetchProfile: (accessToken: string) => Promise<NormalizedProfile>;
}

// ── Google ───────────────────────────────────────────────
const google: ProviderConfig = {
  name: "google",
  clientId: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  redirectUri: env.GOOGLE_REDIRECT_URI,
  authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  scope: "openid email profile",
  extraAuthParams: { access_type: "offline", prompt: "select_account" },

  async exchangeCode(code: string) {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID!,
        client_secret: env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });
    if (!res.ok) {
      throw ApiError.badRequest(`Google token exchange failed: ${await res.text()}`);
    }
    const data = (await res.json()) as { access_token?: string };
    if (!data.access_token) throw ApiError.badRequest("Google did not return an access token");
    return data.access_token;
  },

  async fetchProfile(accessToken: string) {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw ApiError.badRequest("Failed to fetch Google profile");
    const p = (await res.json()) as {
      sub: string;
      email?: string;
      email_verified?: boolean;
      name?: string;
      picture?: string;
    };
    return {
      provider: "google",
      providerId: p.sub,
      email: p.email && p.email_verified ? p.email : p.email ?? null,
      name: p.name ?? null,
      avatarUrl: p.picture ?? null,
    };
  },
};

// ── GitHub ───────────────────────────────────────────────
const github: ProviderConfig = {
  name: "github",
  clientId: env.GITHUB_CLIENT_ID,
  clientSecret: env.GITHUB_CLIENT_SECRET,
  redirectUri: env.GITHUB_REDIRECT_URI,
  authorizeUrl: "https://github.com/login/oauth/authorize",
  scope: "read:user user:email",

  async exchangeCode(code: string) {
    const res = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        code,
        client_id: env.GITHUB_CLIENT_ID!,
        client_secret: env.GITHUB_CLIENT_SECRET!,
        redirect_uri: env.GITHUB_REDIRECT_URI,
      }),
    });
    if (!res.ok) {
      throw ApiError.badRequest(`GitHub token exchange failed: ${await res.text()}`);
    }
    const data = (await res.json()) as { access_token?: string };
    if (!data.access_token) throw ApiError.badRequest("GitHub did not return an access token");
    return data.access_token;
  },

  async fetchProfile(accessToken: string) {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "QuizMind-AI",
    };

    const userRes = await fetch("https://api.github.com/user", { headers });
    if (!userRes.ok) throw ApiError.badRequest("Failed to fetch GitHub profile");
    const u = (await userRes.json()) as {
      id: number;
      login: string;
      name?: string;
      email?: string;
      avatar_url?: string;
    };

    // The primary email may be private, so fetch it explicitly.
    let email = u.email ?? null;
    if (!email) {
      const emailRes = await fetch("https://api.github.com/user/emails", { headers });
      if (emailRes.ok) {
        const emails = (await emailRes.json()) as {
          email: string;
          primary: boolean;
          verified: boolean;
        }[];
        const primary = emails.find((e) => e.primary && e.verified) ?? emails.find((e) => e.verified);
        email = primary?.email ?? null;
      }
    }

    return {
      provider: "github",
      providerId: String(u.id),
      email,
      name: u.name ?? u.login,
      avatarUrl: u.avatar_url ?? null,
    };
  },
};

const providers: Record<OAuthProviderName, ProviderConfig> = { google, github };

export function getProvider(name: string): ProviderConfig {
  const provider = providers[name as OAuthProviderName];
  if (!provider) throw ApiError.notFound(`Unknown OAuth provider: ${name}`);
  if (!provider.clientId || !provider.clientSecret) {
    throw ApiError.badRequest(`${provider.name} OAuth is not configured on the server`);
  }
  return provider;
}

export type { ProviderConfig };
