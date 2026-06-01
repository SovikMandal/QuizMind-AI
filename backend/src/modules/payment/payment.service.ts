import crypto from "crypto";
import { prisma } from "../../config/db";
import { redis } from "../../config/redis";
import { env, isProd } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { toPublicUser } from "../../utils/sanitizeUser";
import { sendMail } from "../../utils/mailer";
import { logger } from "../../utils/logger";
import { razorpay, isRazorpayConfigured, PLANS, PlanId } from "../../config/razorpay";

function ensureConfigured() {
  if (!isRazorpayConfigured || !razorpay) {
    throw new ApiError(503, "Payments are not configured (set RAZORPAY_* env vars)");
  }
}

export const PaymentService = {
  async createOrder(plan: PlanId) {
    ensureConfigured();
    const { amount } = PLANS[plan];
    const order = await razorpay!.orders.create({
      amount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });
    return { orderId: order.id, amount, currency: "INR", keyId: env.RAZORPAY_KEY_ID, plan };
  },

  async verifyAndUpgrade(
    userId: string,
    plan: PlanId,
    orderId: string,
    paymentId: string,
    signature: string
  ) {
    ensureConfigured();
    const expected = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
    if (expected !== signature) throw ApiError.badRequest("Invalid payment signature");

    const user = await prisma.user.update({
      where: { id: userId },
      data: { tier: PLANS[plan].tier },
    });
    return toPublicUser(user);
  },

  async requestCancelOtp(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound("User not found");
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await redis.set(`cancelotp:${userId}`, code, "EX", 600);
    await sendMail(
      user.email,
      "Your QuizMind cancellation code",
      `<p>Your plan cancellation code is <b style="font-size:18px">${code}</b>.</p><p>It expires in 10 minutes. If you didn't request this, ignore this email.</p>`
    );
    if (!isProd) logger.info(`Cancel OTP for ${user.email}: ${code}`);
  },

  async cancel(userId: string, otp: string) {
    const key = `cancelotp:${userId}`;
    const stored = await redis.get(key);
    if (!stored || stored !== otp) throw ApiError.badRequest("Invalid or expired code");
    await redis.del(key);
    const user = await prisma.user.update({ where: { id: userId }, data: { tier: "free" } });
    return toPublicUser(user);
  },
};
