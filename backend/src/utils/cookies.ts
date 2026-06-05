import { CookieOptions, Response } from "express";
import { env, isProd } from "../config/env";

const REFRESH_COOKIE = "refreshToken";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const SECURE = env.COOKIE_SECURE ?? isProd;

/**
 * In production the frontend (e.g. quizmindai.live on Vercel) and the API
 * (Render) are on different sites, so the refresh cookie must use
 * `SameSite=None; Secure` or the browser will refuse to send it on the
 * cross-site `POST /auth/refresh` call. Locally we keep `lax` because
 * `none` requires `secure`, which doesn't work over plain HTTP on localhost.
 */
const SAME_SITE: CookieOptions["sameSite"] = SECURE ? "none" : "lax";

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: SAME_SITE,
  secure: SECURE,
  path: "/",
};

export function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    ...baseCookieOptions,
    maxAge: MAX_AGE_MS,
  });
}

export function clearRefreshCookie(res: Response) {
  // Clear with the same attributes used to set it; some browsers refuse to
  // clear a cookie if the attributes don't match.
  res.clearCookie(REFRESH_COOKIE, baseCookieOptions);
}

export { REFRESH_COOKIE };
