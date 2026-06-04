"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProd = exports.env = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().default(4000),
    NODE_ENV: zod_1.z.enum(["development", "test", "production"]).default("development"),
    FRONTEND_URL: zod_1.z.string().url().default("http://localhost:5173"),
    DATABASE_URL: zod_1.z.string().min(1, "DATABASE_URL is required"),
    REDIS_URL: zod_1.z.string().min(1, "REDIS_URL is required"),
    JWT_ACCESS_SECRET: zod_1.z.string().min(1, "JWT_ACCESS_SECRET is required"),
    JWT_REFRESH_SECRET: zod_1.z.string().min(1, "JWT_REFRESH_SECRET is required"),
    JWT_ACCESS_EXPIRES_IN: zod_1.z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default("7d"),
    BCRYPT_ROUNDS: zod_1.z.coerce.number().default(12),
    COOKIE_SECURE: zod_1.z
        .enum(["true", "false"])
        .optional()
        .transform((v) => (v === undefined ? undefined : v === "true")),
    AI_PROVIDER: zod_1.z.string().default("gemini"),
    AI_API_KEY: zod_1.z.string().optional(),
    AI_REQUIRE_PAID: zod_1.z
        .enum(["true", "false"])
        .default("false")
        .transform((v) => v === "true"),
    GEMINI_MODEL: zod_1.z.string().default("gemini-2.5-flash"),
    ANTHROPIC_MODEL: zod_1.z.string().default("claude-3-5-sonnet-20241022"),
    OPENROUTER_MODEL: zod_1.z.string().default("openrouter/owl-alpha"),
    CLOUDINARY_CLOUD_NAME: zod_1.z.string().optional(),
    CLOUDINARY_API_KEY: zod_1.z.string().optional(),
    CLOUDINARY_API_SECRET: zod_1.z.string().optional(),
    RAZORPAY_KEY_ID: zod_1.z.string().optional(),
    RAZORPAY_KEY_SECRET: zod_1.z.string().optional(),
    SMTP_HOST: zod_1.z.string().default("smtp-relay.brevo.com"),
    SMTP_PORT: zod_1.z.coerce.number().default(587),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    MAIL_FROM: zod_1.z.string().default("QuizMind AI <no-reply@example.com>"),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("❌ Invalid environment configuration:");
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}
exports.env = parsed.data;
exports.isProd = exports.env.NODE_ENV === "production";
//# sourceMappingURL=env.js.map