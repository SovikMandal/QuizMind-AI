import { Router } from "express";
import * as payment from "./payment.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validateBody } from "../../middlewares/validate";
import { createOrderSchema, verifyPaymentSchema, cancelSchema } from "./payment.schemas";

const router = Router();
router.use(authenticate);

router.post("/order", validateBody(createOrderSchema), payment.createOrder);
router.post("/verify", validateBody(verifyPaymentSchema), payment.verifyPayment);
router.post("/cancel/request-otp", payment.requestCancelOtp);
router.post("/cancel", validateBody(cancelSchema), payment.cancel);

export default router;
