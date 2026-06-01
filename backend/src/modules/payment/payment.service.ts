import crypto from "crypto";
import { prisma } from "../../config/db";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { toPublicUser } from "../../utils/sanitizeUser";
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

  async cancel(userId: string) {
    const user = await prisma.user.update({ where: { id: userId }, data: { tier: "free" } });
    return toPublicUser(user);
  },
};
