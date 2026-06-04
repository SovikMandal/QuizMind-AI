import { env } from "../config/env";

export function subscriptionCancelledEmailTemplate(
  name: string,
  plan: string,
  cancellationDate: string,
  accessUntil: string,
  email: string
) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Subscription Cancelled – QuizMind AI</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; background-color: #f4f4f5; }
    a { color: inherit; text-decoration: none; }
    @media only screen and (max-width: 640px) {
      .email-container { width: 100% !important; }
      .px-mobile { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f4f5;">
    <tr>
      <td style="padding:40px 16px;">
        <table class="email-container" role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" align="center" style="max-width:640px;width:100%;">
          <tr>
            <td style="padding:0 0 24px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="vertical-align:middle;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;">
                      <tr>
                        <td style="background-color:#2b7fff;border-radius:12px;width:36px;height:36px;text-align:center;vertical-align:middle;">
                          <span style="color:#eff6ff;font-size:18px;line-height:36px;font-weight:bold;">🧠</span>
                        </td>
                        <td style="padding-left:8px;vertical-align:middle;">
                          <span style="font-size:17px;font-weight:700;color:#09090b;letter-spacing:-0.3px;">QuizMind AI</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="text-align:right;vertical-align:middle;">
                    <span style="font-size:12px;color:#71717b;">Cancellation Notice</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.07);">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="background-color:#f97316;padding:40px 32px;text-align:center;border-radius:16px 16px 0 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                      <tr>
                        <td style="background-color:rgba(255,255,255,0.15);border-radius:14px;width:56px;height:56px;text-align:center;vertical-align:middle;">
                          <span style="color:#fff7ed;font-size:26px;line-height:56px;">✕</span>
                        </td>
                      </tr>
                    </table>
                    <div style="height:16px;"></div>
                    <h1 style="margin:0;font-size:22px;font-weight:700;color:#fff7ed;font-family:Georgia,'Times New Roman',serif;letter-spacing:-0.3px;">
                      Subscription Cancelled
                    </h1>
                    <div style="height:6px;"></div>
                    <p style="margin:0;font-size:14px;color:rgba(255,247,237,0.85);font-family:Georgia,'Times New Roman',serif;">
                      Your QuizMind AI ${plan} plan has been cancelled.
                    </p>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td class="px-mobile" style="padding:32px;">
                    <p style="margin:0 0 6px 0;font-size:14px;color:#09090b;font-family:Georgia,'Times New Roman',serif;">Hi ${name},</p>
                    <p style="margin:0 0 24px 0;font-size:14px;color:#71717b;line-height:1.6;font-family:Georgia,'Times New Roman',serif;">
                      We're sorry to see you go. Your <strong style="color:#09090b;">${plan}</strong> plan has been successfully cancelled. You'll continue to have access to ${plan} features until the end of your current billing period.
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #e4e4e7;border-radius:12px;margin-bottom:16px;">
                      <tr>
                        <td style="padding:20px 24px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="vertical-align:middle;">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td style="background-color:#f4f4f5;border-radius:8px;width:40px;height:40px;text-align:center;vertical-align:middle;">
                                      <span style="color:#71717b;font-size:20px;line-height:40px;">⚡</span>
                                    </td>
                                    <td style="padding-left:12px;vertical-align:middle;">
                                      <div style="font-size:14px;font-weight:600;color:#09090b;font-family:Georgia,'Times New Roman',serif;">${plan} Plan</div>
                                      <div style="font-size:12px;color:#71717b;font-family:Georgia,'Times New Roman',serif;">Billed monthly</div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              <td style="text-align:right;vertical-align:middle;">
                                <span style="background-color:#fee2e2;color:#dc2626;font-size:12px;font-weight:600;padding:3px 12px;border-radius:999px;font-family:Georgia,'Times New Roman',serif;">Cancelled</span>
                              </td>
                            </tr>
                          </table>
                          <div style="height:1px;background-color:#e4e4e7;margin:16px 0;"></div>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="font-size:14px;color:#71717b;padding-bottom:8px;font-family:Georgia,'Times New Roman',serif;">Cancellation date</td>
                              <td style="font-size:14px;color:#09090b;text-align:right;padding-bottom:8px;font-family:Georgia,'Times New Roman',serif;">${cancellationDate}</td>
                            </tr>
                            <tr>
                              <td style="font-size:14px;color:#71717b;font-family:Georgia,'Times New Roman',serif;">Access until</td>
                              <td style="font-size:14px;color:#09090b;text-align:right;font-family:Georgia,'Times New Roman',serif;">${accessUntil}</td>
                            </tr>
                          </table>
                          <div style="height:1px;background-color:#e4e4e7;margin:16px 0;"></div>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="font-size:14px;font-weight:600;color:#09090b;font-family:Georgia,'Times New Roman',serif;">Plan after expiry</td>
                              <td style="font-size:14px;font-weight:600;color:#71717b;text-align:right;font-family:Georgia,'Times New Roman',serif;">Free Plan</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f4f5;border-radius:12px;margin-bottom:24px;">
                      <tr>
                        <td style="padding:20px 24px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="font-size:14px;color:#71717b;padding-bottom:10px;font-family:Georgia,'Times New Roman',serif;">Account</td>
                              <td style="font-size:14px;font-weight:500;color:#09090b;text-align:right;padding-bottom:10px;font-family:Georgia,'Times New Roman',serif;">${email}</td>
                            </tr>
                            <tr>
                              <td style="font-size:14px;color:#71717b;padding-bottom:10px;font-family:Georgia,'Times New Roman',serif;">Plan cancelled</td>
                              <td style="font-size:14px;font-weight:500;color:#09090b;text-align:right;padding-bottom:10px;font-family:Georgia,'Times New Roman',serif;">${plan} → Free</td>
                            </tr>
                            <tr>
                              <td style="font-size:14px;color:#71717b;padding-bottom:10px;font-family:Georgia,'Times New Roman',serif;">Cancellation date</td>
                              <td style="font-size:14px;font-weight:500;color:#09090b;text-align:right;padding-bottom:10px;font-family:Georgia,'Times New Roman',serif;">${cancellationDate}</td>
                            </tr>
                            <tr>
                              <td style="font-size:14px;color:#71717b;font-family:Georgia,'Times New Roman',serif;">${plan} access ends</td>
                              <td style="font-size:14px;font-weight:500;color:#09090b;text-align:right;font-family:Georgia,'Times New Roman',serif;">${accessUntil}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;margin-bottom:24px;">
                      <tr>
                        <td style="padding:18px 20px;">
                          <p style="margin:0 0 4px 0;font-size:14px;font-weight:600;color:#1d4ed8;font-family:Georgia,'Times New Roman',serif;">Changed your mind?</p>
                          <p style="margin:0;font-size:13px;color:#3b82f6;line-height:1.5;font-family:Georgia,'Times New Roman',serif;">
                            You can reactivate your ${plan} plan anytime before ${accessUntil} and keep all your data and settings exactly as they are.
                          </p>
                        </td>
                      </tr>
                    </table>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom:10px;">
                          <a href="${env.FRONTEND_URL}/pricing" style="display:block;background-color:#2b7fff;color:#eff6ff;font-size:14px;font-weight:600;text-align:center;padding:13px 24px;border-radius:8px;text-decoration:none;font-family:Georgia,'Times New Roman',serif;">
                            ↻ &nbsp; Reactivate ${plan} Plan
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <a href="${env.FRONTEND_URL}/dashboard" style="display:block;background-color:#ffffff;color:#09090b;font-size:14px;font-weight:500;text-align:center;padding:12px 24px;border-radius:8px;text-decoration:none;border:1px solid #e4e4e7;font-family:Georgia,'Times New Roman',serif;">
                            Go to dashboard
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="background-color:#f4f4f5;padding:24px 32px;text-align:center;border-radius:0 0 16px 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 8px auto;">
                      <tr>
                        <td style="background-color:#2b7fff;border-radius:6px;width:24px;height:24px;text-align:center;vertical-align:middle;">
                          <span style="color:#eff6ff;font-size:12px;line-height:24px;font-weight:bold;">🧠</span>
                        </td>
                        <td style="padding-left:6px;vertical-align:middle;">
                          <span style="font-size:13px;font-weight:600;color:#09090b;font-family:Georgia,'Times New Roman',serif;">QuizMind AI</span>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:0 0 10px 0;font-size:12px;color:#71717b;font-family:Georgia,'Times New Roman',serif;">
                      Questions about your cancellation? Reach us at
                      <a href="mailto:support@quizmindai.live" style="color:#2b7fff;text-decoration:none;">support@quizmindai.live</a>
                    </p>
                    <p style="margin:10px 0 0 0;font-size:11px;color:#71717b;font-family:Georgia,'Times New Roman',serif;">
                      &copy; 2026 QuizMind AI &middot; Adaptive learning, powered by AI
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function otpEmailTemplate(name: string, otp: string) {
  return `
  <div style="font-family:sans-serif;background:#f4f4f5;padding:32px 16px;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7;">

      <div style="background:#2b7fff;padding:24px 32px;text-align:center;">
        <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;">🧠 QuizMind AI</span>
      </div>

      <div style="padding:32px;">
        <h2 style="font-size:22px;font-weight:600;margin:0 0 8px;color:#09090b;">Verify your email address</h2>
        <p style="font-size:14px;color:#71717b;margin:0 0 24px;line-height:1.6;">
          Hi ${name}, use the code below to verify your account. It expires in 15 minutes.
        </p>

        <div style="background:#f4f7ff;border:1.5px solid #bfdbfe;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
          <p style="font-size:12px;color:#185FA5;margin:0 0 10px;font-weight:500;text-transform:uppercase;letter-spacing:0.08em;">
            Your verification code
          </p>
          <p style="font-size:36px;font-weight:700;letter-spacing:0.2em;color:#2b7fff;font-family:monospace;margin:0;">
            ${otp}
          </p>
          <p style="font-size:12px;color:#71717b;margin:10px 0 0;">Expires in 15 minutes</p>
        </div>

        <p style="font-size:13px;color:#71717b;line-height:1.6;margin:0 0 24px;">
          If you didn't create a QuizMind AI account, you can safely ignore this email.
        </p>

        <div style="border-top:1px solid #e4e4e7;padding-top:20px;display:flex;justify-content:space-between;">
          <span style="font-size:12px;color:#a1a1aa;">© 2025 QuizMind AI</span>
          <span style="font-size:12px;color:#a1a1aa;">Trusted by 12,000+ educators</span>
        </div>
      </div>
    </div>
  </div>
  `;
}


export function forgotPasswordEmailTemplate(name: string, resetLink: string) {
  return `
  <div style="font-family:sans-serif;background:#f4f4f5;padding:32px 16px;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7;">

      <div style="background:#2b7fff;padding:24px 32px;text-align:center;">
        <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;">🧠 QuizMind AI</span>
      </div>

      <div style="padding:32px;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="width:56px;height:56px;background:#f4f7ff;border:1.5px solid #bfdbfe;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
            <span style="font-size:26px;">🔓</span>
          </div>
          <h2 style="font-size:22px;font-weight:600;margin:0 0 8px;color:#09090b;">Reset your password</h2>
          <p style="font-size:14px;color:#71717b;margin:0;line-height:1.6;">
            Hi ${name}, we received a request to reset the password for your QuizMind AI account.
          </p>
        </div>

        <div style="background:#f9fafb;border:1px solid #e4e4e7;border-radius:12px;padding:16px;margin-bottom:24px;">
          <p style="font-size:13px;color:#71717b;margin:0;line-height:1.6;">
            This link is valid for <strong style="color:#09090b;">30 minutes</strong> and can only be used once.
          </p>
        </div>

        <div style="text-align:center;margin-bottom:24px;">
          <a href="${resetLink}"
            style="display:inline-block;background:#2b7fff;color:#ffffff;font-size:15px;font-weight:500;padding:13px 36px;border-radius:10px;text-decoration:none;">
            Reset my password
          </a>
        </div>

        <div style="background:#f9fafb;border:1px solid #e4e4e7;border-radius:10px;padding:16px;margin-bottom:24px;">
          <p style="font-size:12px;color:#71717b;margin:0 0 6px;">Or copy this link into your browser:</p>
          <p style="font-size:12px;color:#2b7fff;font-family:monospace;margin:0;word-break:break-all;">${resetLink}</p>
        </div>

        <div style="border:1px solid #fde68a;background:#fffbeb;border-radius:10px;padding:16px;margin-bottom:24px;">
          <p style="font-size:13px;color:#92400e;margin:0;line-height:1.6;">
            If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
          </p>
        </div>

        <div style="border-top:1px solid #e4e4e7;padding-top:20px;display:flex;justify-content:space-between;">
          <span style="font-size:12px;color:#a1a1aa;">© 2025 QuizMind AI</span>
          <span style="font-size:12px;color:#a1a1aa;">Trusted by 12,000+ educators</span>
        </div>
      </div>
    </div>
  </div>
  `;
}


export function welcomeEmailTemplate(name: string) {
  const dashboard = `${env.FRONTEND_URL}/dashboard`;
  const discover = `${env.FRONTEND_URL}/discover`;
  return `
  <div style="font-family:sans-serif;background:#f4f4f5;padding:32px 16px;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7;">

      <div style="background:#2b7fff;padding:32px;text-align:center;">
        <div style="font-size:20px;font-weight:700;color:#ffffff;margin-bottom:24px;">🧠 QuizMind AI</div>
        <div style="width:64px;height:64px;background:rgba(255,255,255,0.18);border-radius:18px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
          <span style="font-size:30px;">🎉</span>
        </div>
        <h2 style="color:white;font-size:22px;font-weight:600;margin:0 0 6px;">Welcome to QuizMind AI!</h2>
        <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0;">You're now part of 12,000+ educators worldwide.</p>
      </div>

      <div style="padding:32px;">
        <p style="font-size:14px;color:#71717b;line-height:1.7;margin:0 0 24px;">
          Hi ${name}, your account is all set. Here's everything you can do with QuizMind AI to get started right away.
        </p>

        <div style="margin-bottom:24px;">
          <div style="background:#f9fafb;border:1px solid #e4e4e7;border-radius:12px;padding:14px;margin-bottom:12px;">
            <p style="font-size:14px;font-weight:600;color:#09090b;margin:0 0 3px;">✨ AI question generation</p>
            <p style="font-size:13px;color:#71717b;margin:0;line-height:1.5;">Paste any topic and get quiz questions instantly.</p>
          </div>
          <div style="background:#f9fafb;border:1px solid #e4e4e7;border-radius:12px;padding:14px;margin-bottom:12px;">
            <p style="font-size:14px;font-weight:600;color:#09090b;margin:0 0 3px;">📡 Live & async quiz modes</p>
            <p style="font-size:13px;color:#71717b;margin:0;line-height:1.5;">Schedule live sessions or let students take quizzes anytime.</p>
          </div>
          <div style="background:#f9fafb;border:1px solid #e4e4e7;border-radius:12px;padding:14px;">
            <p style="font-size:14px;font-weight:600;color:#09090b;margin:0 0 3px;">📊 Real-time analytics</p>
            <p style="font-size:13px;color:#71717b;margin:0;line-height:1.5;">Track performance and spot knowledge gaps at a glance.</p>
          </div>
        </div>

        <div style="text-align:center;margin-bottom:24px;">
          <a href="${dashboard}"
            style="display:inline-block;background:#2b7fff;color:#ffffff;font-size:15px;font-weight:500;padding:13px 36px;border-radius:10px;text-decoration:none;">
            Go to my dashboard
          </a>
        </div>

        <div style="background:#f4f7ff;border:1.5px solid #bfdbfe;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
          <p style="font-size:13px;color:#185FA5;margin:0;line-height:1.5;">
            Ready to dive in? <a href="${discover}" style="color:#2b7fff;font-weight:500;">Discover quizzes</a> or reply to this email — we're always happy to help.
          </p>
        </div>

        <div style="border-top:1px solid #e4e4e7;padding-top:20px;display:flex;justify-content:space-between;">
          <span style="font-size:12px;color:#a1a1aa;">© 2025 QuizMind AI</span>
          <span style="font-size:12px;color:#a1a1aa;">Trusted by 12,000+ educators</span>
        </div>
      </div>
    </div>
  </div>
  `;
}

export function paymentSuccessEmailTemplate(
  name: string,
  planName: string,
  amount: string,
  orderId: string,
  paymentMethod: string,
  date: string,
  nextBilling: string
) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Successful – QuizMind AI</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; background-color: #f4f4f5; }
    a { color: inherit; text-decoration: none; }
    @media only screen and (max-width: 640px) {
      .email-container { width: 100% !important; }
      .px-mobile { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f4f5;">
    <tr>
      <td style="padding:40px 16px;">
        <table class="email-container" role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" align="center" style="max-width:640px;width:100%;">
          
          <tr>
            <td style="padding:0 0 24px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="vertical-align:middle;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;">
                      <tr>
                        <td style="background-color:#2b7fff;border-radius:12px;width:36px;height:36px;text-align:center;vertical-align:middle;">
                          <span style="color:#eff6ff;font-size:18px;line-height:36px;font-weight:bold;">&#10022;</span>
                        </td>
                        <td style="padding-left:8px;vertical-align:middle;">
                          <span style="font-size:17px;font-weight:700;color:#09090b;letter-spacing:-0.3px;">QuizMind AI</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="text-align:right;vertical-align:middle;">
                    <span style="font-size:12px;color:#71717b;">Receipt #${orderId}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.07);">
              
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="background-color:#2b7fff;padding:40px 32px;text-align:center;border-radius:16px 16px 0 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                      <tr>
                        <td style="background-color:rgba(239,246,255,0.15);border-radius:14px;width:56px;height:56px;text-align:center;vertical-align:middle;">
                          <span style="color:#eff6ff;font-size:28px;line-height:56px;">&#10003;</span>
                        </td>
                      </tr>
                    </table>
                    <div style="height:16px;"></div>
                    <h1 style="margin:0;font-size:22px;font-weight:700;color:#eff6ff;letter-spacing:-0.3px;">
                      Payment successful &#127881;
                    </h1>
                    <div style="height:6px;"></div>
                    <p style="margin:0;font-size:14px;color:rgba(239,246,255,0.80);">
                      Welcome to QuizMind AI ${planName} &mdash; your upgrade is now active.
                    </p>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td class="px-mobile" style="padding:32px;">
                    <p style="margin:0 0 6px 0;font-size:14px;color:#09090b;">Hi ${name},</p>
                    <p style="margin:0 0 24px 0;font-size:14px;color:#71717b;line-height:1.6;">
                      Thanks for subscribing! Your <strong style="color:#09090b;">${planName}</strong> plan is ready to go. You now have access to AI question generation, detailed analytics, and more.
                    </p>

                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #e4e4e7;border-radius:12px;margin-bottom:16px;">
                      <tr>
                        <td style="padding:20px 24px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="vertical-align:middle;">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td style="background-color:#f4f4f5;border-radius:8px;width:40px;height:40px;text-align:center;vertical-align:middle;">
                                      <span style="color:#2b7fff;font-size:20px;line-height:40px;">&#9889;</span>
                                    </td>
                                    <td style="padding-left:12px;vertical-align:middle;">
                                      <div style="font-size:14px;font-weight:600;color:#09090b;">${planName} Plan</div>
                                      <div style="font-size:12px;color:#71717b;">Billed monthly</div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              <td style="text-align:right;vertical-align:middle;">
                                <span style="background-color:#2b7fff;color:#eff6ff;font-size:12px;font-weight:600;padding:3px 12px;border-radius:999px;">Active</span>
                              </td>
                            </tr>
                          </table>

                          <div style="height:1px;background-color:#e4e4e7;margin:16px 0;"></div>

                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="font-size:14px;font-weight:600;color:#09090b;">Total paid</td>
                              <td style="font-size:18px;font-weight:700;color:#09090b;text-align:right;">${amount}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f4f5;border-radius:12px;margin-bottom:24px;">
                      <tr>
                        <td style="padding:20px 24px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="font-size:14px;color:#71717b;padding-bottom:10px;">Order ID</td>
                              <td style="font-size:14px;font-weight:500;color:#09090b;text-align:right;padding-bottom:10px;">${orderId}</td>
                            </tr>
                            <tr>
                              <td style="font-size:14px;color:#71717b;padding-bottom:10px;">Payment method</td>
                              <td style="font-size:14px;font-weight:500;color:#09090b;text-align:right;padding-bottom:10px;">${paymentMethod}</td>
                            </tr>
                            <tr>
                              <td style="font-size:14px;color:#71717b;padding-bottom:10px;">Date</td>
                              <td style="font-size:14px;font-weight:500;color:#09090b;text-align:right;padding-bottom:10px;">${date}</td>
                            </tr>
                            <tr>
                              <td style="font-size:14px;color:#71717b;">Next billing</td>
                              <td style="font-size:14px;font-weight:500;color:#09090b;text-align:right;">${nextBilling}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom:10px;">
                          <a href="${env.FRONTEND_URL}/dashboard" style="display:block;background-color:#2b7fff;color:#eff6ff;font-size:14px;font-weight:600;text-align:center;padding:13px 24px;border-radius:8px;text-decoration:none;">
                            &#9783; &nbsp; Go to dashboard
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="background-color:#f4f4f5;padding:24px 32px;text-align:center;border-radius:0 0 16px 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 8px auto;">
                      <tr>
                        <td style="background-color:#2b7fff;border-radius:6px;width:24px;height:24px;text-align:center;vertical-align:middle;">
                          <span style="color:#eff6ff;font-size:12px;line-height:24px;font-weight:bold;">&#10022;</span>
                        </td>
                        <td style="padding-left:6px;vertical-align:middle;">
                          <span style="font-size:13px;font-weight:600;color:#09090b;">QuizMind AI</span>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:0 0 10px 0;font-size:12px;color:#71717b;">
                      Questions? Reach us at <a href="mailto:support@quizmindai.live" style="color:#2b7fff;text-decoration:none;">support@quizmindai.live</a>
                    </p>
                    <p style="margin:10px 0 0 0;font-size:11px;color:#71717b;">
                      &copy; 2026 QuizMind AI &middot; Adaptive learning, powered by AI
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
