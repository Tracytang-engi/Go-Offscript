import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { env } from '../../config/env';

const OTP_SUBJECT = 'Your Go Off Script verification code';

const otpHtml = (otp: string) => `
  <div style="font-family:sans-serif;max-width:480px;margin:auto">
    <h2 style="color:#E8603A">Go Off Script ✦</h2>
    <p>Here's your verification code:</p>
    <h1 style="letter-spacing:8px;color:#1a1a1a">${otp}</h1>
    <p style="color:#888">This code expires in 15 minutes. If you didn't request this, ignore this email.</p>
  </div>
`;

const otpText = (otp: string) =>
  `Your verification code is: ${otp}\n\nThis code expires in 15 minutes.`;

/**
 * Prefer Resend HTTP API — Render frequently times out on outbound Gmail SMTP
 * (ETIMEDOUT / ENETUNREACH). SMTP remains a local/dev fallback only.
 */
export const sendOtpEmail = async (to: string, otp: string) => {
  if (env.RESEND_API_KEY) {
    await sendViaResend(to, otp);
    return;
  }

  if (env.SMTP_USER && env.SMTP_PASS) {
    console.warn(
      '[Auth] RESEND_API_KEY not set — trying SMTP. This often times out on Render; prefer Resend.'
    );
    await sendViaSmtp(to, otp);
    return;
  }

  console.warn('[Auth] No email provider configured — OTP (dev only):', otp);
};

const sendViaResend = async (to: string, otp: string) => {
  const from = env.EMAIL_FROM || 'Go Off Script <onboarding@resend.dev>';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: OTP_SUBJECT,
      html: otpHtml(otp),
      text: otpText(otp),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend ${res.status}: ${body}`);
  }
  console.log(`[Auth] OTP email sent via Resend to ${to}`);
};

const sendViaSmtp = async (to: string, otp: string) => {
  const options: SMTPTransport.Options = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 15_000,
    ...({ family: 4 } as object),
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  };
  const transporter = nodemailer.createTransport(options);
  await transporter.sendMail({
    from: `"Go Off Script" <${env.SMTP_USER}>`,
    to,
    subject: OTP_SUBJECT,
    text: otpText(otp),
    html: otpHtml(otp),
  });
  console.log(`[Auth] OTP email sent via SMTP to ${to}`);
};
