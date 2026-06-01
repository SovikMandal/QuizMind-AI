import { Response } from "express";
import { env, isProd } from "../config/env";

const REFRESH_COOKIE = "refreshToken";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const SECURE = env.COOKIE_SECURE ?? isProd;

export function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: SECURE,
    maxAge: MAX_AGE_MS,
    path: "/",
  });
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, { path: "/" });
}

export { REFRESH_COOKIE };
