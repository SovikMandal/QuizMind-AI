"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFRESH_COOKIE = void 0;
exports.setRefreshCookie = setRefreshCookie;
exports.clearRefreshCookie = clearRefreshCookie;
const env_1 = require("../config/env");
const REFRESH_COOKIE = "refreshToken";
exports.REFRESH_COOKIE = REFRESH_COOKIE;
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const SECURE = env_1.env.COOKIE_SECURE ?? env_1.isProd;
function setRefreshCookie(res, token) {
    res.cookie(REFRESH_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: SECURE,
        maxAge: MAX_AGE_MS,
        path: "/",
    });
}
function clearRefreshCookie(res) {
    res.clearCookie(REFRESH_COOKIE, { path: "/" });
}
//# sourceMappingURL=cookies.js.map