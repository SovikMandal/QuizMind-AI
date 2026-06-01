import { Router } from "express";
import * as ai from "./ai.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validateBody } from "../../middlewares/validate";
import { aiLimiter } from "../../middlewares/rateLimit";
import { requirePaidTier } from "../../middlewares/tier.middleware";
import { generateQuestionsSchema } from "./ai.schemas";

const router = Router();
router.use(authenticate);

router.post(
  "/generate-questions",
  aiLimiter,
  requirePaidTier,
  validateBody(generateQuestionsSchema),
  ai.generateQuestions
);

export default router;
