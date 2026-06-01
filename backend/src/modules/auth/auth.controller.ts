import { RequestHandler } from "express";
import { AuthService } from "./auth.service";
import { setRefreshCookie, clearRefreshCookie, REFRESH_COOKIE } from "../../utils/cookies";
import { toPublicUser } from "../../utils/sanitizeUser";
import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";

export const register: RequestHandler = async (req, res) => {
  const result = await AuthService.register(req.body);
  res.status(202).json(result);
};

export const login: RequestHandler = async (req, res) => {
  const { user, accessToken, refreshToken } = await AuthService.login(req.body);
  setRefreshCookie(res, refreshToken);
  res.json({ user, accessToken });
};

export const refresh: RequestHandler = async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE] ?? req.body?.refreshToken;
  const { accessToken, refreshToken } = await AuthService.refresh(token);
  setRefreshCookie(res, refreshToken);
  res.json({ accessToken });
};

export const logout: RequestHandler = async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE] ?? req.body?.refreshToken;
  await AuthService.logout(token);
  clearRefreshCookie(res);
  res.status(204).send();
};

export const me: RequestHandler = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) throw ApiError.notFound("User not found");
  res.json({ user: toPublicUser(user) });
};

export const forgotPassword: RequestHandler = async (req, res) => {
  const { devToken } = await AuthService.requestPasswordReset(req.body.email);
  // devToken is present only outside production (no email provider).
  res.json({ message: "If that email exists, a reset link has been sent.", devToken });
};

export const resetPassword: RequestHandler = async (req, res) => {
  await AuthService.resetPassword(req.body.token, req.body.password);
  res.json({ message: "Password updated. You can now sign in." });
};

export const verifyEmail: RequestHandler = async (req, res) => {
  const { user, accessToken, refreshToken } = await AuthService.verifyRegistration(req.body.email, req.body.code);
  setRefreshCookie(res, refreshToken);
  res.status(201).json({ user, accessToken });
};

export const resendVerification: RequestHandler = async (req, res) => {
  await AuthService.resendVerification(req.body.email);
  res.json({ ok: true });
};
