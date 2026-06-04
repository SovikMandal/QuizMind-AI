"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestCancelOtp = exports.cancel = exports.verifyPayment = exports.createOrder = void 0;
const payment_service_1 = require("./payment.service");
const createOrder = async (req, res) => {
    res.json(await payment_service_1.PaymentService.createOrder(req.body.plan));
};
exports.createOrder = createOrder;
const verifyPayment = async (req, res) => {
    const { plan, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const user = await payment_service_1.PaymentService.verifyAndUpgrade(req.user.id, plan, razorpayOrderId, razorpayPaymentId, razorpaySignature);
    res.json({ user });
};
exports.verifyPayment = verifyPayment;
const cancel = async (req, res) => {
    res.json({ user: await payment_service_1.PaymentService.cancel(req.user.id, req.body.otp) });
};
exports.cancel = cancel;
const requestCancelOtp = async (req, res) => {
    await payment_service_1.PaymentService.requestCancelOtp(req.user.id);
    res.json({ ok: true });
};
exports.requestCancelOtp = requestCancelOtp;
//# sourceMappingURL=payment.controller.js.map