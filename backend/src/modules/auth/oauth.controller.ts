import { RequestHandler } from "express";
import { randomBytes } from "crypto";
import { CookieOptions } from "express";
import { env, isProd } from "../../config/env";
import { OAuthService } from "./oauth.service";
import { setRefreshCookie } from "../../utils/cookies";
import { logger } from "../../utils/logger";

const STATE_COOKIE = "oauth_state";
const SECURE = env.COOKIE_SECURE ?? isProd;

// `lax` so the cookie survives the top-level redirect back from the provider.
const stateCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: SECURE,
  path: "/",
  maxAge: 10 * 60 * 1000, // 10 minutes
};

/** GET /auth/:provider — redirect the user to the provider's consent screen. */
export const start: RequestHandler = (req, res) => {
  const provider = String(req.params.provider);
  const state = randomBytes(16).toString("hex");
  const url = OAuthService.buildAuthorizeUrl(provider, state);
  res.cookie(STATE_COOKIE, state, stateCookieOptions);
  res.redirect(url);
};

/** GET /auth/:provider/callback — exchange the code, log in, hand off to the SPA. */
export const callback: RequestHandler = async (req, res) => {
  const provider = String(req.params.provider);
  const loginPage = `${env.FRONTEND_URL}/login`;

  try {
    const code = typeof req.query.code === "string" ? req.query.code : undefined;
    const state = typeof req.query.state === "string" ? req.query.state : undefined;
    const cookieState = req.cookies?.[STATE_COOKIE];

    res.clearCookie(STATE_COOKIE, { ...stateCookieOptions, maxAge: undefined });

    if (req.query.error) {
      // User denied consent, or the provider returned an error.
      return res.redirect(`${loginPage}?error=oauth_denied`);
    }
    if (!code) return res.redirect(`${loginPage}?error=oauth_missing_code`);
    if (!state || !cookieState || state !== cookieState) {
      return res.redirect(`${loginPage}?error=oauth_state_mismatch`);
    }

    const { refreshToken } = await OAuthService.handleCallback(provider, code);
    setRefreshCookie(res, refreshToken);

    // The refresh cookie is now set; the SPA exchanges it for an access token
    // via POST /auth/refresh on this landing route.
    return res.redirect(`${env.FRONTEND_URL}/oauth/callback?provider=${encodeURIComponent(provider)}`);
  } catch (err) {
    logger.error(`OAuth callback failed for ${provider}: ${err}`);
    return res.redirect(`${loginPage}?error=oauth_failed`);
  }
};
