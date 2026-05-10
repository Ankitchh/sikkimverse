import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM = process.env.EMAIL_FROM ?? 'SIKKIMVERSE <noreply@sikkimverse.in>'
const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://sikkimverse.in'

interface SendResult {
  success: boolean
  messageId?: string
  error?: string
}

async function sendMail(to: string, subject: string, html: string): Promise<SendResult> {
  if (!resend) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Email - DEV MODE]', { to, subject })
      console.log(html.replace(/<[^>]+>/g, ''))
    }
    return { success: true, messageId: 'dev-mode' }
  }

  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html })
    if (error) return { success: false, error: error.message }
    return { success: true, messageId: data?.id }
  } catch (err) {
    console.error('[Email] send error:', err)
    return { success: false, error: 'Email delivery failed' }
  }
}

// ─── Email templates ──────────────────────────────────────────────────────────

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SIKKIMVERSE</title>
  <style>
    body { margin: 0; padding: 0; background: #f5f5f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1a5c3a 0%, #2d7a52 100%); padding: 32px 40px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.75); margin: 4px 0 0; font-size: 13px; }
    .body { padding: 40px; }
    .body p { color: #374151; line-height: 1.7; margin: 0 0 16px; }
    .btn { display: inline-block; background: #1a5c3a; color: #fff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; margin: 16px 0; }
    .code { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 20px; font-family: monospace; font-size: 20px; font-weight: 700; letter-spacing: 4px; color: #1a5c3a; text-align: center; margin: 16px 0; }
    .footer { background: #f9fafb; padding: 20px 40px; border-top: 1px solid #e5e7eb; }
    .footer p { color: #9ca3af; font-size: 12px; margin: 0; text-align: center; line-height: 1.6; }
    .warning { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; margin: 16px 0; }
    .warning p { color: #92400e; font-size: 13px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏔️ SIKKIMVERSE</h1>
      <p>Indigenous Heritage Platform</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>SIKKIMVERSE · Preserving Sikkim's Indigenous Languages &amp; Culture<br>
      You're receiving this because you have an account on SIKKIMVERSE.<br>
      If you didn't request this email, please ignore it.</p>
    </div>
  </div>
</body>
</html>`
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string,
): Promise<SendResult> {
  const link = `${BASE_URL}/auth/verify-email?token=${token}`
  return sendMail(
    to,
    'Verify your SIKKIMVERSE email address',
    baseTemplate(`
      <p>Hello ${name || 'there'},</p>
      <p>Thank you for joining SIKKIMVERSE! Please verify your email address to unlock all features of the platform.</p>
      <div style="text-align:center">
        <a href="${link}" class="btn">Verify Email Address</a>
      </div>
      <div class="warning">
        <p>⏱ This link expires in 24 hours. If it expires, you can request a new one from your settings.</p>
      </div>
      <p>Or copy this link into your browser:<br><small style="color:#6b7280;word-break:break-all">${link}</small></p>
    `),
  )
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string,
): Promise<SendResult> {
  const link = `${BASE_URL}/auth/reset-password?token=${token}`
  return sendMail(
    to,
    'Reset your SIKKIMVERSE password',
    baseTemplate(`
      <p>Hello ${name || 'there'},</p>
      <p>We received a request to reset the password for your SIKKIMVERSE account. Click the button below to set a new password.</p>
      <div style="text-align:center">
        <a href="${link}" class="btn">Reset Password</a>
      </div>
      <div class="warning">
        <p>⏱ This link expires in 1 hour and can only be used once. If you didn't request a password reset, no action is needed.</p>
      </div>
    `),
  )
}

export async function sendWelcomeEmail(to: string, name: string): Promise<SendResult> {
  return sendMail(
    to,
    'Welcome to SIKKIMVERSE — Your heritage journey begins',
    baseTemplate(`
      <p>Hello ${name || 'there'}, welcome to <strong>SIKKIMVERSE</strong>!</p>
      <p>You've joined a platform dedicated to preserving and celebrating Sikkim's indigenous languages and cultures. Here's how to get started:</p>
      <ul style="color:#374151;line-height:2">
        <li>🌿 <strong>Explore Communities</strong> — discover the 10 indigenous communities</li>
        <li>📚 <strong>Start Learning</strong> — begin your first language course</li>
        <li>🎤 <strong>Contribute</strong> — upload words, stories, and recordings</li>
        <li>🏆 <strong>Earn XP</strong> — level up and unlock achievements</li>
      </ul>
      <div style="text-align:center">
        <a href="${BASE_URL}/learn" class="btn">Start Learning</a>
      </div>
      <p style="font-style:italic;color:#6b7280">"Every word learned is a bridge to a living culture."</p>
    `),
  )
}

export async function sendSubscriptionConfirmationEmail(
  to: string,
  name: string,
  planName: string,
  amount: string,
  nextBillingDate: Date,
): Promise<SendResult> {
  return sendMail(
    to,
    `Your SIKKIMVERSE ${planName} subscription is active`,
    baseTemplate(`
      <p>Hello ${name || 'there'},</p>
      <p>Your <strong>${planName}</strong> subscription is now active. Thank you for supporting indigenous language preservation!</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:10px;background:#f9fafb;border-radius:8px 8px 0 0;color:#6b7280;font-size:13px">Plan</td><td style="padding:10px;background:#f9fafb;border-radius:8px 8px 0 0;font-weight:600">${planName}</td></tr>
        <tr><td style="padding:10px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px">Amount</td><td style="padding:10px;border-top:1px solid #e5e7eb;font-weight:600">${amount}</td></tr>
        <tr><td style="padding:10px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px">Next billing</td><td style="padding:10px;border-top:1px solid #e5e7eb;font-weight:600">${nextBillingDate.toLocaleDateString('en-IN', { dateStyle: 'long' })}</td></tr>
      </table>
      <p>45% of subscription revenue goes directly to the indigenous communities whose content you enjoy. Your subscription makes a real difference.</p>
      <div style="text-align:center">
        <a href="${BASE_URL}/dashboard" class="btn">Go to Dashboard</a>
      </div>
    `),
  )
}

export async function sendPaymentFailedEmail(
  to: string,
  name: string,
  planName: string,
): Promise<SendResult> {
  return sendMail(
    to,
    'SIKKIMVERSE — Payment failed, action required',
    baseTemplate(`
      <p>Hello ${name || 'there'},</p>
      <p>We were unable to process your payment for <strong>${planName}</strong>. Your subscription access may be paused until payment is resolved.</p>
      <div style="text-align:center">
        <a href="${BASE_URL}/settings/billing" class="btn">Update Payment Method</a>
      </div>
      <div class="warning">
        <p>⚠️ If payment is not resolved within 7 days, your subscription will be canceled automatically.</p>
      </div>
    `),
  )
}
