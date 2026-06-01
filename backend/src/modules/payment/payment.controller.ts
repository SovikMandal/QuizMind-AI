import { RequestHandler } from "express";
import { PaymentService } from "./payment.service";

export const createOrder: RequestHandler = async (req, res) => {
  res.json(await PaymentService.createOrder(req.body.plan));
};

export const verifyPayment: RequestHandler = async (req, res) => {
  const { plan, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const user = await PaymentService.verifyAndUpgrade(
    req.user!.id,
    plan,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );
  res.json({ user });
};

export const cancel: RequestHandler = async (req, res) => {
  res.json({ user: await PaymentService.cancel(req.user!.id, req.body.otp) });
};

export const requestCancelOtp: RequestHandler = async (req, res) => {
  await PaymentService.requestCancelOtp(req.user!.id);
  res.json({ ok: true });
};
