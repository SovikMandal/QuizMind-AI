import { Router } from "express";
import * as quiz from "./quiz.controller";
import * as question from "./question.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { isQuizCreator } from "../../middlewares/ownership.middleware";
import { validateBody } from "../../middlewares/validate";
import { createQuizSchema, updateQuizSchema } from "./quiz.schemas";
import { addQuestionSchema } from "./question.schemas";

const router = Router();
router.use(authenticate);

router.get("/", quiz.list);
router.get("/mine", quiz.listMine);
router.get("/reminders", quiz.listReminders);
router.post("/", validateBody(createQuizSchema), quiz.create);
router.get("/:id", quiz.getOne);
router.get("/:id/info", quiz.info);
router.put("/:id", isQuizCreator, validateBody(updateQuizSchema), quiz.update);
router.delete("/:id", isQuizCreator, quiz.remove);
router.post("/:id/publish", isQuizCreator, quiz.publish);
router.post("/:id/remind", quiz.remind);
router.delete("/:id/remind", quiz.cancelRemind);

router.get("/:id/questions", question.list);
router.post("/:id/questions", isQuizCreator, validateBody(addQuestionSchema), question.add);

export default router;
