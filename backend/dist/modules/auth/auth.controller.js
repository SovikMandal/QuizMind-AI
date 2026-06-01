"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.me = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const auth_service_1 = require("./auth.service");
const cookies_1 = require("../../utils/cookies");
const sanitizeUser_1 = require("../../utils/sanitizeUser");
const db_1 = require("../../config/db");
const ApiError_1 = require("../../utils/ApiError");
const register = async (req, res) => {
    const { user, accessToken, refreshToken } = await auth_service_1.AuthService.register(req.body);
    (0, cookies_1.setRefreshCookie)(res, refreshToken);
    res.status(201).json({ user, accessToken });
};
exports.register = register;
const login = async (req, res) => {
    const { user, accessToken, refreshToken } = await auth_service_1.AuthService.login(req.body);
    (0, cookies_1.setRefreshCookie)(res, refreshToken);
    res.json({ user, accessToken });
};
exports.login = login;
const refresh = async (req, res) => {
    const token = req.cookies?.[cookies_1.REFRESH_COOKIE] ?? req.body?.refreshToken;
    const { accessToken, refreshToken } = await auth_service_1.AuthService.refresh(token);
    (0, cookies_1.setRefreshCookie)(res, refreshToken);
    res.json({ accessToken });
};
exports.refresh = refresh;
const logout = async (req, res) => {
    const token = req.cookies?.[cookies_1.REFRESH_COOKIE] ?? req.body?.refreshToken;
    await auth_service_1.AuthService.logout(token);
    (0, cookies_1.clearRefreshCookie)(res);
    res.status(204).send();
};
exports.logout = logout;
const me = async (req, res) => {
    const user = await db_1.prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user)
        throw ApiError_1.ApiError.notFound("User not found");
    res.json({ user: (0, sanitizeUser_1.toPublicUser)(user) });
};
exports.me = me;
const forgotPassword = async (req, res) => {
    const { devToken } = await auth_service_1.AuthService.requestPasswordReset(req.body.email);
    // devToken is present only outside production (no email provider).
    res.json({ message: "If that email exists, a reset link has been sent.", devToken });
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    await auth_service_1.AuthService.resetPassword(req.body.token, req.body.password);
    res.json({ message: "Password updated. You can now sign in." });
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=auth.controller.js.map