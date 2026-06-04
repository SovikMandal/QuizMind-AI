"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMailConfigured = void 0;
exports.sendMail = sendMail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const logger_1 = require("./logger");
const transporter = env_1.env.SMTP_USER && env_1.env.SMTP_PASS
    ? nodemailer_1.default.createTransport({
        host: env_1.env.SMTP_HOST,
        port: env_1.env.SMTP_PORT,
        secure: env_1.env.SMTP_PORT === 465, // 465 = SSL, 587 = STARTTLS
        auth: { user: env_1.env.SMTP_USER, pass: env_1.env.SMTP_PASS },
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 5000, // 5 seconds
    })
    : null;
exports.isMailConfigured = !!transporter;
/** Sends an email via SMTP (Brevo). No-ops (with a warning) when SMTP isn't configured. */
async function sendMail(to, subject, html) {
    if (!transporter) {
        logger_1.logger.warn(`Email not configured — skipped "${subject}" to ${to}`);
        return;
    }
    try {
        await transporter.sendMail({ from: env_1.env.MAIL_FROM, to, subject, html });
    }
    catch (e) {
        logger_1.logger.error(`Email send failed: ${e instanceof Error ? e.message : e}`);
    }
}
//# sourceMappingURL=mailer.js.map