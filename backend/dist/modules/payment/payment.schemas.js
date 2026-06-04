"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelSchema = exports.verifyPaymentSchema = exports.createOrderSchema = void 0;
const zod_1 = require("zod");
exports.createOrderSchema = zod_1.z.object({
    plan: zod_1.z.enum(["pro", "premium"]),
});
exports.verifyPaymentSchema = zod_1.z.object({
    plan: zod_1.z.enum(["pro", "premium"]),
    razorpayOrderId: zod_1.z.string().min(1),
    razorpayPaymentId: zod_1.z.string().min(1),
    razorpaySignature: zod_1.z.string().min(1),
});
exports.cancelSchema = zod_1.z.object({ otp: zod_1.z.string().min(4).max(8) });
//# sourceMappingURL=payment.schemas.js.map