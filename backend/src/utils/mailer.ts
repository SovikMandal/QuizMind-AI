import { env } from "../config/env";
import { logger } from "./logger";

export const isMailConfigured = !!env.SMTP_PASS;

/** Sends an email via Brevo API. No-ops (with a warning) when not configured. */
export async function sendMail(to: string, subject: string, html: string) {
  if (!env.SMTP_PASS) {
    logger.warn(`Email not configured — skipped "${subject}" to ${to}`);
    return;
  }
  try {
    const payload = {
      sender: { email: env.MAIL_FROM },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    };
    
    logger.info(`Sending email from: ${env.MAIL_FROM} to: ${to}`);
    
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": env.SMTP_PASS,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Brevo API error: ${response.status} ${error}`);
    }

    logger.info(`Email sent: "${subject}" to ${to}`);
  } catch (e: any) {
    logger.error(`Email send failed: ${e?.message || e}`);
  }
}
