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
