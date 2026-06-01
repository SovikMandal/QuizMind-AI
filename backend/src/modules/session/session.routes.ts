import { Router } from "express";
import * as session from "./session.controller";
import * as analytics from "../analytics/analytics.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validateBody } from "../../middlewares/validate";
import { joinSchema, submitAttemptSchema } from "./session.schemas";

const router = Router();
router.use(authenticate);

router.post("/join", validateBody(joinSchema), session.join);
router.post("/:id/submit", validateBody(submitAttemptSchema), session.submit);
router.get("/live", session.listLive);
router.get("/:id/results", analytics.results);
router.get("/:id/leaderboard", analytics.leaderboard);
router.get("/:id/analytics", analytics.analytics);
router.get("/:id", session.getOne);

export default router;
