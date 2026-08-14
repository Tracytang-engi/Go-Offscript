import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import type { RegisterDto, LoginDto } from './auth.schema';

const signToken = (userId: string, email: string) =>
  jwt.sign({ userId, email }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);

// ── Mailer ────────────────────────────────────────────────────────────────────

const createTransporter = () => {
  if (!env.SMTP_USER || !env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
};

const sendOtpEmail = async (to: string, otp: string) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn('[Auth] SMTP not configured — skipping OTP email. OTP:', otp);
    return;
  }
  await transporter.sendMail({
    from: `"Go Off Script" <${env.SMTP_USER}>`,
    to,
    subject: 'Your Go Off Script verification code',
    text: `Your verification code is: ${otp}\n\nThis code expires in 15 minutes.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#E8603A">Go Off Script ✦</h2>
        <p>Here's your verification code:</p>
        <h1 style="letter-spacing:8px;color:#1a1a1a">${otp}</h1>
        <p style="color:#888">This code expires in 15 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// ── Auth functions ────────────────────────────────────────────────────────────

export const register = async (dto: RegisterDto) => {
  const existing = await prisma.user.findUnique({ where: { email: dto.email } });
  if (existing) throw new AppError('Email already in use', 409);

  const hashedPassword = await bcrypt.hash(dto.password, 12);
  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const otpExp = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  const user = await prisma.user.create({
    data: {
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      emailVerified: false,
      emailOtp: hashedOtp,
      emailOtpExp: otpExp,
      profile: { create: {} },
    },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  // Fire-and-forget — don't block registration if email fails
  sendOtpEmail(dto.email, otp).catch((err) =>
    console.error('[Auth] Failed to send OTP email:', err)
  );

  return { user };
};

export const login = async (dto: LoginDto) => {
  const user = await prisma.user.findUnique({ where: { email: dto.email } });
  if (!user) throw new AppError('Invalid credentials', 401);

  const valid = await bcrypt.compare(dto.password, user.password);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const token = signToken(user.id, user.email);
  const { password: _, emailOtp: __, emailOtpExp: ___, ...safeUser } = user;
  return { user: safeUser, token };
};

export const sendOtp = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('User not found', 404);

  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const otpExp = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.user.update({
    where: { email },
    data: { emailOtp: hashedOtp, emailOtpExp: otpExp },
  });

  await sendOtpEmail(email, otp);
  return { sent: true };
};

export const verifyOtp = async (email: string, otp: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('User not found', 404);
  if (!user.emailOtp || !user.emailOtpExp) throw new AppError('No OTP requested', 400);
  if (new Date() > user.emailOtpExp) throw new AppError('OTP expired', 400);

  const valid = await bcrypt.compare(otp, user.emailOtp);
  if (!valid) throw new AppError('Invalid OTP', 400);

  await prisma.user.update({
    where: { email },
    data: { emailVerified: true, emailOtp: null, emailOtpExp: null },
  });

  const token = signToken(user.id, user.email);
  const { password: _, emailOtp: __, emailOtpExp: ___, ...safeUser } = user;
  return { user: { ...safeUser, emailVerified: true }, token };
};
