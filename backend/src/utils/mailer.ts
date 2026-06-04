import nodemailer from "nodemailer";
import { env } from "../config/env";
import { logger } from "./logger";

const transporter =
  env.SMTP_USER && env.SMTP_PASS
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465, // 465 = SSL, 587 = STARTTLS
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
        connectionTimeout: 10000, 
        greetingTimeout: 10000,
        socketTimeout: 15000,
      })
    : null;

export const isMailConfigured = !!transporter;

/** Sends an email via SMTP (Brevo). No-ops (with a warning) when SMTP isn't configured. */
export async function sendMail(to: string, subject: string, html: string) {
  if (!transporter) {
    logger.warn(`Email not configured — skipped "${subject}" to ${to}`);
    return;
  }
  try {
    // Wrap the sendMail in a strict 5-second Promise race.
    // If the port is blocked by Render, it will immediately timeout instead of holding the server for 6 minutes.
    const sendPromise = transporter.sendMail({ from: env.MAIL_FROM, to, subject, html });
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("SMTP Connection timed out after 5 seconds. Check if Render is blocking port 587.")), 5000)
    );
    await Promise.race([sendPromise, timeoutPromise]);
  } catch (e) {
    logger.error(`Email send failed: ${e instanceof Error ? e.message : e}`);
  }
}
