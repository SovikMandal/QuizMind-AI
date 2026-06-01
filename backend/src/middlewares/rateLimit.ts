import rateLimit from "express-rate-limit";

const message = { error: "Too many requests, please try again later" };

// Brute-force protection for auth.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message,
});

// Throttle expensive AI generation.
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message,
});
