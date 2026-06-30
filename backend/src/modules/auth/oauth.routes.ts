import { Router } from "express";
import * as controller from "./oauth.controller";

const router = Router();

// Restrict the :provider param to the providers we actually support.
router.param("provider", (req, res, next, value) => {
  if (value === "google" || value === "github") return next();
  return res.redirect(`${process.env.FRONTEND_URL ?? ""}/login?error=oauth_unknown_provider`);
});

// GET /api/v1/auth/google           → start Google OAuth
// GET /api/v1/auth/github           → start GitHub OAuth
router.get("/:provider", controller.start);

// GET /api/v1/auth/google/callback  → Google redirects back here
// GET /api/v1/auth/github/callback  → GitHub redirects back here
router.get("/:provider/callback", controller.callback);

export default router;
