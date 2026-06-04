"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMailConfigured = void 0;
exports.sendMail = sendMail;
const env_1 = require("../config/env");
const logger_1 = require("./logger");
exports.isMailConfigured = !!env_1.env.SMTP_PASS;
/** Sends an email via Brevo API. No-ops (with a warning) when not configured. */
async function sendMail(to, subject, html) {
    if (!env_1.env.SMTP_PASS) {
        logger_1.logger.warn(`Email not configured — skipped "${subject}" to ${to}`);
        return;
    }
    try {
        const payload = {
            sender: { email: env_1.env.MAIL_FROM },
            to: [{ email: to }],
            subject,
            htmlContent: html,
        };
        logger_1.logger.info(`Sending email from: ${env_1.env.MAIL_FROM} to: ${to}`);
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "api-key": env_1.env.SMTP_PASS,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Brevo API error: ${response.status} ${error}`);
        }
        logger_1.logger.info(`Email sent: "${subject}" to ${to}`);
    }
    catch (e) {
        logger_1.logger.error(`Email send failed: ${e?.message || e}`);
    }
}
//# sourceMappingURL=mailer.js.map