import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import type { RegisterDto, LoginDto } from './auth.schema';
import { sendOtpEmail } from './mailer';

const signToken = (userId: string, email: string) =>
  jwt.sign({ userId, email }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);

// ── Helpers ───────────────────────────────────────────────────────────────────

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const dispatchOtp = (email: string, otp: string) =>
  sendOtpEmail(email, otp).catch((err) => {
    console.error('[Auth] Failed to send OTP email:', err);
    // Temporary aid while email provider is being fixed — check Render logs
    console.warn(`[Auth] OTP for ${email} (log only, not emailed): ${otp}`);
  });

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
  void dispatchOtp(dto.email, otp);

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

  await dispatchOtp(email, otp);
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
