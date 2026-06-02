import { Router } from "express";
import * as controller from "./notification.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();
router.use(authenticate);

router.get("/", controller.list);
router.get("/unread-count", controller.unreadCount);
router.patch("/read-all", controller.markAllRead);
router.patch("/:id/read", controller.markRead);
router.delete("/:id", controller.remove);

export default router;
