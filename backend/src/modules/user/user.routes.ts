import { Router } from "express";
import * as controller from "./user.controller";
import * as analytics from "../analytics/analytics.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validateBody } from "../../middlewares/validate";
import { avatarUpload } from "../../config/upload";
import { updateProfileSchema, updateGoalsSchema } from "./user.schemas";

const router = Router();

router.use(authenticate);
router.get("/me", controller.getMe);
router.put("/me", validateBody(updateProfileSchema), controller.updateMe);
router.post("/me/avatar", avatarUpload.single("avatar"), controller.uploadAvatar);
router.get("/me/stats", controller.getStats);
router.get("/me/dashboard", controller.getDashboard);
router.get("/me/goals", controller.getGoals);
router.put("/me/goals", validateBody(updateGoalsSchema), controller.updateGoals);
router.get("/me/history", analytics.history);
router.get("/me/exports/quota", analytics.exportQuota);
router.get("/me/dashboard-exports/quota", analytics.dashboardExportQuota);
router.post("/me/dashboard-exports/consume", analytics.dashboardExportConsume);

export default router;
