import { Router } from "express";
import * as question from "./question.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validateBody } from "../../middlewares/validate";
import { updateQuestionSchema } from "./question.schemas";

const router = Router();
router.use(authenticate);

router.put("/:id", validateBody(updateQuestionSchema), question.update);
router.delete("/:id", question.remove);

export default router;
