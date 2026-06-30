import { Router } from "express";
import * as controller from "./auth.controller";
import { validateBody } from "../../middlewares/validate";
import { authenticate } from "../../middlewares/auth.middleware";
import { authLimiter } from "../../middlewares/rateLimit";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyRegistrationSchema, resendRegistrationSchema } from "./auth.schemas";
import oauthRoutes from "./oauth.routes";

const router = Router();

router.post("/register", authLimiter, validateBody(registerSchema), controller.register);
router.post("/login", authLimiter, validateBody(loginSchema), controller.login);
router.post("/refresh", controller.refresh);
router.post("/logout", controller.logout);
router.post("/forgot-password", authLimiter, validateBody(forgotPasswordSchema), controller.forgotPassword);
router.post("/reset-password", authLimiter, validateBody(resetPasswordSchema), controller.resetPassword);
router.post("/verify-email", authLimiter, validateBody(verifyRegistrationSchema), controller.verifyEmail);
router.post("/resend-verification", authLimiter, validateBody(resendRegistrationSchema), controller.resendVerification);
router.get("/me", authenticate, controller.me);

// OAuth (Google + GitHub) — mounted last so the explicit routes above
// (e.g. GET /me) take precedence over the GET /:provider matcher.
router.use(oauthRoutes);

export default router;
