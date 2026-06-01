import { Router } from "express";
import * as controller from "./auth.controller";
import { validateBody } from "../../middlewares/validate";
import { authenticate } from "../../middlewares/auth.middleware";
import { authLimiter } from "../../middlewares/rateLimit";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "./auth.schemas";

const router = Router();

router.post("/register", authLimiter, validateBody(registerSchema), controller.register);
router.post("/login", authLimiter, validateBody(loginSchema), controller.login);
router.post("/refresh", controller.refresh);
router.post("/logout", controller.logout);
router.post("/forgot-password", authLimiter, validateBody(forgotPasswordSchema), controller.forgotPassword);
router.post("/reset-password", authLimiter, validateBody(resetPasswordSchema), controller.resetPassword);
router.get("/me", authenticate, controller.me);

export default router;
