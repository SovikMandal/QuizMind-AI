import crypto from "crypto";
import { prisma } from "../../config/db";
import { redis } from "../../config/redis";
import { env, isProd } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { toPublicUser } from "../../utils/sanitizeUser";
import { sendMail } from "../../utils/mailer";
import { paymentSuccessEmailTemplate, subscriptionCancelledEmailTemplate } from "../../utils/emailTemplates";
import { logger } from "../../utils/logger";
import { razorpay, isRazorpayConfigured, PLANS, PlanId } from "../../config/razorpay";
import { NotificationService } from "../notification/notification.service";

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

    const tier = PLANS[plan].tier;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { tier, subscriptionEndsAt: new Date(Date.now() + 30 * 86_400_000) },
    });
    
    await NotificationService.create({
      userId,
      type: "plan_purchased",
      title: `You're now on the ${tier} plan 🎉`,
      body: "Your subscription is active. Enjoy your new benefits!",
      link: "/profile",
    });

    // Send payment success email (non-blocking)
    const amount = `₹${(PLANS[plan].amount / 100).toFixed(2)}`;
    const date = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const nextBilling = new Date(Date.now() + 30 * 86_400_000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    
    sendMail(
      user.email,
      "Payment Successful – QuizMind AI",
      paymentSuccessEmailTemplate(
        user.displayName ?? user.username,
        tier.charAt(0).toUpperCase() + tier.slice(1),
        amount,
        orderId,
        "Card •••• " + paymentId.slice(-4),
        date,
        nextBilling
      )
    ).catch(err => logger.error(`Payment success email failed: ${err.message}`));

    return toPublicUser(user);
  },

  async requestCancelOtp(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound("User not found");
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await redis.set(`cancelotp:${userId}`, code, "EX", 600);
    
    // Do not await the cancellation email
    sendMail(
      user.email,
      "Your QuizMind cancellation code",
      `<p>Your plan cancellation code is <b style="font-size:18px">${code}</b>.</p><p>It expires in 10 minutes. If you didn't request this, ignore this email.</p>`
    ).catch(err => logger.error(`Cancel email failed: ${err.message}`));
    
    if (!isProd) logger.info(`Cancel OTP for ${user.email}: ${code}`);
  },

  async cancel(userId: string, otp: string) {
    const key = `cancelotp:${userId}`;
    const stored = await redis.get(key);

    if (!stored || stored !== otp) {
      throw ApiError.badRequest("Invalid or expired code");
    }

    const existingUser = await prisma.user.findUnique({
      where: {id: userId},
    })

    if(!existingUser) {
      throw ApiError.notFound("User not found");
    }

    const previousTier = existingUser.tier;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        tier: "free",
        subscriptionEndsAt: null,
      },
    });

    await redis.del(key);

    await NotificationService.create({
      userId,
      type: "plan_cancelled",
      title: "Your plan was cancelled",
      body: "You're back on the Free plan. You can re-subscribe anytime.",
      link: "/pricing",
    });

    const cancellationDate = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const accessUntil = new Date(Date.now() + 30 * 86_400_000).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );

    sendMail(
      user.email,
      "Subscription Cancelled – QuizMind AI",
      subscriptionCancelledEmailTemplate(
        user.displayName ?? user.username,
        previousTier.charAt(0).toUpperCase() + previousTier.slice(1),
        cancellationDate,
        accessUntil,
        user.email
      )
    ).catch((err) =>
      logger.error(`Cancellation email failed: ${err.message}`)
    );

    return toPublicUser(user);
  },
};
