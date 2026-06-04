"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../../config/db");
const redis_1 = require("../../config/redis");
const env_1 = require("../../config/env");
const ApiError_1 = require("../../utils/ApiError");
const sanitizeUser_1 = require("../../utils/sanitizeUser");
const mailer_1 = require("../../utils/mailer");
const emailTemplates_1 = require("../../utils/emailTemplates");
const logger_1 = require("../../utils/logger");
const razorpay_1 = require("../../config/razorpay");
const notification_service_1 = require("../notification/notification.service");
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
        const tier = razorpay_1.PLANS[plan].tier;
        const user = await db_1.prisma.user.update({
            where: { id: userId },
            data: { tier, subscriptionEndsAt: new Date(Date.now() + 30 * 86_400_000) },
        });
        await notification_service_1.NotificationService.create({
            userId,
            type: "plan_purchased",
            title: `You're now on the ${tier} plan 🎉`,
            body: "Your subscription is active. Enjoy your new benefits!",
            link: "/profile",
        });
        // Send payment success email (non-blocking)
        const amount = `₹${(razorpay_1.PLANS[plan].amount / 100).toFixed(2)}`;
        const date = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
        const nextBilling = new Date(Date.now() + 30 * 86_400_000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
        (0, mailer_1.sendMail)(user.email, "Payment Successful – QuizMind AI", (0, emailTemplates_1.paymentSuccessEmailTemplate)(user.displayName ?? user.username, tier.charAt(0).toUpperCase() + tier.slice(1), amount, orderId, "Card •••• " + paymentId.slice(-4), date, nextBilling)).catch(err => logger_1.logger.error(`Payment success email failed: ${err.message}`));
        return (0, sanitizeUser_1.toPublicUser)(user);
    },
    async requestCancelOtp(userId) {
        const user = await db_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw ApiError_1.ApiError.notFound("User not found");
        const code = String(Math.floor(100000 + Math.random() * 900000));
        await redis_1.redis.set(`cancelotp:${userId}`, code, "EX", 600);
        // Do not await the cancellation email
        (0, mailer_1.sendMail)(user.email, "Your QuizMind cancellation code", `<p>Your plan cancellation code is <b style="font-size:18px">${code}</b>.</p><p>It expires in 10 minutes. If you didn't request this, ignore this email.</p>`).catch(err => logger_1.logger.error(`Cancel email failed: ${err.message}`));
        if (!env_1.isProd)
            logger_1.logger.info(`Cancel OTP for ${user.email}: ${code}`);
    },
    async cancel(userId, otp) {
        const key = `cancelotp:${userId}`;
        const stored = await redis_1.redis.get(key);
        if (!stored || stored !== otp)
            throw ApiError_1.ApiError.badRequest("Invalid or expired code");
        await redis_1.redis.del(key);
        const user = await db_1.prisma.user.update({
            where: { id: userId },
            data: { tier: "free", subscriptionEndsAt: null },
        });
        await notification_service_1.NotificationService.create({
            userId,
            type: "plan_cancelled",
            title: "Your plan was cancelled",
            body: "You're back on the Free plan. You can re-subscribe anytime.",
            link: "/pricing",
        });
        return (0, sanitizeUser_1.toPublicUser)(user);
    },
};
//# sourceMappingURL=payment.service.js.map