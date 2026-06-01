import { env } from "../config/env";

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
