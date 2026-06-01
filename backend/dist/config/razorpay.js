"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLANS = exports.razorpay = exports.isRazorpayConfigured = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const env_1 = require("./env");
exports.isRazorpayConfigured = Boolean(env_1.env.RAZORPAY_KEY_ID && env_1.env.RAZORPAY_KEY_SECRET);
exports.razorpay = exports.isRazorpayConfigured
    ? new razorpay_1.default({ key_id: env_1.env.RAZORPAY_KEY_ID, key_secret: env_1.env.RAZORPAY_KEY_SECRET })
    : null;
// Amounts in paise (INR). Matches the Pricing page tiers.
exports.PLANS = {
    pro: { amount: 25000, tier: "pro" },
    premium: { amount: 90000, tier: "premium" },
};
//# sourceMappingURL=razorpay.js.map