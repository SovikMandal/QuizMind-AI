"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../../config/db");
const env_1 = require("../../config/env");
const ApiError_1 = require("../../utils/ApiError");
const sanitizeUser_1 = require("../../utils/sanitizeUser");
const razorpay_1 = require("../../config/razorpay");
function ensureConfigured() {
    if (!razorpay_1.isRazorpayConfigured || !razorpay_1.razorpay) {
        throw new ApiError_1.ApiError(503, "Payments are not configured (set RAZORPAY_* env vars)");
    }
}
exports.PaymentService = {
    async createOrder(plan) {
        ensureConfigured();
        const { amount } = razorpay_1.PLANS[plan];
        const order = await razorpay_1.razorpay.orders.create({
            amount,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
        });
        return { orderId: order.id, amount, currency: "INR", keyId: env_1.env.RAZORPAY_KEY_ID, plan };
    },
    async verifyAndUpgrade(userId, plan, orderId, paymentId, signature) {
        ensureConfigured();
        const expected = crypto_1.default
            .createHmac("sha256", env_1.env.RAZORPAY_KEY_SECRET)
            .update(`${orderId}|${paymentId}`)
            .digest("hex");
        if (expected !== signature)
            throw ApiError_1.ApiError.badRequest("Invalid payment signature");
        const user = await db_1.prisma.user.update({
            where: { id: userId },
            data: { tier: razorpay_1.PLANS[plan].tier },
        });
        return (0, sanitizeUser_1.toPublicUser)(user);
    },
};
//# sourceMappingURL=payment.service.js.map