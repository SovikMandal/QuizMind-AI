import { z } from "zod";

export const createOrderSchema = z.object({
  plan: z.enum(["pro", "premium"]),
});

export const verifyPaymentSchema = z.object({
  plan: z.enum(["pro", "premium"]),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});
