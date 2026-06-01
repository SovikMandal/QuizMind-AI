import { RequestHandler } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";

export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw ApiError.unauthorized("No token provided");
  }
  try {
    const decoded = verifyAccessToken(header.slice(7));
    req.user = { id: decoded.sub };
    next();
  } catch {
    throw ApiError.unauthorized("Invalid or expired token");
  }
};
