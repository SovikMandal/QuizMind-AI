import { Resend } from "resend";
import { env } from "../config/env";
import { logger } from "./logger";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
export const isMailConfigured = !!resend;

/** Sends an email via Resend. No-ops (with a warning) when RESEND_API_KEY is unset. */
export async function sendMail(to: string, subject: string, html: string) {
  if (!resend) {
    logger.warn(`Email not configured — skipped "${subject}" to ${to}`);
    return;
  }
  try {
    await resend.emails.send({ from: env.MAIL_FROM, to, subject, html });
  } catch (e) {
    logger.error(`Email send failed: ${e instanceof Error ? e.message : e}`);
  }
}
