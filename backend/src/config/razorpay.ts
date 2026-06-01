import Razorpay from "razorpay";
import { env } from "./env";

export const isRazorpayConfigured = Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);

export const razorpay = isRazorpayConfigured
  ? new Razorpay({ key_id: env.RAZORPAY_KEY_ID!, key_secret: env.RAZORPAY_KEY_SECRET! })
  : null;

// Amounts in paise (INR). Matches the Pricing page tiers.
export const PLANS = {
  pro: { amount: 25000, tier: "pro" as const },
  premium: { amount: 90000, tier: "premium" as const },
};

export type PlanId = keyof typeof PLANS;
