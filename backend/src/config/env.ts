import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  // Direct (non-pooled) Neon endpoint, used by Prisma for migrations only.
  // Optional at runtime — PrismaClient queries use the pooled DATABASE_URL.
  DIRECT_URL: z.string().optional(),
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),

  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  COOKIE_SECURE: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),

  AI_PROVIDER: z.string().default("gemini"),
  AI_API_KEY: z.string().optional(),
  AI_REQUIRE_PAID: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  ANTHROPIC_MODEL: z.string().default("claude-3-5-sonnet-20241022"),
  OPENROUTER_MODEL: z.string().default("openrouter/owl-alpha"),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),

  SMTP_PASS: z.string().optional(), // Brevo API key
  MAIL_FROM: z.string().default("noreply@quizmindai.live"),

  // ── OAuth (Google + GitHub) ──────────────────────────────
  // All optional: a provider is "enabled" only when its id + secret are set.
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z
    .string()
    .url()
    .default("http://localhost:4000/api/v1/auth/google/callback"),

  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_REDIRECT_URI: z
    .string()
    .url()
    .default("http://localhost:4000/api/v1/auth/github/callback"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
